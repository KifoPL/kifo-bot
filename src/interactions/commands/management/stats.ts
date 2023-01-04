// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

import {
    ChannelType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Guild,
    GuildMember,
    Role,
    SlashCommandBuilder,
    userMention,
} from 'discord.js';
import type { KifoChatInputCommand } from '../../../interfaces/discordExtensions.js';
import { kifoEmbed } from '../../../helpers/embed.js';
import { logger } from '../../../helpers/logger.js';
import ms from 'ms';

import api from 'axios';
import numeral from 'numeral';
import { plural } from '../../../helpers/plural.js';

const builder = new SlashCommandBuilder();
builder
    .setName('stats')
    .setDescription('Displays stats for given user, bot, role, or server.')
    .setDMPermission(false)
    .addMentionableOption((option) => {
        return option
            .setName('mention')
            .setDescription(
                'The user, bot, role, channel to get stats for. Omit to get stats for the server.'
            )
            .setRequired(false);
    });

const execute = async (interaction: ChatInputCommandInteraction) => {
    const mention = interaction.options.getMentionable('mention', false);

    await interaction.deferReply();

    if (mention === null) {
        logger.debug('Generating server stats...');
        const guild = (await interaction.guild?.fetch()) as Guild | undefined;

        if (guild === undefined) {
            logger.error('Failed to get guild.');
            return;
        }

        await interaction.editReply({
            embeds: [await getServerStats(guild as Guild)],
        });
        return;
    }

    if (mention instanceof GuildMember) {
        logger.debug(`Generating user stats for ${mention.user.tag}...`);
        await interaction.editReply({ embeds: [await getUserStats(mention)] });
        return;
    }

    if (mention instanceof Role) {
        logger.debug(`Generating role stats for ${mention.name}...`);
        await interaction.editReply({ embeds: [await getRoleStats(mention)] });
        return;
    }

    logger.debug(`Unknown mention type: ${mention}, ${typeof mention}`);
    await interaction.editReply({
        embeds: [kifoEmbed('Error', 'Unknown mention type.')],
    });
};

const Stats: KifoChatInputCommand = {
    data: builder,
    execute,
};

export async function getServerStats(guild: Guild): Promise<EmbedBuilder> {
    if (guild === undefined) {
        logger.error('Guild is undefined');
        throw new ReferenceError('Guild is undefined');
    }

    const time = new Date();

    const owner = await guild.fetchOwner();
    let botCount = 0;
    let onlineCount = 0;
    let usersCount = 0;
    let serverRoleCount = 0;

    let channelCount = 0;
    let channelVoiceCount = 0;
    let channelTextCount = 0;
    let channelCategoryCount = 0;

    logger.debug('Counting roles...');
    await guild.roles.fetch();
    serverRoleCount = guild.roles.cache.size - 1; // -1 because of @everyone role

    logger.debug('Counting members...');
    await guild.members.fetch();
    guild.members.cache.each((member) => {
        if (member.user.bot) {
            botCount++;
        } else usersCount++;
        if (
            !member.user.bot &&
            member.presence?.status !== undefined &&
            member.presence.status !== 'offline' &&
            member.presence.status !== 'invisible'
        ) {
            onlineCount++;
        }
    });

    logger.debug('Counting channels...');
    await guild.channels.fetch();
    channelCount = guild.channels.cache.size;
    guild.channels.cache.each((channel) => {
        if (channel.isVoiceBased()) channelVoiceCount++;
        if (channel.isTextBased() && channel.type !== ChannelType.GuildVoice)
            channelTextCount++;
        if (channel.type === ChannelType.GuildCategory) channelCategoryCount++;
    });

    let serverTime = time.getTime() - guild.createdAt.getTime();

    logger.debug('Generating embed...');
    return kifoEmbed(
        `${guild.description ?? 'No description set.'}`,
        `${guild.name} • stats`
    )
        .setThumbnail(
            guild.iconURL({ extension: 'webp', size: 64, forceStatic: false })
        )
        .setImage(
            guild.bannerURL({
                extension: 'webp',
                size: 512,
                forceStatic: false,
            })
        )
        .setFooter({
            text: `Server created at ${guild.createdAt.toUTCString()}, it is ${ms(
                serverTime,
                { long: true }
            )} old.`,
        })
        .addFields([
            {
                name: 'Member Count:',
                value: `Users: <:offline:823658022957613076> ${usersCount} (<:online:823658022974521414> ${onlineCount} online), 🤖 Bots: ${botCount}, Total: ${guild.memberCount}`,
            },
            {
                name: 'Boosts Status:',
                value: `<:boost:823658698412392449> ${guild.premiumTier}, thanks to ${guild.premiumSubscriptionCount} boost${plural(guild.premiumSubscriptionCount ?? 0)}.`,
            },
            {
                name: `Roles`,
                value: `<:role:823658022948700240> ${serverRoleCount}`,
                inline: true,
            },
            {
                name: `<:owner:823658022785908737> Owner`,
                value: `${
                    owner.nickname == undefined
                        ? 'No nickname set,'
                        : `${owner.nickname}, AKA`
                } ${owner.user.tag}.`,
                inline: true,
            },
            {
                name: `Channels`,
                value: `<:voice:823658022684721164> ${channelVoiceCount} voice channel${
                    plural(channelVoiceCount)
                }, <:textchannel:823658022849085512> ${channelTextCount} text channel${
                    plural(channelTextCount)
                } (excluding threads), <:categoryNEW:842672130420506625> ${channelCategoryCount} categor${
                    plural(channelCategoryCount, 'y', 'ies')
                }, Total: ${channelCount}.`,
            },
            {
                name: 'More',
                value: '❗ If you want this command to have more stats, reach out to bot developer (KifoPL#3358, <@289119054130839552>)!',
            },
        ]);
}

