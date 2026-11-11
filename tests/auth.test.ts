import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  normalizePublicKey,
  encryptApiKey,
  createAuthHeaders,
} from "../src/auth.js";

describe("M-Pesa RSA Public Key", () => {
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

  it("should accept a valid RSA public key", () => {
    const normalized = normalizePublicKey(publicKey);

    expect(normalized).toContain(
      "-----BEGIN PUBLIC KEY-----"
    );
  });

  it("should accept a raw Base64 public key", () => {
    const rawKey = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/g, "")
      .replace(/-----END PUBLIC KEY-----/g, "")
      .replace(/\s/g, "");

    const normalized = normalizePublicKey(rawKey);

    expect(normalized).toBe(
      normalizePublicKey(publicKey)
    );
  });

  it("should reject an empty public key", () => {
    expect(() =>
      normalizePublicKey("")
    ).toThrow("M-Pesa public key is required");
  });

  it("should reject an invalid public key", () => {
    expect(() =>
      normalizePublicKey("invalid-key")
    ).toThrow("Invalid RSA public key");
  });

  it("should reject a non-RSA public key", () => {
    const { publicKey: ecPublicKey } =
      generateKeyPairSync("ec", {
        namedCurve: "prime256v1",
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });

    expect(() =>
      normalizePublicKey(ecPublicKey)
    ).toThrow("Invalid RSA public key");
  });


  it("should encrypt an API key into Base64", () => {
    const token = encryptApiKey(
        "sandbox-test-api-key",
        publicKey
    );

    expect(token).toMatch(
        /^[A-Za-z0-9+/]+={0,2}$/
    );

    // RSA 2048 produces 256 encrypted bytes
    expect(Buffer.from(token, "base64")).toHaveLength(256);
  });

  it("should produce different ciphertexts", () => {
    const first = encryptApiKey(
        "sandbox-test-api-key",
        publicKey
    );

    const second = encryptApiKey(
        "sandbox-test-api-key",
        publicKey
    );

    expect(first).not.toBe(second);
  });

  it("should reject an empty API key", () => {
    expect(() =>
        encryptApiKey("", publicKey)
    ).toThrow("M-Pesa API key is required");
  });

  it("should reject an invalid public key", () => {
    expect(() =>
        encryptApiKey(
        "sandbox-test-api-key",
        "invalid-key"
        )
    ).toThrow("Invalid RSA public key");
  });

  it("should create Bearer authentication headers", () => {
    const headers = createAuthHeaders({
        apiKey: "sandbox-test-api-key",
        publicKey,
        serviceProviderCode: "171717",
    });

    expect(headers.Authorization).toMatch(
        /^Bearer [A-Za-z0-9+/]+={0,2}$/
    );

    expect(headers.Accept).toBe("application/json");

    expect(headers["Content-Type"]).toBe(
        "application/json"
    );
  });

  it("should reject missing service provider code", () => {
    expect(() =>
        createAuthHeaders({
        apiKey: "sandbox-test-api-key",
        publicKey,
        })
    ).toThrow(
        "M-Pesa service provider code is required"
    );
  });

  it("should reject invalid public keys", () => {
    expect(() =>
        createAuthHeaders({
        apiKey: "sandbox-test-api-key",
        publicKey: "invalid-key",
        serviceProviderCode: "171717",
        })
    ).toThrow("Invalid RSA public key");
  });

  it("should create a new token on each invocation", () => {
    const config = {
        apiKey: "sandbox-test-api-key",
        publicKey,
        serviceProviderCode: "171717",
    };

    const first = createAuthHeaders(config);
    const second = createAuthHeaders(config);

    expect(first.Authorization).not.toBe(
        second.Authorization
    );
  });
});
