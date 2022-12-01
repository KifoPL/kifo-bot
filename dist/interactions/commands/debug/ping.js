import { SlashCommandBuilder } from 'discord.js';
const Ping = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Tests if the bot is able to reply'),
    async execute(interaction) {
        await interaction.reply('pong!');
    },
};
export default Ping;
//# sourceMappingURL=ping.js.map