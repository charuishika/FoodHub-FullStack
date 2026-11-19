import foodHubClient from "../services/clientInstance.js";
import { getContext, sendResult } from "./helpers.js";

export async function getMenu(req, res, next) {
  try {
    const result = await foodHubClient.getMenu(
      getContext(req),
      req.params.restaurantId,
    );
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}

export async function addMenuItem(req, res, next) {
  try {
    const result = await foodHubClient.addMenuItem(
      getContext(req),
      req.params.restaurantId,
      req.body,
    );
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateMenuItem(req, res, next) {
  try {
    const { restaurantId, itemId } = req.params;
    const result = await foodHubClient.updateMenuItem(
      getContext(req),
      restaurantId,
      itemId,
      req.body,
    );
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}

export async function deleteMenuItem(req, res, next) {
  try {
    const { restaurantId, itemId } = req.params;
    const result = await foodHubClient.deleteMenuItem(
      getContext(req),
      restaurantId,
      itemId,
    );
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}

export async function setItemAvailability(req, res, next) {
  try {
    const { restaurantId, itemId } = req.params;
    const result = await foodHubClient.setItemAvailability(
      getContext(req),
      restaurantId,
      itemId,
      req.body,
    );
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}
