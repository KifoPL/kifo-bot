import { Events } from 'discord.js';
export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand())
            return;
        const command = await interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            console.info(`Executing command ${interaction.commandName}...`);
            await command.execute(interaction);
        }
        catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};
//# sourceMappingURL=interactionCreate.js.map