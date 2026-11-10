import type { MpesaConfig } from "./types.js";

export class Mpesa {
  private readonly config: MpesaConfig;

  constructor(config: MpesaConfig) {
    if (!config.apiKey) {
      throw new Error("M-Pesa API key is required");
    }

    this.config = {
      environment: "sandbox",
      ...config,
    };
  }

  getEnvironment(): string {
    return this.config.environment ?? "sandbox";
  }
}
