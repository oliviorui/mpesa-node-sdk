import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { HttpClient } from "../src/http.js";
import { MpesaError } from "../src/errors.js";

describe("HttpClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should reject path traversal", async () => {
    const client = new HttpClient({
        baseUrl: "https://example.com/api/",
    });

    await expect(
        client.post("/../admin", {})
    ).rejects.toMatchObject({
        code: "INVALID_ENDPOINT",
    });
  });

  it("should preserve the base API path", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
        status: 200,
        })
    );

    vi.stubGlobal("fetch", mockFetch);

    const client = new HttpClient({
        baseUrl: "https://example.com/api",
    });

    await client.post("/payment", { amount: 1500 });

    expect(mockFetch).toHaveBeenCalledWith(
        new URL("https://example.com/api/payment"),
        expect.objectContaining({
        method: "POST",
        })
    );
  });

  it("should abort requests after timeout", async () => {
    const mockFetch = vi.fn(
        (_url: URL, options: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
            options.signal?.addEventListener(
            "abort",
            () => {
                reject(
                new DOMException(
                    "The operation was aborted",
                    "AbortError"
                )
                );
            },
            { once: true }
            );
        })
    );

    vi.stubGlobal("fetch", mockFetch);

    const client = new HttpClient({
        baseUrl: "https://example.com/",
        timeout: 20,
    });

    await expect(
        client.post("/payment", {})
    ).rejects.toMatchObject({
        code: "TIMEOUT_ERROR",
    });
  });

  it("should send a POST request", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    vi.stubGlobal("fetch", mockFetch);

    const client = new HttpClient({
      baseUrl: "https://example.com/",
    });

    const result = await client.post<{
      success: boolean;
    }>("/payment", {
      amount: 1500,
    });

    expect(result.success).toBe(true);

    expect(mockFetch).toHaveBeenCalledOnce();

    expect(mockFetch).toHaveBeenCalledWith(
      new URL("https://example.com/payment"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ amount: 1500 }),
      })
    );
  });

  it("should handle HTTP errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 400,
        })
      )
    );

    const client = new HttpClient({
      baseUrl: "https://example.com/",
    });

    await expect(
      client.post("/payment", {})
    ).rejects.toMatchObject({
      name: "MpesaError",
      code: "HTTP_ERROR",
      statusCode: 400,
    });
  });

  it("should handle network errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(
        new TypeError("Network failure")
      )
    );

    const client = new HttpClient({
      baseUrl: "https://example.com/",
    });

    await expect(
      client.post("/payment", {})
    ).rejects.toMatchObject({
      code: "NETWORK_ERROR",
    });
  });

  it("should reject invalid JSON responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Not JSON", {
          status: 200,
        })
      )
    );

    const client = new HttpClient({
      baseUrl: "https://example.com/",
    });

    await expect(
      client.post("/payment", {})
    ).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("should reject invalid URLs", () => {
    expect(
      () =>
        new HttpClient({
          baseUrl: "ftp://example.com",
        })
    ).toThrow(MpesaError);
  });

  it("should reject invalid timeouts", () => {
    expect(
      () =>
        new HttpClient({
          baseUrl: "https://example.com/",
          timeout: -1,
        })
    ).toThrow("Timeout must be a positive integer");
  });

  it("should reject external endpoints", async () => {
    const client = new HttpClient({
      baseUrl: "https://example.com/",
    });

    await expect(
      client.post("//evil.example/payment", {})
    ).rejects.toMatchObject({
      code: "INVALID_ENDPOINT",
    });
  });
});
