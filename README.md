
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

- [x] TypeScript SDK architecture
- [x] HTTP client
- [x] Payment validation
- [x] Mock payment simulation
- [x] Mock transaction lifecycle
- [x] Mock transaction history
- [x] RSA public key validation
- [x] RSA encryption utilities
- [x] Authentication header generation
- [x] HTTPS enforcement
- [x] Authenticated origin allowlist
- [x] Automated tests
- [x] Executable sandbox demonstration
- [ ] Official M-Pesa gateway validation
- [ ] Real C2B payments
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

## Authentication and Security

The SDK provides utilities for preparing M-Pesa Mozambique authentication.

**Important:** Authentication with the official M-Pesa gateway has not yet been verified. The SDK does not currently support production payments.

### Credential Validation

```ts
import { validateCredentials } from "mpesa-node-sdk";

const credentials = validateCredentials({
  apiKey: process.env.MPESA_API_KEY!,
  publicKey: process.env.MPESA_PUBLIC_KEY!,
  serviceProviderCode:
    process.env.MPESA_SERVICE_PROVIDER_CODE!,
});
```

### RSA Encryption

The SDK includes RSA PKCS#1 v1.5 encryption and Base64 encoding.

```ts
import { encryptApiKey } from "mpesa-node-sdk";

const token = encryptApiKey(
  process.env.MPESA_API_KEY!,
  process.env.MPESA_PUBLIC_KEY!
);
```

This implements a cryptographic operation used by some M-Pesa Mozambique integrations. Compatibility with the official gateway must be verified.

### Authentication Headers

```ts
import { createAuthHeaders } from "mpesa-node-sdk";

const headers = createAuthHeaders({
  apiKey: process.env.MPESA_API_KEY!,
  publicKey: process.env.MPESA_PUBLIC_KEY!,
  serviceProviderCode:
    process.env.MPESA_SERVICE_PROVIDER_CODE!,
});
```

### HTTP Security

The HTTP client includes:

- HTTPS enforcement for authenticated requests
- Explicit allowlist of authorized HTTPS origins
- Endpoint path validation
- Redirect rejection
- Request timeout handling
- Generic error messages that avoid embedding credentials

Authenticated requests require an explicitly approved destination.

```ts
import { HttpClient } from "mpesa-node-sdk";

const client = new HttpClient({
  baseUrl: "https://example.com/mock/",
  allowedAuthOrigins: ["https://example.com"],
});
```

The URL above is illustrative and is not an official M-Pesa endpoint.

### Security Limitations

- Official API authentication has not been verified.
- Production payment operations are disabled.
- Authentication destinations must be configured by trusted server-side code.
- The HTTP client is not a complete SSRF protection mechanism.
- Credentials must never be placed in frontend code or committed to version control.
- Real API integration requires additional security testing and official gateway validation.

## License

MIT
