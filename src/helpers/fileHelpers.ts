// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

import * as path from 'path';
import type {
    KifoChatInputCommand,
    KifoClient,
    KifoEvent,
} from '../interfaces/discordExtensions.js';

import * as fs from 'fs';

import { fileURLToPath } from 'url';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

function getAllFiles(dir: string): string[] {
    const dirs = fs.readdirSync(dir, { withFileTypes: true });
    const files = dirs.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getAllFiles(res) : [res];
    });

    return Array.prototype.concat(...files);
}

export async function setAllCommands(client: KifoClient): Promise<void> {
    logger.info('=== Setting all commands... ===');
    const commandsPath = path.join(__dirname, '../interactions/commands');
    const commandFiles = getAllFiles(commandsPath).filter((file: string) =>
        file.endsWith('.js')
    );

    for (const file of commandFiles) {
        try {
            const command = await import(file);
            const defaultCmd = command.default;
            // check if command is of type KifoCommand
            if (defaultCmd !== undefined && defaultCmd.data && defaultCmd.execute)
                setCommand(client, <KifoChatInputCommand>defaultCmd);
            else {
                logger.error(
                    `Command ${file} does not have a data or execute property.`
                );
            }
        } catch (error) {
            logger.error(`Error importing ${file}`);
            logger.error(error);
            return Promise.reject(error);
        }
    }

    logger.info('= All commands set. =');
    return Promise.resolve();
}

function setCommand(client: KifoClient, command: KifoChatInputCommand) {
    logger.info('> ' + command.data.name);
    client.commands.set(command.data.name, command);
}

export function getAllModules(dir: string): string[] {
    const modules = getAllFiles(dir);

    return modules.filter((file: string) => {
        return file.endsWith('.js');
    });
}

export function setEvent(client: KifoClient, event: KifoEvent) {
    if (event.isOnce) {
        logger.info(`> Setting event handler ${event.name} to once...`);
        client.once(event.name, event.execute);
    } else {
        logger.info(`> Setting event handler ${event.name} to on...`);
        client.on(event.name, event.execute);
    }
}

export async function handleAllEvents(client: KifoClient): Promise<void> {
    logger.info('=== Setting all event handlers... ===');
    const eventsPath = path.join(__dirname, '../events');
    const events = getAllModules(eventsPath).filter((file) =>
        file.endsWith('.js')
    );

    for (const file of events) {
        try {
            const event = await import(file);
            const defaultEvent = event.default;
            // check if event is of type KifoEvent
            if (defaultEvent.name && defaultEvent.execute)
                setEvent(client, <KifoEvent>defaultEvent);
            else {
                logger.error(
                    `Event ${file} does not have a name or execute property.`
                );
            }
        } catch (error) {
            logger.error(`Error importing ${file}`);
            logger.error(error);
            return Promise.reject(error);
        }
    }
    logger.info('= All event handlers set. =');
    return Promise.resolve();
}
