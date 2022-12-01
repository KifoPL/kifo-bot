import type { KifoClient, KifoEvent } from './interfaces/discordExtensions.js';
export declare function setAllCommands(client: KifoClient): Promise<void>;
export declare function getAllModules(dir: string): string[];
export declare function setEvent(client: KifoClient, event: KifoEvent): void;
export declare function handleAllEvents(client: KifoClient): Promise<void>;
//# sourceMappingURL=helpers.d.ts.map