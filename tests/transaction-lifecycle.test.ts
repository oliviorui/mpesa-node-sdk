import { describe, expect, it } from "vitest";
import { MockPaymentService } from "../src/mock-payment.js";

describe("Mock Transaction Lifecycle", () => {
  const request = {
    phone: "258841234567",
    amount: 1500,
    reference: "ORDER-001",
  };

  it("should transition from pending to success", () => {
    const service = new MockPaymentService();
    const payment = service.createPayment(request);

    const updated = service.updateTransaction(
      payment.transactionId,
      "success"
    );

    expect(updated.status).toBe("success");
    expect(
      service.getTransaction(payment.transactionId)?.status
    ).toBe("success");
  });

  it("should transition from pending to failed", () => {
    const service = new MockPaymentService();
    const payment = service.createPayment(request);

    const updated = service.updateTransaction(
      payment.transactionId,
      "failed"
    );

    expect(updated.status).toBe("failed");
  });

  it("should reject an unknown transaction", () => {
    const service = new MockPaymentService();

    expect(() =>
      service.updateTransaction("MOCK-UNKNOWN", "success")
    ).toThrow("Mock transaction not found");
  });

  it("should prevent changing a successful payment", () => {
    const service = new MockPaymentService();

    const payment = service.createPayment(
      request,
      "success"
    );

    expect(() =>
      service.updateTransaction(
        payment.transactionId,
        "failed"
      )
    ).toThrow("Transaction is already finalized");
  });

  it("should prevent changing a failed payment", () => {
    const service = new MockPaymentService();

    const payment = service.createPayment(
      request,
      "failed"
    );

    expect(() =>
      service.updateTransaction(
        payment.transactionId,
        "success"
      )
    ).toThrow("Transaction is already finalized");
  });

  it("should reject pending as a target status", () => {
    const service = new MockPaymentService();
    const payment = service.createPayment(request);

    expect(() =>
        service.updateTransaction(
        payment.transactionId,
        "pending"
        )
    ).toThrow("Invalid transaction target status");

    expect(
        service.getTransaction(payment.transactionId)?.status
    ).toBe("pending");
  });
});
