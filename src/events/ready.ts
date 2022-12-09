// kifo-bot copyright (C) 2022 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions; type `show c' for details.

import type { Client } from 'discord.js';
import { Events } from 'discord.js';
import { logger } from '../helpers/logger.js';

export default {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        logger.success(`Ready! Listening for commands as ${client.user?.tag}`);
    },
};
