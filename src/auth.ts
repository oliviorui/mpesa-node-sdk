import {
  createPublicKey,
  publicEncrypt,
  constants,
} from "node:crypto";

import { validateCredentials } from "./credentials.js";
import type { MpesaConfig } from "./types.js";

import { MpesaError } from "./errors.js";

/**
 * Normalizes and validates an RSA public key.
 *
 * Accepts:
 * - PEM encoded public keys
 * - Base64 encoded SubjectPublicKeyInfo (SPKI)
 */
export function normalizePublicKey(
  publicKey: string
): string {
  if (
    typeof publicKey !== "string" ||
    !publicKey.trim()
  ) {
    throw new MpesaError(
      "M-Pesa public key is required",
      "INVALID_PUBLIC_KEY"
    );
  }

  const value = publicKey.trim();

  const pem = value.startsWith("-----BEGIN")
    ? value
    : [
        "-----BEGIN PUBLIC KEY-----",
        value.replace(/\s/g, "").match(/.{1,64}/g)?.join("\n") ?? "",
        "-----END PUBLIC KEY-----",
      ].join("\n");

  try {
    const key = createPublicKey(pem);

    if (key.asymmetricKeyType !== "rsa") {
      throw new Error("Expected RSA public key");
    }

    return key.export({
      type: "spki",
      format: "pem",
    }).toString();
  } catch {
    throw new MpesaError(
      "Invalid RSA public key",
      "INVALID_PUBLIC_KEY"
    );
  }
}

/**
 * Encrypts an API key using an RSA public key.
 *
 * Returns the encrypted result encoded in Base64.
 *
 * This is a cryptographic primitive.
 * Gateway authentication is not yet implemented.
 */
export function encryptApiKey(
  apiKey: string,
  publicKey: string
): string {
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    throw new MpesaError(
      "M-Pesa API key is required",
      "INVALID_API_KEY"
    );
  }

  const normalizedKey = normalizePublicKey(publicKey);

  try {
    const encrypted = publicEncrypt(
      {
        key: normalizedKey,
        padding: constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(apiKey.trim(), "utf8")
    );

    return encrypted.toString("base64");
  } catch {
    throw new MpesaError(
      "Failed to encrypt M-Pesa API key",
      "ENCRYPTION_ERROR"
    );
  }
}


/**
 * Builds authentication headers for the
 * M-Pesa Mozambique API.
 *
 * Does not perform HTTP requests.
 */
export function createAuthHeaders(
  config: MpesaConfig
): Record<string, string> {
  const credentials = validateCredentials(config);

  const token = encryptApiKey(
    credentials.apiKey,
    credentials.publicKey
  );

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}
