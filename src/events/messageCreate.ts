// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

import type { KifoEvent } from '../interfaces/discordExtensions.js';
import { Events, Message } from 'discord.js';
import { reactCheck } from '../helpers/events/messageReacter.js';
import { logger } from '../helpers/logger.js';

const messageCreate: KifoEvent = {
    isOnce: false,
    name: Events.MessageCreate,
    execute: async (message: Message) => {
        Promise.all([reactCheck(message)]).catch((err) => logger.error(err));
    },
};

export default messageCreate;
