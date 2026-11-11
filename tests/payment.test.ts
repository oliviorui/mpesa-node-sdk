import { describe, expect, it } from "vitest";

import { validatePayment } from "../src/payment.js";

describe("Payment Validation", () => {
  const validPayment = {
    phone: "258841234567",
    amount: 1500,
    reference: "ORDER-001",
  };

  it("should accept a valid payment", () => {
    expect(() =>
      validatePayment(validPayment)
    ).not.toThrow();
  });

  it("should reject an invalid phone", () => {
    expect(() =>
      validatePayment({
        ...validPayment,
        phone: "123456",
      })
    ).toThrow("Invalid Mozambique phone number");
  });

  it("should reject negative amounts", () => {
    expect(() =>
      validatePayment({
        ...validPayment,
        amount: -100,
      })
    ).toThrow("Amount must be greater than zero");
  });

  it("should reject zero amounts", () => {
    expect(() =>
      validatePayment({
        ...validPayment,
        amount: 0,
      })
    ).toThrow("Amount must be greater than zero");
  });

  it("should reject non-finite amounts", () => {
    try {
        validatePayment({
        ...validPayment,
        amount: Infinity,
        });

        expect.fail("Expected validation to throw");
  } catch (error) {
        expect(error).toMatchObject({
        name: "MpesaError",
        code: "INVALID_AMOUNT",
        });
    }
  });

  it("should reject more than two decimal places", () => {
    expect(() =>
      validatePayment({
        ...validPayment,
        amount: 1500.123,
      })
    ).toThrow(
      "Amount must have at most two decimal places"
    );
  });

  it("should reject invalid references", () => {
    expect(() =>
      validatePayment({
        ...validPayment,
        reference: "ORDER 001!",
      })
    ).toThrow("Invalid payment reference");
  });

  it("should accept payments without reference", () => {
    expect(() =>
      validatePayment({
        phone: "258841234567",
        amount: 500.5,
      })
    ).not.toThrow();
  });
});
