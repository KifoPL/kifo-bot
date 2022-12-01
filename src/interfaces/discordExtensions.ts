import type {
    Client,
    Collection,
    CommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';

export interface KifoClient extends Client {
    commands: Collection<string, KifoCommand>;
    eventHandlers: Collection<string, KifoEvent>;
}

export interface KifoCommand {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}

export interface KifoEvent {
    name: string;
    isOnce: boolean;
    execute: (...args: any[]) => Promise<void>;
}
