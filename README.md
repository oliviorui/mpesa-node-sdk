
# M-Pesa Node SDK

A TypeScript SDK for integrating M-Pesa payments in Mozambique.

> [!WARNING]
> This project is under development. Payment operations are not yet implemented. No real transactions are supported.

## Features

- TypeScript support
- ESM module exports
- Configurable sandbox and production environments
- API key validation
- Custom error class
- Automated tests with Vitest

## Tech Stack

- Node.js
- TypeScript
- Vitest

## Requirements

- Node.js 24+
- npm

## Installation

Clone the repository:

```bash
git clone https://github.com/oliviorui/mpesa-node-sdk.git
cd mpesa-node-sdk
npm ci
```

## Usage

```ts
import { Mpesa } from "mpesa-node-sdk";

const mpesa = new Mpesa({
  apiKey: process.env.MPESA_API_KEY!,
  environment: "sandbox",
});

console.log(mpesa.getEnvironment());
```

The SDK is not yet published to npm. The example above illustrates its intended public API.

## Development

Build the library:

```bash
npm run build
```

Check TypeScript types:

```bash
npm run typecheck
```

Run automated tests:

```bash
npm run test:run
```

Run tests in watch mode:

```bash
npm test
```

## Roadmap

- [x] Initial project setup
- [x] TypeScript configuration
- [x] HTTP client
- [x] Error handling
- [x] Payment validation
- [x] Mock payment simulation
- [x] Transaction state management
- [x] Transaction history
- [x] Automated unit and integration tests
- [x] Executable sandbox demonstration
- [ ] Official M-Pesa authentication
- [ ] Real C2B payment integration
- [ ] Official transaction status queries
- [ ] Transaction reversals
- [ ] npm publication

## Security

Never commit real API keys or credentials.

Keep payment credentials on the server side and use environment variables.

## Sandbox Payment Simulation

The SDK includes an in-memory payment simulator for development and testing.

No real M-Pesa transactions are performed.

### Create a mock payment

```ts
import { Mpesa } from "mpesa-node-sdk";

const mpesa = new Mpesa({
  apiKey: "sandbox-test-key",
  environment: "sandbox",
});

const payment = await mpesa.mockPayment(
  {
    phone: "258841234567",
    amount: 1500,
    reference: "ORDER-001",
  },
  "success"
);

console.log(payment);
```

### Supported mock statuses

- `success` — Simulated successful payment
- `failed` — Simulated failed payment
- `pending` — Simulated pending payment (default)

### Retrieve a mock transaction

```ts
const transaction = mpesa.getMockTransaction(
  payment.transactionId
);

console.log(transaction);
```

Mock transactions are stored in memory and are not persisted between SDK instances or application restarts.

## Payment Validation

The SDK currently validates:

- Mozambique phone number format
- Positive and finite payment amounts
- Maximum of two decimal places
- Optional payment references

These are preliminary SDK validation rules, not a guarantee that a phone number is registered with M-Pesa or that the amount meets official transaction limits.

## Run the Example

```bash
npm run example:mock
```

This command builds the SDK and executes a complete mock payment example.

## Current Limitations

- Real M-Pesa authentication is not implemented
- Real payment requests are not supported
- Production payments are disabled
- Mock transactions are stored in memory
- Transaction reversal and refund operations are not implemented
- The SDK has not been published to npm
```

## Mock Transaction Lifecycle

The SDK supports simulated payment lifecycle management.

Mock transactions can transition from `pending` to either
`success` or `failed`.

Finalized transactions cannot be modified.

### Create a pending payment

```ts
const payment = await mpesa.mockPayment({
  phone: "258841234567",
  amount: 1500,
  reference: "ORDER-001",
});

console.log(payment.status); // pending
```

### Confirm a payment

```ts
const updated = mpesa.updateMockTransaction(
  payment.transactionId,
  "success"
);

console.log(updated.status); // success
```

### Retrieve a transaction

```ts
const transaction = mpesa.getMockTransaction(
  payment.transactionId
);

console.log(transaction);
```

### List transaction history

```ts
const history = mpesa.getMockTransactions();

console.table(history);
```

### Transaction State Rules

| Current State | Target State | Allowed |
|---|---|---|
| pending | success | Yes |
| pending | failed | Yes |
| pending | pending | No |
| success | failed | No |
| failed | success | No |

Mock transactions are stored in memory and are not persisted
between SDK instances or application restarts.

These states represent local simulations only, not actual
M-Pesa transaction confirmations.

## Error Handling

The SDK provides a custom `MpesaError` class with error codes.

```ts
import { MpesaError } from "mpesa-node-sdk";

try {
  // SDK operation
} catch (error) {
  if (error instanceof MpesaError) {
    console.error(error.code);
    console.error(error.message);
  }
}
```

## Run the Complete Demo

```bash
npm run example:mock
```

The demo creates a pending payment, confirms it, retrieves
the transaction, and displays the transaction history.

## License

MIT
