const winston = require("winston");
require("winston-daily-rotate-file");

const { createLogger, transports, format } = winston;

const winstonLoggerConfig = {
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        // * Console transport
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }),
        // * Daily Rotate File transport
        new transports.DailyRotateFile({
            filename: "logs/%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
        }),
    ],
    exceptionHandlers: [
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }),
        new transports.DailyRotateFile({
            filename: "logs/exceptions-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
        }),
    ],
};

const logger = createLogger(winstonLoggerConfig);
// * streamer for morgan
logger.stream = {
    ...logger.stream,
    write: function (message) {
        logger.info(message.substring(0, message.lastIndexOf("\n")));
    },
};

module.exports = logger;
