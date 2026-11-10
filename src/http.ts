import { MpesaError } from "./errors.js";

export interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: HttpClientConfig) {
    if (!config.baseUrl) {
      throw new MpesaError(
        "Base URL is required",
        "INVALID_BASE_URL"
      );
    }

    const url = new URL(config.baseUrl);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new MpesaError(
        "Invalid URL protocol",
        "INVALID_BASE_URL"
      );
    }

    if (url.username || url.password) {
      throw new MpesaError(
        "URL credentials are not allowed",
        "INVALID_BASE_URL"
      );
    }

    if (url.search || url.hash) {
        throw new MpesaError(
            "Base URL cannot contain query or fragment",
            "INVALID_BASE_URL"
        );
    }

    this.baseUrl = url.toString().endsWith("/")
        ? url.toString()
        : `${url.toString()}/`;

    this.timeout = config.timeout ?? 30000;

    if (
      !Number.isSafeInteger(this.timeout) ||
      this.timeout <= 0
    ) {
      throw new MpesaError(
        "Timeout must be a positive integer",
        "INVALID_TIMEOUT"
      );
    }
  }

  async post<TResponse>(
    endpoint: string,
    body: unknown,
    headers: Record<string, string> = {}
  ): Promise<TResponse> {
    if (
        !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(endpoint)
    ) {
      throw new MpesaError(
          "Invalid API endpoint",
          "INVALID_ENDPOINT"
       );
    }

    const controller = new AbortController();

    const timer = setTimeout(
      () => controller.abort(),
      this.timeout
    );

    try {
      const url = new URL(
        endpoint.slice(1),
        this.baseUrl
      );

      if (url.origin !== new URL(this.baseUrl).origin) {
        throw new MpesaError(
          "Invalid API endpoint",
          "INVALID_ENDPOINT"
        );
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        redirect: "error",
      });

      if (!response.ok) {
        throw new MpesaError(
          `HTTP request failed with status ${response.status}`,
          "HTTP_ERROR",
          response.status
        );
      }

      try {
        return (await response.json()) as TResponse;
      } catch {
        throw new MpesaError(
          "Invalid JSON response",
          "INVALID_RESPONSE"
        );
      }
    } catch (error) {
      if (error instanceof MpesaError) {
        throw error;
      }

      if (
        controller.signal.aborted ||
        (error instanceof Error &&
          error.name === "AbortError")
      ) {
        throw new MpesaError(
          "Request timed out",
          "TIMEOUT_ERROR"
        );
      }

      throw new MpesaError(
        "Network request failed",
        "NETWORK_ERROR"
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
