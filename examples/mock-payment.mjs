import { Mpesa } from "../dist/index.js";

async function main() {
  console.log("=== M-Pesa Sandbox Demo ===");

  const mpesa = new Mpesa({
    apiKey: "sandbox-test-key",
    environment: "sandbox",
  });

  const request = {
    phone: "258841234567",
    amount: 1500,
    reference: "ORDER-001",
  };

  // Step 1: Create a pending payment
  const payment = await mpesa.mockPayment(request);

  console.log("\n1. Payment created:");
  console.log(payment);

  // Step 2: Simulate payment confirmation
  const updated = mpesa.updateMockTransaction(
    payment.transactionId,
    "success"
  );

  console.log("\n2. Payment confirmed:");
  console.log(updated);

  // Step 3: Retrieve the transaction
  const transaction = mpesa.getMockTransaction(
    payment.transactionId
  );

  console.log("\n3. Transaction details:");
  console.log(transaction);

  // Step 4: List transaction history
  const history = mpesa.getMockTransactions();

  console.log("\n4. Transaction history:");
  console.table(history);
}

main().catch((error) => {
  console.error("Demo failed:", error);
  process.exitCode = 1;
});
