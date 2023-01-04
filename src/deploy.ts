// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

import type { KifoChatInputCommand } from './interfaces/discordExtensions.js';
import { Collection, Events, REST, Routes } from 'discord.js';
import { setAllCommands } from './helpers/fileHelpers.js';
import { client, config, env, Environment, login } from './client.js';
import { logger } from './helpers/logger.js';

client.commands = new Collection<string, KifoChatInputCommand>();

logger.debug('Beginning deploy.js execution...');

async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(config.token);

    const commands = client.commands.map((command) => command.data.toJSON());

    try {
        logger.info('=== Started refreshing application (/) commands. ===');

        logger.table(
            commands.map((command) => {
                return {
                    command: command.name,
                    description: command.description,
                };
            })
        );

        if (env === Environment.DEV) {
            logger.info('Registering commands in development mode.');
            await rest.put(
                Routes.applicationGuildCommands(
                    config.clientId,
                    config.devServerId
                ),
                { body: commands }
            );
        }

        if (env === Environment.PROD) {
            logger.warn(
                'Registering commands in production mode. This will take up to an hour to take effect.'
            );
            await rest.put(Routes.applicationCommands(config.clientId), {
                body: commands,
            });
        }

        logger.info(
            `=== Successfully reloaded ${commands.length} application (/) commands. ===`
        );
    } catch (error) {
        logger.fatal(error);
    }
}

login().catch((error) => {
    logger.fatal(error);
})

client.once(Events.ClientReady, async () => {
    logger.success('Client ready!');
    setAllCommands(client).then(async () => {
        await registerCommands();
        process.exit(0);
    });
});