export async function getUserStats(user: GuildMember): Promise<EmbedBuilder> {
    return kifoEmbed(
        `User stats of user ${userMention(user.id)}`,
        'User stats are not implemented yet.'
    );
}

export async function getRoleStats(role: Role): Promise<EmbedBuilder> {
    logger.debug('Fetching guild...');
    const guild = await role.guild.fetch();
    const serverRoleCount = guild.roles.cache.size - 1; // -1 because of @everyone role
    const roleCreationAt = role.createdAt.getTime();
    const perms = role.permissions.toArray();
    const membersInRoleCount = role.members.size;

    logger.debug('Fetching name of colour...');
    const color = await api
        .get('http://www.thecolorapi.com/id', {
            params: { hex: role.hexColor.slice(1) },
        })
        .then((res) => {
            logger.debug(
                `Response from colour API: ${res.status} ${res.statusText}`, res.data?.name
            );
            return res;
        });

    logger.debug('Generating embed...');
    return kifoEmbed(
        `<:hoist:823907804141322311> <@&${role.id}>, Id ${role.id}`,
        `${role.name} • stats`
    )
        .setFooter({
            text: `Role created at ${role.createdAt.toUTCString()} - ${ms(
                new Date().getTime() - roleCreationAt,
                { long: true }
            )} ago, ${ms(role.createdAt.getTime() - guild.createdAt.getTime(), {
                long: true,
            })} after server creation.`,
        })
        .setThumbnail(
            role.iconURL({ size: 64, extension: 'webp', forceStatic: false })
        )
        .addFields([
            {
                name: `Colour:`,
                value: `${role.hexColor}${
                    color.status === 200 ? `\n${color.data.name?.value}` : ``
                }`,
                inline: true,
            },
            {
                name: `Position:`,
                // The position of roles is descending and ends at 0.
                value: `${numeral(
                    role.guild.roles.highest?.rawPosition - role.rawPosition + 1
                ).format('0o')} out of ${serverRoleCount}`,
                inline: true,
            },
            {
                name: `Members with this role:`,
                value: `${membersInRoleCount}`,
                inline: true,
            },
            {
                name: `Is managed by external service?`,
                value: `${role.managed ? 'Yes.' : 'No.'}`,
                inline: true,
            },
            {
                name: `Is hoisted (visible in user list)?`,
                value: `${role.hoist ? 'Yes.' : 'No.'}`,
                inline: true,
            },
            {
                name: `Is mentionable by everyone?`,
                value: `${role.mentionable ? 'Yes.' : 'No.'}`,
                inline: true,
            },
            {
                name: `Permissions:`,
                value: `${perms.length != 0 ? perms.join(', ') : 'none'}`,
            },
            {
                name: 'More',
                value: '❗ If you want this command to have more stats, reach out to bot developer (KifoPL#3358, <@289119054130839552>)!',
            },
        ]);
}

export default Stats;
