
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
- [x] SDK architecture
- [x] Initial unit tests
- [ ] HTTP client
- [ ] Payment operations
- [ ] Transaction queries
- [ ] Refund support (subject to API capabilities)
- [ ] Sandbox integration
- [ ] npm publication

## Security

Never commit real API keys or credentials.

Keep payment credentials on the server side and use environment variables.

## License

MIT
