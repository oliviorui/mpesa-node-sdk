import { describe, expect, it } from "vitest";

import { validateCredentials } from "../src/credentials.js";

describe("M-Pesa Credentials Validation", () => {
  const validConfig = {
    apiKey: "test-api-key",
    publicKey: "test-public-key",
    serviceProviderCode: "123456",
  };

  it("should accept complete credentials", () => {
    const result = validateCredentials(validConfig);

    expect(result).toEqual(validConfig);
  });

  it("should reject missing API key", () => {
    expect(() =>
      validateCredentials({
        ...validConfig,
        apiKey: "",
      })
    ).toThrow("M-Pesa API key is required");
  });

  it("should reject missing public key", () => {
    expect(() =>
      validateCredentials({
        ...validConfig,
        publicKey: "",
      })
    ).toThrow("M-Pesa public key is required");
  });

  it("should reject missing service provider code", () => {
    expect(() =>
      validateCredentials({
        ...validConfig,
        serviceProviderCode: "",
      })
    ).toThrow(
      "M-Pesa service provider code is required"
    );
  });

  it("should trim credential whitespace", () => {
    const result = validateCredentials({
      apiKey: "  test-key  ",
      publicKey: "  public-key  ",
      serviceProviderCode: "  123456  ",
    });

    expect(result.apiKey).toBe("test-key");
    expect(result.publicKey).toBe("public-key");
    expect(result.serviceProviderCode).toBe("123456");
  });

  it("should reject whitespace-only credentials", () => {
    expect(() =>
        validateCredentials({
        ...validConfig,
        publicKey: "   ",
        })
    ).toThrow("M-Pesa public key is required");
  });
});
