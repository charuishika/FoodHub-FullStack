import express from "express";
import {
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  setItemAvailability,
} from "../controllers/menuController.js";

// mergeParams lets this router read :restaurantId from the path it is mounted on
const router = express.Router({ mergeParams: true });

router.get("/", getMenu);
router.post("/items", addMenuItem);
router.put("/items/:itemId", updateMenuItem);
router.delete("/items/:itemId", deleteMenuItem);
router.patch("/items/:itemId/availability", setItemAvailability);

export default router;
