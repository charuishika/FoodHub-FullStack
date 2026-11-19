import express from "express";
import {
  createRestaurant,
  getRestaurants,
  getMyRestaurant,
  getRestaurant,
} from "../controllers/restaurantController.js";

const router = express.Router();

router.post("/", createRestaurant);
router.get("/", getRestaurants);
router.get("/my", getMyRestaurant); // must stay above "/:id", or "my" would be read as an id
router.get("/:id", getRestaurant);

export default router;
