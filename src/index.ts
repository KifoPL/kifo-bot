// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

// Require the necessary discord.js classes
import { Collection } from 'discord.js';
import type { KifoChatInputCommand } from './interfaces/discordExtensions.js';
import { handleAllEvents, setAllCommands } from './helpers/fileHelpers.js';
import { client, login } from './client.js';
import { logger } from './helpers/logger.js';
import { dbConnectionInit } from './data/mySqlAccess.js';
import { setInteractionMaps } from './helpers/setInteractionMaps.js';

logger.debug('Beginning index.js execution...');

client.commands = new Collection<string, KifoChatInputCommand>();

async function turnOnBot(withDb: boolean = true) {
    if (withDb) {
        dbConnectionInit(5, () => {
            initBot();
        });
    } else initBot();
}

function initBot() {
    setAllCommands(client)
        .then(async () => {
            await handleAllEvents(client).catch((err) => logger.fatal(err));

            login().catch((error) => {
                logger.fatal(error);
            });

            await setInteractionMaps().catch((err) => logger.fatal(err));
        })
        .catch((err) => logger.fatal(err));
}

await turnOnBot();
