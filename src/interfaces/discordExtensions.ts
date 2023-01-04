// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

import type {
    ChatInputCommandInteraction,
    Client,
    Collection,
    SlashCommandBuilder,
} from 'discord.js';
import type { InteractionMaps } from './InteractionMaps.js';

export interface KifoClient extends Client {
    commands: Collection<string, KifoChatInputCommand>;
    eventHandlers: Collection<string, KifoEvent>;
    interactionMaps: InteractionMaps;
}

export interface KifoChatInputCommand {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface KifoEvent {
    name: string;
    isOnce: boolean;
    execute: (...args: any[]) => Promise<void>;
}

export interface KifoCronJob {
    interval: number;
    onInterval: () => Promise<void>;
}