import winston from "winston";

// Writes logs to the console and to logs/gateway.log
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`,
    ),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/gateway.log" }),
  ],
});

export default logger;
