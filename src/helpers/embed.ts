// kifo-bot copyright (C) 2022 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions; type `show c' for details.

import { EmbedBuilder } from 'discord.js';
import { client } from '../client.js';

export function kifoEmbed(
    body: string | null,
    title: string | null = 'Info:'
): EmbedBuilder {
    const builder = new EmbedBuilder()
        .setColor('#a039a0')
        .setAuthor({
            name: `Powered by ${client.user?.tag}`,
            iconURL: client.user!.avatarURL({ size: 32, extension: 'png' })!,
            url: 'https://kifopl.github.io/kifo-bot/',
        })
        .setTimestamp()
        .setFooter({
            text: 'Kifo bot - a completely revamped Kifo Clanker',
        });

    if (body !== null) {
        if (body.length > 4096) {
            builder.setDescription(body.substring(0, 4093) + '...');
        } else {
            builder.setDescription(body);
        }
    }

    if (title !== null) {
        if (title.length > 256) {
            builder.setTitle(title.substring(0, 253) + '...');
        } else builder.setTitle(title);
    }

    return builder;
}
