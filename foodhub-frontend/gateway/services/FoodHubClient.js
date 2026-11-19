import BackendClient from "./BackendClient.js";

class FoodHubClient extends BackendClient {
  buildHeaders(context) {
    const headers = {};
    if (context.authorization) {
      headers["Authorization"] = context.authorization;
    }
    if (context.idempotencyKey) {
      headers["Idempotency-Key"] = context.idempotencyKey;
    }
    if (context.requestId) {
      headers["X-Request-ID"] = context.requestId;
    }
    return headers;
  }

  send(method, url, context, data, params) {
    return this.request({
      method: method,
      url: url,
      data: data,
      params: params,
      headers: this.buildHeaders(context),
    });
  }

  menuUrl(restaurantId) {
    return `/api/restaurants/${encodeURIComponent(restaurantId)}/menu`;
  }

  register(context, body) {
    return this.send("POST", "/api/auth/register", context, body);
  }

  login(context, body) {
    return this.send("POST", "/api/auth/login", context, body);
  }

  getCurrentUser(context) {
    return this.send("GET", "/api/auth/me", context);
  }

  createRestaurant(context, body) {
    return this.send("POST", "/api/restaurants", context, body);
  }

  getRestaurants(context) {
    return this.send("GET", "/api/restaurants", context);
  }

  getMyRestaurant(context) {
    return this.send("GET", "/api/restaurants/my", context);
  }

  getRestaurant(context, id) {
    return this.send(
      "GET",
      `/api/restaurants/${encodeURIComponent(id)}`,
      context,
    );
  }

  getMenu(context, restaurantId) {
    return this.send("GET", this.menuUrl(restaurantId), context);
  }

  addMenuItem(context, restaurantId, body) {
    return this.send(
      "POST",
      `${this.menuUrl(restaurantId)}/items`,
      context,
      body,
    );
  }

  updateMenuItem(context, restaurantId, itemId, body) {
    return this.send(
      "PUT",
      `${this.menuUrl(restaurantId)}/items/${encodeURIComponent(itemId)}`,
      context,
      body,
    );
  }

  deleteMenuItem(context, restaurantId, itemId) {
    return this.send(
      "DELETE",
      `${this.menuUrl(restaurantId)}/items/${encodeURIComponent(itemId)}`,
      context,
    );
  }

  setItemAvailability(context, restaurantId, itemId, body) {
    return this.send(
      "PATCH",
      `${this.menuUrl(restaurantId)}/items/${encodeURIComponent(itemId)}/availability`,
      context,
      body,
    );
  }

  placeOrder(context, body) {
    return this.send("POST", "/api/orders", context, body);
  }

  getMyOrders(context) {
    return this.send("GET", "/api/orders/my", context);
  }

  getRestaurantOrders(context, query) {
    return this.send(
      "GET",
      "/api/orders/restaurant",
      context,
      undefined,
      query,
    );
  }

  updateOrderStatus(context, orderId, body) {
    return this.send(
      "PATCH",
      `/api/orders/${encodeURIComponent(orderId)}/status`,
      context,
      body,
    );
  }
}

export default FoodHubClient;
