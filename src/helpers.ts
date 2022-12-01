import * as path from 'path';
import type {
    KifoClient,
    KifoCommand,
    KifoEvent,
} from './interfaces/discordExtensions.js';

import * as fs from 'fs';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

function getAllFiles(dir: string): string[] {
    const dirs = fs.readdirSync(dir, { withFileTypes: true });
    const files = dirs.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getAllFiles(res) : [res];
    });

    return Array.prototype.concat(...files);
}

export async function setAllCommands(client: KifoClient) {
    console.log('=== Setting all commands... ===');
    const commandsPath = path.join(__dirname, './interactions/commands');
    const commandFiles = getAllFiles(commandsPath).filter((file: string) =>
        file.endsWith('.js')
    );

    for (const file of commandFiles) {
        const command = (await import(file)).default;

        // check if command is of type KifoCommand
        if (command.data && command.execute)
            setCommand(client, <KifoCommand>command);
        else
            console.error(
                `Command ${file} does not have a data or execute property.`
            );
    }

    console.log('= All commands set. =');
}

function setCommand(client: KifoClient, command: KifoCommand) {
    console.log(command.data.name);
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
        console.log(`Setting event handler ${event.name} to once...`);
        client.once(event.name, event.execute);
    } else {
        console.log(`Setting event handler ${event.name} to on...`);
        client.on(event.name, event.execute);
    }
}

export async function handleAllEvents(client: KifoClient) {
    console.log('=== Setting all event handlers... ===');
    const eventsPath = path.join(__dirname, './events');
    const events = getAllModules(eventsPath).filter((file) =>
        file.endsWith('.js')
    );

    for (const file of events) {
        const event = (await import(file)).default;

        // check if event is of type KifoEvent
        if (event.name && event.execute) setEvent(client, <KifoEvent>event);
        else
            console.error(
                `Event ${file} does not have a name or execute property.`
            );
    }

    console.log('= All event handlers set. =');
}
