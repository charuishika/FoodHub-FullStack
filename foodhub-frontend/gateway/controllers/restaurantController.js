import foodHubClient from "../services/clientInstance.js";
import { getContext, sendResult } from "./helpers.js";

export async function createRestaurant(req, res, next) {
  try {
    const result = await foodHubClient.createRestaurant(
      getContext(req),
      req.body,
    );
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getRestaurants(req, res, next) {
  try {
    const result = await foodHubClient.getRestaurants(getContext(req));
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getMyRestaurant(req, res, next) {
  try {
    const result = await foodHubClient.getMyRestaurant(getContext(req));
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getRestaurant(req, res, next) {
  try {
    const result = await foodHubClient.getRestaurant(
      getContext(req),
      req.params.id,
    );
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}
