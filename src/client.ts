// kifo-bot copyright (C) 2022 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions; type `show c' for details.

import type { KifoClient } from './interfaces/discordExtensions.js';
import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

export enum Environment {
    DEV = 'DEV',
    PROD = 'PROD',
}

export const client = <KifoClient>new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
    ],
});

export const env: Environment = <Environment>(process.env.ENVIRONMENT || 'DEV');

const configSrc =
    env === Environment.PROD ? './config.prod.json' : './config.dev.json';

export const config = JSON.parse(fs.readFileSync(configSrc, 'utf8'));
