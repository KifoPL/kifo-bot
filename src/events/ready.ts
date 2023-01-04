// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

import type { Client } from 'discord.js';
import { Events } from 'discord.js';
import { logger } from '../helpers/logger.js';
import type { KifoEvent } from '../interfaces/discordExtensions.js';

const clientReady: KifoEvent = {
    name: Events.ClientReady,
    isOnce: true,
    async execute(client: Client) {
        logger.success(`Ready! Listening for commands as ${client.user?.tag}`);
    },
};

export default clientReady;