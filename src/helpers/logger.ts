// kifo-bot copyright (C) 2022 KifoPL
//
// This program comes with ABSOLUTELY NO WARRANTY; for details checkout LICENSE file in root directory.
// This is free software, and you are welcome to redistribute it
// under certain conditions; type `show c' for details.

import { env, Environment } from '../client.js';
import chalk from 'chalk';

export enum LogLevel {
    DEBUG = 0,
    LOG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    FATAL = 5,
}

export const logLevel =
    env === Environment.PROD ? LogLevel.INFO : LogLevel.DEBUG;

function mapArgs(args: any[]): string {
    return args
        .map((arg) => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg);
            } else {
                return arg;
            }
        })
        .join(', ');
}

function info(...args: any[]) {
    if (logLevel > LogLevel.INFO) return;
    console.info(
        `${new Date().toISOString()} - `,
        chalk.cyan('[INFO]:    ', mapArgs(args))
    );
}

function log(...args: any[]) {
    if (logLevel > LogLevel.LOG) return;
    console.log(`${new Date().toISOString()} - `, mapArgs(args));
}

function error(...args: any[]) {
    if (logLevel > LogLevel.ERROR) return;
    console.error(
        `${new Date().toISOString()} - `,
        chalk.red('[ERROR]:   ', mapArgs(args))
    );
}

function warn(...args: any[]) {
    if (logLevel > LogLevel.WARN) return;
    console.warn(
        `${new Date().toISOString()} - `,
        chalk.yellow('[WARN]:    ', mapArgs(args))
    );
}

function success(...args: any[]) {
    if (logLevel > LogLevel.INFO) return;
    console.log(
        `${new Date().toISOString()} - `,
        chalk.green('[SUCCESS]: ', mapArgs(args))
    );
}

function debug(...args: any[]) {
    if (logLevel > LogLevel.DEBUG) return;
    console.debug(
        `${new Date().toISOString()} - `,
        chalk.dim('[DEBUG]:   ', mapArgs(args))
    );
}

function fatal(...args: any[]) {
    if (logLevel > LogLevel.FATAL) return;
    console.error(
        `${new Date().toISOString()} - `,
        chalk.bgRed('[FATAL]:   ', mapArgs(args))
    );
    process.exit(1);
}

function table(args: any) {
    console.table(args);
}

function trace(...args: any[]) {
    console.trace(`${new Date().toISOString()} - `, mapArgs(args));
}

const logger = {
    info: info,
    log: log,
    error: error,
    warn: warn,
    success: success,
    debug: debug,
    fatal: fatal,
    table: table,
    trace: trace,
};

export { logger };
