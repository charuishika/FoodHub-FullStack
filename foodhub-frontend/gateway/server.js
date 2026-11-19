import "dotenv/config"; // must stay first: it loads the .env file
import app from "./app.js";
import logger from "./logger.js";

const port = process.env.PORT || 4000;

app.listen(port, () => {
  logger.info(`FoodHub gateway running on http://localhost:${port}`);
  logger.info(`Forwarding to backend: ${process.env.BACKEND_URL}`);
});
