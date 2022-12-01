// Require the necessary discord.js classes
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import * as fs from 'fs';
import { handleAllEvents, setAllCommands } from './helpers.js';
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
await setAllCommands(client);
await handleAllEvents(client);
client.login(config.token).then(() => {
    console.log('Logged in!');
});
//# sourceMappingURL=index.js.map