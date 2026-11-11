import { describe, expect, it } from "vitest";

import { MockPaymentService } from "../src/mock-payment.js";

describe("MockPaymentService", () => {
  const validPayment = {
    phone: "258841234567",
    amount: 1500,
    reference: "ORDER-001",
  };

  it("should simulate a successful payment", () => {
    const service = new MockPaymentService();

    const result = service.createPayment(
      validPayment,
      "success"
    );

    expect(result.status).toBe("success");
    expect(result.transactionId).toMatch(/^MOCK-/);
  });

  it("should simulate a failed payment", () => {
    const service = new MockPaymentService();

    const result = service.createPayment(
      validPayment,
      "failed"
    );

    expect(result.status).toBe("failed");
    expect(result.message).toBe("Mock payment failed");
  });

  it("should use pending status by default", () => {
    const service = new MockPaymentService();

    const result = service.createPayment(validPayment);

    expect(result.status).toBe("pending");
  });

  it("should reject invalid payment data", () => {
    const service = new MockPaymentService();

    expect(() =>
      service.createPayment({
        phone: "123456",
        amount: -100,
      })
    ).toThrow("Invalid Mozambique phone number");

    expect(service.getTransactions()).toHaveLength(0);
  });

  it("should retrieve a transaction by ID", () => {
    const service = new MockPaymentService();

    const payment = service.createPayment(
      validPayment,
      "success"
    );

    const transaction = service.getTransaction(
      payment.transactionId
    );

    expect(transaction).toEqual(payment);
  });

  it("should generate unique transaction IDs", () => {
    const service = new MockPaymentService();

    const first = service.createPayment(
      validPayment,
      "success"
    );

    const second = service.createPayment(
      validPayment,
      "pending"
    );

    expect(first.transactionId).not.toBe(
      second.transactionId
    );

    expect(service.getTransactions()).toHaveLength(2);
  });

  it("should protect stored transactions from external changes", () => {
    const service = new MockPaymentService();

    const payment = service.createPayment(validPayment);

    payment.status = "success";

    const stored = service.getTransaction(
        payment.transactionId
    );

    expect(stored?.status).toBe("pending");
    });

    it("should protect transaction history from external changes", () => {
    const service = new MockPaymentService();

    const payment = service.createPayment(validPayment);

    const history = service.getTransactions();

    expect(history).toHaveLength(1);

    history[0]!.status = "failed";

    expect(
        service.getTransaction(payment.transactionId)?.status
    ).toBe("pending");
  });

  it("should reject invalid mock payment statuses", () => {
    const service = new MockPaymentService();

    expect(() =>
        service.createPayment(
        validPayment,
        "cancelled" as never
        )
    ).toThrow("Invalid mock payment status");

    expect(service.getTransactions()).toHaveLength(0);
  });

  it("should reject invalid status without creating a transaction", () => {
    const service = new MockPaymentService();

    try {
        service.createPayment(
        validPayment,
        "unknown" as never
        );

        expect.fail("Expected an invalid status error");
    } catch (error) {
        expect(error).toMatchObject({
        name: "MpesaError",
        code: "INVALID_TRANSACTION_STATUS",
        });
    }

    expect(service.getTransactions()).toEqual([]);
  });
});
