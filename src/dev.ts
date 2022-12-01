import fs from 'fs';
import type {
    KifoClient,
    KifoCommand,
} from './interfaces/discordExtensions.js';
import {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    REST,
    Routes,
} from 'discord.js';
import { setAllCommands } from './helpers.js';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const client = <KifoClient>new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection<string, KifoCommand>();

await setAllCommands(client);

async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(config.token);

    const commands = client.commands.map((command) => command.data.toJSON());

    try {
        console.log('=== Started refreshing application (/) commands. ===');

        await rest.put(
            Routes.applicationGuildCommands(
                config.clientId,
                config.devServerId
            ),
            { body: commands }
        );

        console.log('=== Successfully reloaded application (/) commands. ===');
    } catch (error) {
        console.error(error);
    }
}

client.login(config.token).then(() => {
    console.log('Logged in!');
});

client.once(Events.ClientReady, async () => {
    await registerCommands();
    process.exit(0);
});
