import { describe, expect, it } from "vitest";
import { Mpesa } from "../src/client.js";

describe("Mpesa Mock Integration", () => {
  const paymentRequest = {
    phone: "258841234567",
    amount: 1500,
    reference: "ORDER-001",
  };

  it("should create a mock payment", async () => {
    const mpesa = new Mpesa({
      apiKey: "test-key",
      environment: "sandbox",
    });

    const result = await mpesa.mockPayment(
      paymentRequest,
      "success"
    );

    expect(result.status).toBe("success");
    expect(result.transactionId).toMatch(/^MOCK-/);
  });

  it("should retrieve a mock transaction", async () => {
    const mpesa = new Mpesa({
      apiKey: "test-key",
    });

    const payment = await mpesa.mockPayment(
      paymentRequest,
      "pending"
    );

    const transaction = mpesa.getMockTransaction(
      payment.transactionId
    );

    expect(transaction).toEqual(payment);
  });

  it("should reject mock payments in production", async () => {
    const mpesa = new Mpesa({
      apiKey: "test-key",
      environment: "production",
    });

    await expect(
      mpesa.mockPayment(paymentRequest)
    ).rejects.toMatchObject({
      code: "MOCK_NOT_ALLOWED",
    });
  });

  it("should reject mock transaction queries in production", () => {
    const mpesa = new Mpesa({
      apiKey: "test-key",
      environment: "production",
    });

    expect(() =>
      mpesa.getMockTransaction("MOCK-123")
    ).toThrow(
      "Mock transactions are only available in sandbox"
    );
  });
});
