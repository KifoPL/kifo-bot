// kifo-bot copyright (C) 2022 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions; type `show c' for details.

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { KifoChatInputCommand } from '../../../interfaces/discordExtensions.js';

const builder = new SlashCommandBuilder();

builder
    .setName('ping')
    .setDescription('Tests if the bot is able to reply')
    .addStringOption((option) =>
        option.setName('reply').setDescription('The reply to send')
    );

const Ping: KifoChatInputCommand = {
    data: builder,
    async execute(interaction: ChatInputCommandInteraction) {
        let reply = interaction.options.getString('reply') ?? 'Pong!';
        await interaction.editReply({ content: reply.toString()});
    },
};

export default Ping;
