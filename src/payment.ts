import { MpesaError } from "./errors.js";
import type { PaymentRequest } from "./types.js";

export function validatePayment(
  request: PaymentRequest
): void {
  // Validate Mozambique phone number format
  if (
    typeof request.phone !== "string" ||
    !/^2588\d{8}$/.test(request.phone)
  ) {
    throw new MpesaError(
      "Invalid Mozambique phone number",
      "INVALID_PHONE"
    );
  }

  // Validate payment amount
  if (
    typeof request.amount !== "number" ||
    !Number.isFinite(request.amount) ||
    request.amount <= 0
  ) {
    throw new MpesaError(
      "Amount must be greater than zero",
      "INVALID_AMOUNT"
    );
  }

  // Allow at most two decimal places
  if (
    !Number.isSafeInteger(
      Math.round(request.amount * 100)
    ) ||
    Math.abs(
      request.amount * 100 -
      Math.round(request.amount * 100)
    ) > 1e-7
  ) {
    throw new MpesaError(
      "Amount must have at most two decimal places",
      "INVALID_AMOUNT"
    );
  }

  // Validate optional reference
  if (
    request.reference !== undefined &&
    (
      typeof request.reference !== "string" ||
      !/^[a-zA-Z0-9_-]{1,50}$/.test(request.reference)
    )
  ) {
    throw new MpesaError(
      "Invalid payment reference",
      "INVALID_REFERENCE"
    );
  }
}
