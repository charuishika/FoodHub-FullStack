// Headers that are forwarded to the backend
export function getContext(req) {
  return {
    authorization: req.headers["authorization"],
    requestId: req.requestId,
  };
}

// Sends the backend's status code and body back to React unchanged
export function sendResult(res, result) {
  if (result.status === 204) {
    return res.status(204).end(); // 204 = no content (used by delete)
  }
  res.status(result.status).json(result.data);
}
