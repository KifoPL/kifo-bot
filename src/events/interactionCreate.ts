// kifo-bot copyright (C) 2022 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions; type `show c' for details.

import {
    BaseInteraction,
    ChatInputCommandInteraction,
    Events,
} from 'discord.js';
import type { KifoClient } from '../interfaces/discordExtensions.js';
import { logger } from '../helpers/logger.js';
import { kifoEmbed } from '../helpers/embed.js';

export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: BaseInteraction) {
        if (interaction.isChatInputCommand()) {
            await HandleChatInputCommand(
                <ChatInputCommandInteraction>interaction
            );
        }
    },
};

export async function HandleChatInputCommand(
    interaction: ChatInputCommandInteraction
) {
    const command = await (<KifoClient>interaction.client).commands.get(
        interaction.commandName
    );

    if (!command) {
        logger.error(
            `No command matching ${interaction.commandName} was found.`
        );
        return;
    }

    // Logs the slash command with timestamp and options
    logger.info(`${interaction.id} slash command received`, {
        command: interaction.commandName,
        options: interaction.options.data.map((option) => {
            return { name: option.name, value: option.value };
        }),
    });

    const time = new Date().getTime();

    command.execute(interaction).then(() => {
        const timeTaken = new Date().getTime() - time;
        logger.info(`${interaction.id} slash command ${interaction.commandName} took ${timeTaken}ms`);
    }).catch((error) => {
        logger.error(error);
        logger.trace(error);
        try {
            // Try to notify user of an error
            if (interaction.isRepliable()) {
                interaction
                    .reply({
                        embeds: [
                            kifoEmbed(
                                'There was an error while executing this command!'
                            ),
                        ],
                    })
                    .catch((_) => {
                        interaction
                            .editReply({
                                embeds: [
                                    kifoEmbed(
                                        'There was an error while executing this command!'
                                    ),
                                ],
                            })
                            .catch((_) => {});
                    });
            }
        } catch (err) {
            logger.error(err);
        }
    });
}
