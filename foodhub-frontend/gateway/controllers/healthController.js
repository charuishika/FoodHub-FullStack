import axios from "axios";
import logger from "../logger.js";

// Checks that the gateway itself is running
export function gatewayHealth(req, res) {
  res.json({ status: "UP", service: "foodhub-gateway" });
}

// Checks that Spring Boot is reachable.
// Without a token the backend answers 401, which is fine here:
// any HTTP answer means the backend is running.
export async function backendHealth(req, res) {
  try {
    await axios.get(`${process.env.BACKEND_URL}/api/restaurants`, {
      timeout: 3000,
      validateStatus: () => true, // do not treat 401 as an error
    });
    res.json({ status: "UP", message: "Spring Boot backend is reachable" });
  } catch (error) {
    logger.error(`Backend health check failed: ${error.message}`);
    res
      .status(503)
      .json({ status: "DOWN", message: "Cannot reach Spring Boot backend" });
  }
}
