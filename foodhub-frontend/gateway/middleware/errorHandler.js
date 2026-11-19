import logger from "../logger.js";

const errorNames = {
  400: "Bad Request",
  404: "Not Found",
  500: "Internal Server Error",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

export function buildError(status, message, path) {
  return {
    timestamp: new Date().toISOString(),
    status: status,
    error: errorNames[status],
    message: message,
    path: path,
  };
}

// Used when no route matches the URL
export function notFound(req, res) {
  res.status(404).json(buildError(404, "Route not found", req.originalUrl));
}

export function errorHandler(error, req, res, next) {
  if (error.type === "entity.parse.failed") {
    return res
      .status(400)
      .json(buildError(400, "Malformed JSON request", req.originalUrl));
  }

  if (error.backendDown) {
    const isTimeout =
      error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
    if (isTimeout) {
      return res
        .status(504)
        .json(
          buildError(
            504,
            "The backend took too long to respond. Please try again.",
            req.originalUrl,
          ),
        );
    }
    return res
      .status(503)
      .json(
        buildError(
          503,
          "The backend is not available. Please try again later.",
          req.originalUrl,
        ),
      );
  }

  logger.error(`[${req.requestId}] Unexpected gateway error: ${error.message}`);
  res
    .status(500)
    .json(
      buildError(500, "Something went wrong in the gateway.", req.originalUrl),
    );
}
