// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

import type { KifoChatInputCommand } from '../../../interfaces/discordExtensions.js';
import {
    ChannelType,
    ChatInputCommandInteraction,
    Collection,
    EmbedBuilder,
    GuildTextBasedChannel,
    Message,
    parseEmoji,
    PermissionsBitField,
    SlashCommandBuilder,
    time,
} from 'discord.js';

import ms from 'ms';
import { kifoEmbed } from '../../../helpers/embed.js';
import { logger } from '../../../helpers/logger.js';

import numeral from 'numeral';

const builder = new SlashCommandBuilder();

builder
    .setName('top')
    .setDescription(
        'Lists top x messages with the most reactions in the specified channel'
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .setDMPermission(false)
    .addIntegerOption((option) => {
        return option
            .setName('count')
            .setDescription('The number of messages to list')
            .setMinValue(1)
            .setMaxValue(10)
            .setRequired(true);
    })
    .addStringOption((option) => {
        return option
            .setName('time_period')
            .setDescription('The time period to search for messages, e.g. "1d"')
            .setRequired(true);
    })
    .addChannelOption((option) => {
        return option
            .setName('channel')
            .setDescription('The channel to get messages from')
            .addChannelTypes(
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement
            )
            .setRequired(true);
    })
    .addStringOption((option) => {
        return option
            .setName('emoji')
            .setDescription('The emoji to search for')
            .setRequired(true);
    });

const Top: KifoChatInputCommand = {
    data: builder,
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const count = interaction.options.getInteger('count') ?? 1;
        const timePeriod = interaction.options.getString('time_period') ?? '1d';
        const channelId = interaction.options.getChannel('channel')?.id!;
        const emoji = interaction.options.getString('emoji') ?? '👍';

        if (isNaN(ms(timePeriod))) {
            await interaction.reply({
                content: 'Invalid time period',
                embeds: [kifoEmbed('Invalid time period', 'Error:')],
                ephemeral: true,
            });
            return;
        }

        const channel = interaction.guild!.channels.resolve(
            channelId
        ) as GuildTextBasedChannel | null;

        if (channel === null) {
            await interaction.reply({
                embeds: [
                    kifoEmbed(
                        'Invalid channel - perhaps I do not have access to it?',
                        'Error:'
                    ),
                ],
                ephemeral: true,
            });
            return;
        }

        const parsedEmoji = parseEmoji(emoji);

        if (parsedEmoji === null) {
            await interaction.reply({
                embeds: [
                    kifoEmbed(`"${emoji}" is not a valid emoji.`, 'Error:'),
                ],
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply();

        channel?.messages.fetch({ cache: false });

        const allMessages = await fetchAllMessages(channel, timePeriod);

        const messagesWithReactions = allMessages.filter((message) => {
            return message.reactions.cache.has(parsedEmoji.id ?? emoji);
        });

        logger.debug(
            `Found ${messagesWithReactions.size} messages with reactions.`
        );

        if (messagesWithReactions.size === 0) {
            await interaction.editReply({
                embeds: [
                    kifoEmbed(
                        'No messages with that emoji were found in that time period.'
                    ),
                ],
            });
            return;
        }

        const sortedMessages = messagesWithReactions.sort((a, b) => {
            const aReaction = a.reactions.cache.get(parsedEmoji.id ?? emoji)!;
            const bReaction = b.reactions.cache.get(parsedEmoji.id ?? emoji)!;

            return bReaction.count - aReaction.count;
        });

        logger.debug(`Sorted ${sortedMessages.size} messages.`);

        const topMessages = [
            ...new Set(
                sortedMessages.map(
                    (message) =>
                        message.reactions.cache.get(parsedEmoji.id ?? emoji)!
                            .count
                )
            ),
        ]
            .slice(0, count)
            .map((count) => ({
                count: count,
                items: sortedMessages.filter(
                    (m) =>
                        m.reactions.cache.get(parsedEmoji.id ?? emoji)!
                            .count === count
                ),
            }));

        logger.debug(
            'Ranked messages',
            topMessages.map((e) => {
                return { count: e.count, items: e.items.map((e) => e.id) };
            })
        );

        let embed = new EmbedBuilder();

        await interaction.editReply({
            embeds: [
                kifoEmbed(
                    `The top ${count} messages with the most "${emoji}" since ${time(
                        ms(timePeriod),
                        'R'
                    )} in ${channel} are:`
                ),
            ],
        });

        for (let i = 0; i < topMessages.length; i++) {
            const rank = topMessages[i]!;
            const positionStr = numeral(i + 1).format('0o');

            for (const item of rank.items) {
                // TODO if there is more than 5 items, ask for confirmation to send the remaining items
                const message = item[1]!;
                const attachments = message.attachments;

                embed = kifoEmbed(
                    message.content.length > 512
                        ? message.content.slice(0, 509) + '...'
                        : message.content,
                    `${positionStr} post by ${message.author.tag} **${rank.count}** ${emoji}`
                )
                    .setURL(message.url)
                    .setThumbnail(
                        message.author.displayAvatarURL({
                            size: 128,
                            extension: 'webp',
                        })
                    );

                if (
                    attachments.size > 0 &&
                    attachments.first()!.contentType === 'image/png'
                ) {
                    embed!.setImage(attachments.first()!.url);
                }
                await interaction.followUp({ embeds: [embed] });
            }
        }
    },
};

async function fetchAllMessages(
    channel: GuildTextBasedChannel,
    timePeriod: string
): Promise<Collection<string, Message<true>>> {
    const timePeriodMs = ms(timePeriod);
    const now = new Date();
    const from = new Date(now.getTime() - timePeriodMs);
    let i = 1;
    logger.debug(`Fetching batch no. ${i} of messages from ${channel.name}...`);
    let currentFetchedMessages = await channel.messages
        .fetch({
            cache: true,
            limit: 100,
        })
        .then((messages) =>
            messages.filter((message) => message.createdAt >= from)
        );
    let allFetchedMessages = currentFetchedMessages;

    while (currentFetchedMessages.size === 100) {
        i++;
        logger.debug(
            `Fetching batch no. ${i} of messages from ${channel.name}...`
        );
        const lastMessage = currentFetchedMessages.last()!;
        currentFetchedMessages = await channel.messages
            .fetch({
                cache: true,
                limit: 100,
                before: lastMessage.id,
            })
            .then((messages) =>
                messages.filter((message) => message.createdAt >= from)
            );
        allFetchedMessages = allFetchedMessages.concat(currentFetchedMessages);
    }

    logger.debug(
        `Fetched ${allFetchedMessages.size} messages from #${channel.name}.`
    );

    return allFetchedMessages;
}

export default Top;
