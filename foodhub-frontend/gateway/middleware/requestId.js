import { randomUUID } from "crypto";

// Allowed: letters, digits, "-" and "_", length 8 to 64.
// This keeps strange input out of our log files.
const validId = /^[A-Za-z0-9_-]{8,64}$/;

function requestId(req, res, next) {
  const incoming = req.headers["x-request-id"];

  if (incoming && validId.test(incoming)) {
    req.requestId = incoming;
  } else {
    req.requestId = randomUUID();
  }

  res.setHeader("X-Request-ID", req.requestId);
  next();
}

export default requestId;
