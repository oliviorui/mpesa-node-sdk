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

  it("should update a pending mock payment to success", async () => {
    const mpesa = new Mpesa({
        apiKey: "test-key",
        environment: "sandbox",
    });

    const payment = await mpesa.mockPayment(paymentRequest);

    expect(payment.status).toBe("pending");

    const updated = mpesa.updateMockTransaction(
        payment.transactionId,
        "success"
    );

    expect(updated.status).toBe("success");

    const transaction = mpesa.getMockTransaction(
        payment.transactionId
    );

    expect(transaction?.status).toBe("success");
  });

  it("should reject updating a finalized transaction", async () => {
    const mpesa = new Mpesa({
        apiKey: "test-key",
    });

    const payment = await mpesa.mockPayment(
        paymentRequest,
        "success"
    );

    expect(() =>
        mpesa.updateMockTransaction(
        payment.transactionId,
        "failed"
        )
    ).toThrow("Transaction is already finalized");
  });

  it("should reject updating mock transactions in production", () => {
    const mpesa = new Mpesa({
        apiKey: "test-key",
        environment: "production",
    });

    expect(() =>
        mpesa.updateMockTransaction(
        "MOCK-123",
        "success"
        )
    ).toThrow("Mock transactions are only available in sandbox");
  });


  it("should return the mock transaction history", async () => {
    const mpesa = new Mpesa({
        apiKey: "test-key",
        environment: "sandbox",
    });

    await mpesa.mockPayment(paymentRequest, "success");
    await mpesa.mockPayment(paymentRequest, "failed");

    const transactions = mpesa.getMockTransactions();

    expect(transactions).toHaveLength(2);
    expect(transactions[0]?.status).toBe("success");
    expect(transactions[1]?.status).toBe("failed");
  });

  it("should return an empty history initially", () => {
    const mpesa = new Mpesa({
        apiKey: "test-key",
    });

    expect(mpesa.getMockTransactions()).toEqual([]);
  });

  it("should reject mock history access in production", () => {
    const mpesa = new Mpesa({
        apiKey: "test-key",
        environment: "production",
    });

    expect(() =>
        mpesa.getMockTransactions()
    ).toThrow(
        "Mock transactions are only available in sandbox"
    );
  });
});
