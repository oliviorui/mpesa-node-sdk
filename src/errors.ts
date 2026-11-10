export class MpesaError extends Error {
  constructor(
    message: string,
    public readonly code: string = "MPESA_ERROR",
    public readonly statusCode?: number
  ) {
    super(message);

    this.name = "MpesaError";
  }
}
