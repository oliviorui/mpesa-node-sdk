import { Mpesa } from "../dist/index.js";

async function main() {
  console.log("=== M-Pesa SDK Sandbox Demo ===");

  const mpesa = new Mpesa({
    apiKey: "sandbox-test-key",
    environment: "sandbox",
  });

  const request = {
    phone: "258841234567",
    amount: 1500,
    reference: "ORDER-001",
  };

  const payment = await mpesa.mockPayment(
    request,
    "success"
  );

  console.log("\nPayment result:");
  console.log(payment);

  const transaction = mpesa.getMockTransaction(
    payment.transactionId
  );

  console.log("\nTransaction details:");
  console.log(transaction);
}

main().catch((error) => {
  console.error("Demo failed:", error);
  process.exitCode = 1;
});
