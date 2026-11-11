import { randomUUID } from "node:crypto";

import { validatePayment } from "./payment.js";

import type {
  PaymentRequest,
  PaymentResponse,
} from "./types.js";

export type MockPaymentStatus = PaymentResponse["status"];

export class MockPaymentService {
  private readonly transactions = new Map<
    string,
    PaymentResponse
  >();

  createPayment(
    request: PaymentRequest,
    status: MockPaymentStatus = "pending"
  ): PaymentResponse {
    validatePayment(request);

    const transactionId = `MOCK-${randomUUID()}`;

    const messages: Record<MockPaymentStatus, string> = {
      success: "Mock payment completed successfully",
      failed: "Mock payment failed",
      pending: "Mock payment is pending",
    };

    const response: PaymentResponse = {
      transactionId,
      status,
      message: messages[status],
    };

    this.transactions.set(transactionId, response);

    return { ...response };
  }

  getTransaction(
    transactionId: string
  ): PaymentResponse | undefined {
    const transaction = this.transactions.get(transactionId);

    return transaction ? { ...transaction } : undefined;
  }

  getTransactions(): PaymentResponse[] {
    return Array.from(
      this.transactions.values(),
      (transaction) => ({ ...transaction })
    );
  }
}
