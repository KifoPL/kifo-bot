import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { KifoCommand } from '../../../interfaces/discordExtensions.js';

const Ping: KifoCommand = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Tests if the bot is able to reply'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('pong!');
    },
};

export default Ping;
