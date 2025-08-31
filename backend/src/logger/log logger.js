import winston from "winston";
import path from 'path';
import { fileURLToPath } from "url";

const { createLogger, format, transports, addColors } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

// defining log directory where logs will be saved
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, "..", "..", "log");

// Custom log levels
const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        audit: 4,
    },
    colors: {
        fatal: "redBG white",
        error: "red",
        warn: "yellow",
        info: "green",
        audit: "blue",
    },
};

// Apply colors
addColors(customLevels.colors);

// Console format with colors
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level} ${stack || message}${metaString}`;
});

// File format without colors
const fileFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()} ${stack || message}${metaString}`;
});

// Create logger
const logger = createLogger({
    levels: customLevels.levels,
    transports: [
        new transports.Console({
            format: combine(
                colorize({ level: true }),
                timestamp({ format: "DD/MM/YYYY - HH:mm:ss" }),
                errors({ stack: true }),
                consoleFormat
            ),
        }),
        new transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
            format: combine(
                timestamp({ format: "DD/MM/YYYY - HH:mm:ss" }),
                errors({ stack: true }),
                fileFormat
            ),
        }),
        new transports.File({
            filename: path.join(logDir, "combined.log"),
            format: combine(
                timestamp({ format: "DD/MM/YYYY - HH:mm:ss" }),
                errors({ stack: true }),
                fileFormat
            ),
        }),
    ],
});

export default logger;