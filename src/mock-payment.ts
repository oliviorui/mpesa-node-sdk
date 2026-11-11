import { randomUUID } from "node:crypto";

import { validatePayment } from "./payment.js";

import type {
  PaymentRequest,
  PaymentResponse,
} from "./types.js";
import { MpesaError } from "./index.js";

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

    if (
        status !== "success" &&
        status !== "failed" &&
        status !== "pending"
    ) {
      throw new MpesaError(
        "Invalid mock payment status",
        "INVALID_TRANSACTION_STATUS"
      );
    }

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

  updateTransaction(
    transactionId: string,
    status: MockPaymentStatus
  ): PaymentResponse {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
        throw new MpesaError(
        "Mock transaction not found",
        "TRANSACTION_NOT_FOUND"
        );
    }

    if (status !== "success" && status !== "failed") {
        throw new MpesaError(
        "Invalid transaction target status",
        "INVALID_TRANSACTION_STATUS"
        );
    }

    if (transaction.status !== "pending") {
        throw new MpesaError(
        "Transaction is already finalized",
        "TRANSACTION_FINALIZED"
        );
    }

    const messages: Record<"success" | "failed", string> = {
        success: "Mock payment completed successfully",
        failed: "Mock payment failed",
    };

    const updated: PaymentResponse = {
        ...transaction,
        status,
        message: messages[status],
    };

    this.transactions.set(transactionId, updated);

    return { ...updated };
    }

  getTransactions(): PaymentResponse[] {
    return Array.from(
      this.transactions.values(),
      (transaction) => ({ ...transaction })
    );
  }
}
