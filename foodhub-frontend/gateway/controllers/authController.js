import foodHubClient from "../services/clientInstance.js";
import { getContext, sendResult } from "./helpers.js";

export async function register(req, res, next) {
  try {
    const result = await foodHubClient.register(getContext(req), req.body);
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await foodHubClient.login(getContext(req), req.body);
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const result = await foodHubClient.getCurrentUser(getContext(req));
    sendResult(res, result);
  } catch (error) {
    next(error);
  }
}
