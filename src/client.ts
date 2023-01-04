// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

import type { KifoClient } from './interfaces/discordExtensions.js';
import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import * as dotenv from 'dotenv';
import { logger } from './helpers/logger.js';

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

type KifoBotConfig = {
    token: string;
    prefix: string;
    host: string;
    user: string;
    password: string;
    languageDetectKey: string;
    githubKey: string;
    clientId: string;
    devServerId: string;
};

export const config: KifoBotConfig = JSON.parse(
    fs.readFileSync(configSrc, 'utf8')
);

export function login(): Promise<void> {
    return client
        .login(config.token)
        .then(() => {
            logger.success('Logged in!');
        })
        .catch((error) => {
            logger.fatal(error);
        });
}
