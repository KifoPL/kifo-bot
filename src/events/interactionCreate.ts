import { BaseInteraction, Events } from 'discord.js';
import type { KifoClient } from '../interfaces/discordExtensions.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction: BaseInteraction) {
        if (!interaction.isChatInputCommand()) return;

        const command = await (<KifoClient>interaction.client).commands.get(
            interaction.commandName
        );

        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`
            );
            return;
        }

        try {
            console.info(`Executing command ${interaction.commandName}...`);
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};
