import express from "express";
import {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", placeOrder);
router.get("/my", getMyOrders);
router.get("/restaurant", getRestaurantOrders);
router.patch("/:orderId/status", updateOrderStatus);

export default router;
