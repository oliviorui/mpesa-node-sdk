export interface MpesaConfig {
  apiKey: string;
  environment?: "sandbox" | "production";
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
