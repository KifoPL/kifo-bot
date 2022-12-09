// kifo-bot copyright (C) 2022 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions; type `show c' for details.

// Require the necessary discord.js classes
import { Collection } from "discord.js";
import type { KifoChatInputCommand } from "./interfaces/discordExtensions.js";
import { handleAllEvents, setAllCommands } from "./helpers/fileHelpers.js";
import { client, config } from "./client.js";
import { logger } from "./helpers/logger.js";

logger.debug('Beginning index.js execution...');

client.commands = new Collection<string, KifoChatInputCommand>();

setAllCommands(client)
    .then(async () => {
        await handleAllEvents(client);

        client.login(config.token).then(() => {
            logger.success('Logged in!');
        }).catch((error) => {
            logger.fatal(error);
        });
    })
    .catch((error) => {
        logger.fatal(error);
    });
