export type MpesaEnvironment =
  | "sandbox"
  | "production";

export interface MpesaConfig {
  apiKey: string;
  publicKey?: string;
  serviceProviderCode?: string;
  environment?: MpesaEnvironment;
  timeout?: number;
}

export interface PaymentRequest {
  phone: string;
  amount: number;
  reference?: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: "pending" | "success" | "failed";
  message: string;
}
