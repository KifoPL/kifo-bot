// Require the necessary discord.js classes
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type {
    KifoClient,
    KifoCommand,
} from './interfaces/discordExtensions.js';
import * as fs from 'fs';
import { handleAllEvents, setAllCommands } from './helpers.js';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const client = <KifoClient>new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection<string, KifoCommand>();

await setAllCommands(client);
await handleAllEvents(client);

client.login(config.token).then(() => {
    console.log('Logged in!');
});
