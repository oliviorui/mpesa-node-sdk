import {
  generateKeyPairSync,
} from "node:crypto";

import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { createAuthHeaders } from "../src/auth.js";
import { HttpClient } from "../src/http.js";

describe("Authenticated HTTP Integration", () => {
  const { publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  const credentials = {
    apiKey: "sandbox-test-api-key",
    publicKey,
    serviceProviderCode: "171717",
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should send an encrypted Bearer token", async () => {
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
        baseUrl: "https://example.com/mock/",
        allowedAuthOrigins: ["https://example.com"],
    });


    const headers = createAuthHeaders(credentials);

    const result = await client.post<{
      success: boolean;
    }>(
      "/payment",
      { amount: 1500 },
      headers
    );

    expect(result.success).toBe(true);

    expect(mockFetch).toHaveBeenCalledOnce();

    const options = mockFetch.mock.calls[0]?.[1] as RequestInit;

    const sentHeaders = new Headers(options.headers);

    const authorization = sentHeaders.get("Authorization");

    expect(authorization).toMatch(
      /^Bearer [A-Za-z0-9+/]+={0,2}$/
    );

    expect(authorization).not.toContain(
      credentials.apiKey
    );
  });

  it("should reject invalid credentials before HTTP", async () => {
    const mockFetch = vi.fn();

    vi.stubGlobal("fetch", mockFetch);

    expect(() =>
      createAuthHeaders({
        ...credentials,
        apiKey: "",
      })
    ).toThrow("M-Pesa API key is required");

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should not expose credentials in HTTP errors", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 401,
      })
    );

    vi.stubGlobal("fetch", mockFetch);

    const client = new HttpClient({
      baseUrl: "https://example.com/mock/",
      allowedAuthOrigins: ["https://example.com"],
    });

    const headers = createAuthHeaders(credentials);

    let caughtError: unknown;

    try {
      await client.post(
        "/payment",
        { amount: 1500 },
        headers
      );
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toMatchObject({
      name: "MpesaError",
      code: "HTTP_ERROR",
      statusCode: 401,
    });

    const errorMessage = String(caughtError);

    expect(errorMessage).not.toContain(
      credentials.apiKey
    );

    expect(errorMessage).not.toContain(
      headers.Authorization
    );
  });

  it("should reject authenticated requests without an allowlist", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const client = new HttpClient({
        baseUrl: "https://example.com/",
    });

    await expect(
        client.post("/payment", {}, {
        Authorization: "Bearer test-token",
        })
    ).rejects.toMatchObject({
        code: "UNAUTHORIZED_ORIGIN",
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should reject authenticated requests to unapproved origins", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const client = new HttpClient({
        baseUrl: "https://example.com/",
        allowedAuthOrigins: ["https://trusted.example.com"],
    });

    await expect(
        client.post("/payment", {}, {
        Authorization: "Bearer test-token",
        })
    ).rejects.toMatchObject({
        code: "UNAUTHORIZED_ORIGIN",
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should allow authenticated requests to approved HTTPS origins", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
        new Response(
        JSON.stringify({ success: true }),
        { status: 200 }
        )
    );

    vi.stubGlobal("fetch", mockFetch);

    const client = new HttpClient({
        baseUrl: "https://example.com/",
        allowedAuthOrigins: ["https://example.com"],
    });

    const result = await client.post<{ success: boolean }>(
        "/payment",
        {},
        {
        Authorization: "Bearer test-token",
        }
    );

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("should reject HTTP origins in the authentication allowlist", () => {
    expect(() =>
        new HttpClient({
        baseUrl: "https://example.com/",
        allowedAuthOrigins: ["http://example.com"],
        })
    ).toThrow("Invalid authenticated origin");
  });

  it("should reject origins containing credentials", () => {
    expect(() =>
        new HttpClient({
        baseUrl: "https://example.com/",
        allowedAuthOrigins: [
            "https://user:password@example.com",
        ],
        })
    ).toThrow("Invalid authenticated origin");
  });

  it("should reject origins containing paths", () => {
    expect(() =>
        new HttpClient({
        baseUrl: "https://example.com/",
        allowedAuthOrigins: [
            "https://example.com/payments",
        ],
        })
    ).toThrow("Invalid authenticated origin");
  });
});
