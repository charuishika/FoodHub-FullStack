import axios from "axios";
import axiosRetry from "axios-retry";
import logger from "../logger.js";

function isTemporaryError(error) {
  const noAnswer = !error.response;
  const status = error.response ? error.response.status : 0;
  return noAnswer || status === 502 || status === 503 || status === 504;
}

class BackendClient {
  constructor(baseURL) {
    this.http = axios.create({ baseURL: baseURL, timeout: 5000 });

    axiosRetry(this.http, {
      retries: 3,
      retryDelay: (retryCount) => retryCount * 500, // 0.5s, 1s, 1.5s
      retryCondition: isTemporaryError,
      onRetry: (retryCount, error, requestConfig) => {
        const id = requestConfig.headers
          ? requestConfig.headers["X-Request-ID"]
          : "-";
        logger.warn(
          `[${id}] Retry ${retryCount}/3: ${requestConfig.method.toUpperCase()} ${requestConfig.url} (${error.message})`,
        );
      },
    });
  }

  canRetry(method, headers) {
    const m = method.toUpperCase();
    if (m === "GET" || m === "PUT" || m === "DELETE") {
      return true;
    }

    if (m === "POST" && headers["Idempotency-Key"]) {
      return true;
    }
    return false;
  }

  async request({ method, url, data, params, headers }) {
    const requestHeaders = headers || {};
    const id = requestHeaders["X-Request-ID"] || "-";

    const config = {
      method: method,
      url: url,
      data: data,
      params: params,
      headers: requestHeaders,

      "axios-retry": { retries: this.canRetry(method, requestHeaders) ? 3 : 0 },
    };

    logger.info(`[${id}] -> backend ${method} ${url}`);

    try {
      const response = await this.http.request(config);
      logger.info(`[${id}] <- backend ${response.status}`);
      return { status: response.status, data: response.data };
    } catch (error) {
      if (error.response) {
        logger.warn(
          `[${id}] <- backend ${error.response.status} for ${method} ${url}`,
        );
        return { status: error.response.status, data: error.response.data };
      }

      logger.error(
        `[${id}] backend not reachable: ${error.code || error.message}`,
      );
      const backendError = new Error("Cannot reach the backend");
      backendError.backendDown = true;
      backendError.code = error.code;
      throw backendError;
    }
  }
}

export default BackendClient;
