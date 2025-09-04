import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import DailyRotateFile from "winston-daily-rotate-file";
import KafkaProducer from "../kafka/producer kafka.js";

const { createLogger, format, transports, addColors } = winston;
const { combine, timestamp, printf, colorize, errors, json } = format;

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
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] ${level} ${stack || message}${metaString}`;
});

// File format without colors
const fileFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
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

    // Error logs - daily rotate, compress, keep 3 days
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxFiles: "3d",
      format: combine(
        timestamp({ format: "DD/MM/YYYY - HH:mm:ss" }),
        errors({ stack: true }),
        fileFormat
      ),
    }),

    //Combined logs - daily rotate, compress, keep 3 days
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxFiles: "3d",
      format: combine(
        timestamp({ format: "DD/MM/YYYY - HH:mm:ss" }),
        errors({ stack: true }),
        fileFormat
      ),
    }),

    //Production logs (JSON) - daily rotate, compress, keep 3 days
    new DailyRotateFile({
      filename: path.join(logDir, "production-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxFiles: "3d",
      format: combine(
        timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }), // ISO timestamp
        errors({ stack: true }),
        json()
      ),
    }),

    // ✅ Push logs to Kafka
    new KafkaProducer({ topic: "logs" }),
  ],
});

export default logger;