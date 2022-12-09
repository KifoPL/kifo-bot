// kifo-bot copyright (C) 2022 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions; type `show c' for details.

import type {
    ChatInputCommandInteraction,
    Client,
    Collection,
    SlashCommandBuilder,
} from 'discord.js';

export interface KifoClient extends Client {
    commands: Collection<string, KifoChatInputCommand>;
    eventHandlers: Collection<string, KifoEvent>;
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
