import foodHubClient from "../services/clientInstance.js";
import { getContext, sendResult } from "./helpers.js";

export async function placeOrder(req, res, next) {
  try {
    // Only order placement forwards the Idempotency-Key header
    const context = {
      ...getContext(req),
      idempotencyKey: req.headers["idempotency-key"],
    };
    const result = await foodHubClient.placeOrder(context, req.body);
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const result = await foodHubClient.getMyOrders(getContext(req));
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getRestaurantOrders(req, res, next) {
  try {
    // page, size and sort are forwarded as they are. The backend validates them.
    const result = await foodHubClient.getRestaurantOrders(
      getContext(req),
      req.query,
    );
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const result = await foodHubClient.updateOrderStatus(
      getContext(req),
      req.params.orderId,
      req.body,
    );
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}
