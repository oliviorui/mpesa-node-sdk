import { MpesaError } from "./errors.js";
import type { MpesaConfig } from "./types.js";

export interface MpesaCredentials {
  apiKey: string;
  publicKey: string;
  serviceProviderCode: string;
}

export function validateCredentials(
  config: MpesaConfig
): MpesaCredentials {
  if (!config.apiKey?.trim()) {
    throw new MpesaError(
      "M-Pesa API key is required",
      "INVALID_API_KEY"
    );
  }

  if (!config.publicKey?.trim()) {
    throw new MpesaError(
      "M-Pesa public key is required",
      "INVALID_PUBLIC_KEY"
    );
  }

  if (!config.serviceProviderCode?.trim()) {
    throw new MpesaError(
      "M-Pesa service provider code is required",
      "INVALID_SERVICE_PROVIDER_CODE"
    );
  }

  return {
    apiKey: config.apiKey.trim(),
    publicKey: config.publicKey.trim(),
    serviceProviderCode: config.serviceProviderCode.trim(),
  };
}
