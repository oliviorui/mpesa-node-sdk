import { MpesaError } from "./errors.js";
import type { HttpClient } from "./http.js";
import { validatePayment } from "./payment.js";

import { MockPaymentService } from "./mock-payment.js";

import type {
  MockPaymentStatus,
} from "./mock-payment.js";

import type {
  MpesaConfig,
  MpesaEnvironment,
  PaymentRequest,
  PaymentResponse,
} from "./types.js";

export class Mpesa {
  private readonly mockService = new MockPaymentService();
  private readonly config: Required<
    Pick<MpesaConfig, "apiKey" | "environment" | "timeout">
  > & Omit<MpesaConfig, "apiKey" | "environment" | "timeout">;

  private readonly httpClient?: HttpClient;

  constructor(config: MpesaConfig, httpClient?: HttpClient) {
    if (!config.apiKey?.trim()) {
      throw new MpesaError(
        "M-Pesa API key is required",
        "INVALID_API_KEY"
      );
    }

    const environment = config.environment ?? "sandbox";

    if (
      environment !== "sandbox" &&
      environment !== "production"
    ) {
      throw new MpesaError(
        "Invalid M-Pesa environment",
        "INVALID_ENVIRONMENT"
      );
    }

    const timeout = config.timeout ?? 30000;

    if (
      !Number.isSafeInteger(timeout) ||
      timeout <= 0
    ) {
      throw new MpesaError(
        "Timeout must be a positive integer",
        "INVALID_TIMEOUT"
      );
    }

    this.config = {
      ...config,
      apiKey: config.apiKey.trim(),
      environment,
      timeout,
    };

    this.httpClient = httpClient;
  }

  getEnvironment(): MpesaEnvironment {
    return this.config.environment;
  }

  getTimeout(): number {
    return this.config.timeout;
  }

  async payment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    if (this.config.environment !== "sandbox") {
      throw new MpesaError(
        "Production payments are not implemented",
        "NOT_IMPLEMENTED"
      );
    }

    if (!this.httpClient) {
      throw new MpesaError(
        "Sandbox HTTP client is not configured",
        "TRANSPORT_NOT_CONFIGURED"
      );
    }

    validatePayment(request);

    return this.httpClient.post<PaymentResponse>(
      "/payment",
      request
    );
  }

  async mockPayment(
    request: PaymentRequest,
    status: MockPaymentStatus = "pending"
  ): Promise<PaymentResponse> {
    if (this.config.environment !== "sandbox") {
      throw new MpesaError(
        "Mock payments are only available in sandbox",
        "MOCK_NOT_ALLOWED"
      );
    }

    return this.mockService.createPayment(request, status);
  }

  getMockTransaction(
    transactionId: string
  ): PaymentResponse | undefined {
    if (this.config.environment !== "sandbox") {
      throw new MpesaError(
        "Mock transactions are only available in sandbox",
        "MOCK_NOT_ALLOWED"
      );
    }

    return this.mockService.getTransaction(transactionId);
  }

  updateMockTransaction(
    transactionId: string,
    status: MockPaymentStatus
  ): PaymentResponse {
    if (this.config.environment !== "sandbox") {
      throw new MpesaError(
        "Mock transactions are only available in sandbox",
        "MOCK_NOT_ALLOWED"
      );
    }

    return this.mockService.updateTransaction(
      transactionId,
      status
    );
  }

  getMockTransactions(): PaymentResponse[] {
    if (this.config.environment !== "sandbox") {
      throw new MpesaError(
        "Mock transactions are only available in sandbox",
        "MOCK_NOT_ALLOWED"
      );
    }

    return this.mockService.getTransactions();
  }
}
