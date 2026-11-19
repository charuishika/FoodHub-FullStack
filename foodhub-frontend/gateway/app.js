import express from "express";
import cors from "cors";
import requestId from "./middleware/requestId.js";
import requestLogger from "./middleware/requestLogger.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

// Only our React app may call the gateway from a browser.
// exposedHeaders lets React read the X-Request-ID response header.
app.use(
  cors({ origin: process.env.FRONTEND_URL, exposedHeaders: ["X-Request-ID"] }),
);

app.use(requestId);
app.use(requestLogger);
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/restaurants/:restaurantId/menu", menuRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", orderRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
