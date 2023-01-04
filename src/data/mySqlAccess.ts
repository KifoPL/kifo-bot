// kifo-bot copyright (C) 2023 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions. Read more at: https://github.com/KifoPL/kifo-bot/blob/master/LICENSE

import type {
    Connection,
    ConnectionConfig,
    ConnectionOptions,
    MysqlError,
    QueryOptions,
} from 'mysql';
import { createConnection } from 'mysql';
import { logger } from '../helpers/logger.js';
import { plural } from '../helpers/plural.js';
import { config, env } from '../client.js';

const dbConfig: ConnectionConfig = {
    host: config.host,
    user: config.user,
    password: config.password,
    database: 'kifo_clanker_db',
    //totally not from stack overflow, but works beautifully
    typeCast: function castField(field, useDefaultTypeCasting) {
        // We only want to cast bit fields that have a single-bit in them. If the field
        // has more than one bit, then we cannot assume it is supposed to be a Boolean.
        if (field.type === 'BIT' && field.length === 1) {
            let bytes = field.buffer();

            // A Buffer in Node represents a collection of 8-bit unsigned integers.
            // Therefore, our single "bit field" comes back as the bits '0000 0001',
            // which is equivalent to the number 1.
            return bytes === null ? false : bytes[0] === 1;
        }

        return useDefaultTypeCasting();
    },
};
let connection: Connection;

export let dbFacade: DbFacade;

class DbFacade {
    get instance(): Connection {
        return this._instance;
    }

    private readonly _instance: Connection;

    constructor(connection: Connection) {
        this._instance = connection;
    }

    escapeId(value: string, forbidQualified?: boolean): string {
        return this._instance.escapeId(value, forbidQualified);
    }

    ping(options?: QueryOptions, callback?: (err: MysqlError) => void) {
        this._instance.ping(options, callback);
    }

    removeAllListeners(event?: string | symbol): Connection {
        return this._instance.removeAllListeners(event);
    }

    setMaxListeners(n: number): Connection {
        return this._instance.setMaxListeners(n);
    }

    changeUser(
        options: ConnectionOptions,
        callback?: (err: MysqlError) => void
    ) {
        this._instance.changeUser(options, callback);
    }

    removeListener(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): Connection {
        return this._instance.removeListener(eventName, listener);
    }

    beginTransaction(
        options?: QueryOptions,
        callback?: (err: MysqlError) => void
    ) {
        this._instance.beginTransaction(options, callback);
    }

    commit(options?: QueryOptions, callback?: (err: MysqlError) => void) {
        this._instance.commit(options, callback);
    }

    on(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): Connection {
        return this._instance.on(eventName, listener);
    }

    listeners(eventName: string | symbol): Function[] {
        return this._instance.listeners(eventName);
    }

    listenerCount(eventName: string | symbol): number {
        return this._instance.listenerCount(eventName);
    }

    format(
        sql: string,
        values: any[],
        stringifyObjects?: boolean,
        timeZone?: string
    ): string {
        return this._instance.format(sql, values, stringifyObjects, timeZone);
    }

    getMaxListeners(): number {
        return this._instance.getMaxListeners();
    }

    rollback(options?: QueryOptions, callback?: (err: MysqlError) => void) {
        this._instance.rollback(options, callback);
    }

    statistics(options?: QueryOptions, callback?: (err: MysqlError) => void) {
        this._instance.statistics(options, callback);
    }

    end(callback?: (err?: MysqlError) => void) {
        this._instance.end(callback);
    }

    destroy() {
        this._instance.destroy();
    }

    pause() {
        this._instance.pause();
    }

    resume() {
        this._instance.resume();
    }

    off(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): Connection {
        return this._instance.off(eventName, listener);
    }

    connect(callback?: (err: MysqlError, ...args: any[]) => void) {
        this._instance.connect(callback);
    }

    once(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): Connection {
        return this._instance.once(eventName, listener);
    }

    query<T>(sql: string, values?: any): Promise<T[]> {
        const log = ['Executing query', { query: sql, params: env === 'DEV' ? values : undefined }]
        if (env === 'DEV') {
            logger.debug(...log);
        } else {
            logger.info(...log);
        }
        return new Promise((resolve, reject) => {
            this._instance.query(sql, values, (err, results: T[]) => {
                if (err) {
                    logger.error(err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
}

export function dbConnectionInit(attempts: number = 0, callback?: () => void) {
    logger.info('Establishing connection to database...');
    connection = createConnection(dbConfig);
    connection.connect(async function (err) {
        if (err) {
            logger.error('Error when connecting to db', err);

            if (attempts !== 0) {
                attempts--;
                if (attempts > 0) {
                    logger.info(
                        `Retrying in 3 seconds... (${attempts} attempt${plural(
                            attempts
                        )} left)`
                    );
                }
                setTimeout(() => dbConnectionInit(attempts), 3000);
            } else {
                logger.fatal('Failed to connect to database, exiting...');
                process.exit(1);
            }
        } else {
            logger.success(`Connected to ${dbConfig.host} MySQL DB`, {
                port: dbConfig.port,
                user: dbConfig.user,
                database: dbConfig.database,
            });
            dbFacade = new DbFacade(connection);

            if (callback) {
                callback();
            }
        }
    });

    connection.on('error', function (err) {
        logger.error('DB error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            if (attempts !== 0) {
                setTimeout(() => dbConnectionInit(attempts - 1), 3000);
            } else {
                logger.fatal('Failed to connect to database, exiting...');
                process.exit(1);
            }
        }
    });
}
