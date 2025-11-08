import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import { getContext } from "./context logger.js";
import DailyRotateFile from "winston-daily-rotate-file";

const { createLogger, format, transports, addColors } = winston;
const { combine, timestamp, printf, colorize, errors, json } = format;

// defining log directory
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

// Console format
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] ${level} ${stack || message}${metaString}`;
});

// File format
const fileFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] ${level.toUpperCase()} ${stack || message}${metaString}`;
});

// JSON structure formatter (unchanged from yours)
const jsonFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  format((info) => {
    // Skip transforming if already structured
    if (
      typeof info.message === "object" &&
      (info.message.id || info.message.sessionId || info.message.clock)
    ) {
      return info;
    }

    const context = getContext?.();
    const now = new Date(info.timestamp);
    const date = now.toISOString().split("T")[0];
    const clock = now.toTimeString().split(" ")[0];

    let extractedId;
    if (typeof info.message === "string") {
      const match = info.message.match(/\b\d{6,}\b/); // any 6+ digit number
      extractedId = match ? match[0] : undefined;
    }

    info.message = {
      clock,
      date,
      id: extractedId || "unknown",
      status: info.status || 200,
      success: !/error|fail/i.test(info.message),
      raw: info.message,
      level: info.level,
      timestamp: info.timestamp,
    };
    return info;
  })(),
  json()
);

// Create logger with daily rotation
const logger = createLogger({
  levels: customLevels.levels,
  transports: [
    // Console output (colored)
    new transports.Console({
      format: combine(
        colorize({ level: true }),
        timestamp({ format: "DD/MM/YYYY - HH:mm:ss" }),
        errors({ stack: true }),
        consoleFormat
      ),
    }),

    // Daily rotating error log
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      level: "error",
      datePattern: "YYYY-MM-DD", // rotate daily
      maxSize: "1.5m",           // safety size limit
      maxFiles: "3d",            // keep last 3 days
      zippedArchive: false,
      format: combine(
        timestamp({ format: "DD/MM/YYYY - HH:mm:ss" }),
        errors({ stack: true }),
        fileFormat
      ),
    }),

    // Daily rotating combined log
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "1.5m",
      maxFiles: "3d",
      zippedArchive: false,
      format: combine(
        timestamp({ format: "DD/MM/YYYY - HH:mm:ss" }),
        errors({ stack: true }),
        fileFormat
      ),
    }),

    // Daily rotating JSON structured log
    new DailyRotateFile({
      filename: path.join(logDir, "json-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "1.5m",
      maxFiles: "3d",
      zippedArchive: false,
      format: jsonFormat,
    }),
  ],
});

export default logger;
