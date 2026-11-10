import { MpesaError } from "./errors.js";

import type {
  MpesaConfig,
  MpesaEnvironment,
} from "./types.js";

export class Mpesa {
  private readonly config: Required<
    Pick<MpesaConfig, "apiKey" | "environment" | "timeout">
  > & Omit<MpesaConfig, "apiKey" | "environment" | "timeout">;

  constructor(config: MpesaConfig) {
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
  }

  getEnvironment(): MpesaEnvironment {
    return this.config.environment;
  }

  getTimeout(): number {
    return this.config.timeout;
  }
}
