// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

import { client } from '../client.js';
import { dbFacade } from '../data/mySqlAccess.js';
import { logger } from './logger.js';
import { plural } from './plural.js';

export async function setInteractionMaps() {
    client.interactionMaps.react = [];

    const result = await dbFacade.query<{ ChannelId: string; emotes: string }>(
        "SELECT ChannelId, GROUP_CONCAT(emote SEPARATOR ',') as emotes FROM react GROUP BY ChannelId"
    );

    result.forEach((row) => {
        client.interactionMaps.react.push({
            channelId: row.ChannelId,
            reactions: row.emotes.split(','),
        });
    });

    logger.info(`Set ${result.length} react channel${plural(result.length)}`);
}
