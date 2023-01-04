// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

import type { Message } from 'discord.js';
import { client } from '../../client.js';

export async function reactCheck(message: Message) {
    // Do not react to other bots messages
    if (message.author.bot && message.author.id !== client.user?.id) return;

    // Do not react, if the command is not enabled
    if (
        !client.interactionMaps.react.find(
            (val) => val.channelId === message.channelId
        )
    )
        return;

    // Do not react, if insufficient permissions
    const channel = (<Message<true>>message).channel;

    if (!channel.permissionsFor(client.user?.id ?? '1', true)) return;

    // React with emotes
    const reactRow = client.interactionMaps.react.find(
        (val) => val.channelId === message.channelId
    )!;

    for (const reaction of reactRow.reactions) {
        await message.react(reaction);
    }
}
