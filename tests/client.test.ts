import { describe, it, expect } from "vitest";
import { Mpesa } from "../src/client.js";

describe("Mpesa Client", () => {
  it("should create a client with a valid API key", () => {
    const mpesa = new Mpesa({
      apiKey: "test-api-key",
    });

    expect(mpesa).toBeInstanceOf(Mpesa);
  });

  it("should use sandbox environment by default", () => {
    const mpesa = new Mpesa({
      apiKey: "test-api-key",
    });

    expect(mpesa.getEnvironment()).toBe("sandbox");
  });

  it("should accept production environment", () => {
    const mpesa = new Mpesa({
      apiKey: "test-api-key",
      environment: "production",
    });

    expect(mpesa.getEnvironment()).toBe("production");
  });

  it("should throw an error when API key is empty", () => {
    expect(() => {
      new Mpesa({
        apiKey: "",
      });
    }).toThrow("M-Pesa API key is required");
  });

  it("should use 30000ms timeout by default", () => {
    const mpesa = new Mpesa({
        apiKey: "test-api-key",
    });

    expect(mpesa.getTimeout()).toBe(30000);
    });

    it("should accept a custom timeout", () => {
    const mpesa = new Mpesa({
        apiKey: "test-api-key",
        timeout: 5000,
    });

    expect(mpesa.getTimeout()).toBe(5000);
    });

    it("should reject whitespace-only API keys", () => {
    expect(() => {
        new Mpesa({
        apiKey: "   ",
        });
    }).toThrow("M-Pesa API key is required");
    });

    it("should reject invalid timeout", () => {
    expect(() => {
        new Mpesa({
        apiKey: "test-api-key",
        timeout: -1000,
        });
    }).toThrow("Timeout must be a positive integer");
    });
});
