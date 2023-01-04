// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

import {
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
} from 'discord.js';
import type { KifoChatInputCommand } from '../../../interfaces/discordExtensions.js';
import { kifoEmbed } from '../../../helpers/embed.js';
import { dbFacade } from '../../../data/mySqlAccess.js';

const builder = new SlashCommandBuilder();

builder
    .setName('react')
    .setDescription(
        'React to all messages in the channel with specific reactions.'
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .setDMPermission(false)
    .addSubcommand((subcommand) => {
        return subcommand
            .setName('on')
            .setDescription('Add reactions to all messages in the channel.')
            .addStringOption((option) => {
                return option
                    .setName('reactions')
                    .setDescription(
                        'The reactions to add to messages. Separate with spaces, or commas.'
                    )
                    .setRequired(true);
            });
    })
    .addSubcommand((subcommand) => {
        return subcommand
            .setName('off')
            .setDescription(
                'Remove reactions from all messages in the channel.'
            );
    })
    .addSubcommand((subcommand) => {
        return subcommand
            .setName('list')
            .setDescription('List all reactions on messages in the channel.');
    })
    .addSubcommand((subcommand) => {
        return subcommand
            .setName('check')
            .setDescription(
                'Check if the `react` command is enabled in this channel.'
            );
    });

const React: KifoChatInputCommand = {
    data: builder,
    execute: async (interaction) => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'on') {
            await interaction.deferReply();
            await on(interaction);
        }

        if (subcommand === 'off') {
            await interaction.deferReply();
            await interaction.editReply({
                embeds: [kifoEmbed('Off not implemented yet.')],
            });
        }

        if (subcommand === 'list') {
            await interaction.deferReply();
            await list(interaction);
        }

        if (subcommand === 'check') {
            await interaction.deferReply({ ephemeral: true });
            await check(interaction);
        }
    },
};

async function on(interaction: ChatInputCommandInteraction) {
    const reactions = interaction.options.getString('reactions')!.split(' ');

    if (reactions.length > 20) {
        await interaction.editReply({
            embeds: [
                kifoEmbed(
                    `Too many reactions! The limit is 20, and you put ${reactions.length}.`
                ),
            ],
        });
    }

    const isEnabled =
        (
            await dbFacade
                .query<{
                    Id: number;
                    ChannelId: number;
                    emote: string;
                }>(
                    `SELECT Id, ChannelId, emote FROM react WHERE ChannelId = ?`,
                    [interaction.channelId]
                )
                .catch((err) => {
                    throw err;
                })
        ).length > 0;

    if (isEnabled) {
        await interaction.editReply({
            embeds: [
                kifoEmbed('The command is already enabled in this channel.'),
            ],
        });
        return;
    }

    for (const reaction of reactions) {
        // TODO finish checking if reactions are legit
    }
}

async function check(interaction: ChatInputCommandInteraction) {
    const result = await dbFacade
        .query<{
            Id: number;
            ChannelId: number;
            emote: string;
        }>(`SELECT Id, ChannelId, emote FROM react WHERE ChannelId = ?`, [
            interaction.channelId,
        ])
        .catch((err) => {
            throw err;
        });

    let message = `React command is **${
        result.length > 0 ? 'en' : 'dis'
    }abled** in this channel.`;

    if (result.length > 0) {
        message += `\n\nReactions: \n- ${result
            .map((r) => r.emote)
            .join('\n- ')}`;
    }

    await interaction.editReply({
        embeds: [kifoEmbed(message, 'React CMD Check')],
    });
}

async function list(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;

    if (guild === null) {
        throw new Error('Guild is null.');
    }

    const result = await dbFacade.query<{ ChannelId: number; emotes: string }>(
        `SELECT ChannelId, GROUP_CONCAT(emote SEPARATOR ', ') AS emotes FROM react GROUP BY ChannelId ORDER BY ChannelId`,
        [interaction.channelId]
    );

    let message = `Reactions enabled in this server:\n`;
    let channelsCount = 0;

    result.forEach((row) => {
        if (guild.channels.resolve(row.ChannelId.toString()) !== null) {
            channelsCount++;
            message += `\n<#${row.ChannelId}>: ${row.emotes}`;
        }
    });

    message += `\n\nTotal channels: ${channelsCount}`;

    await interaction.editReply({
        embeds: [kifoEmbed(message, 'React CMD List')],
    });
}

export default React;
