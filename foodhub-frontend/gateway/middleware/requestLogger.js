import logger from "../logger.js";

// One log line per request: id, method, URL, status and time taken.
// Headers and bodies are never logged, so passwords and tokens stay out of the log.
function requestLogger(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const timeTaken = Date.now() - startTime;
    logger.info(
      `[${req.requestId}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${timeTaken}ms)`,
    );
  });

  next();
}

export default requestLogger;
