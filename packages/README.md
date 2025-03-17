# Whales SDK Monorepo

This monorepo contains two versions of the Whales SDK:

1. **whales-sdk**: The original SDK with Anchor support for Node.js environments
2. **whales-mobile-sdk**: A mobile-friendly version without Anchor dependency for React Native

## Packages

### @whales/core

Core functionality and interfaces shared between both SDKs.

### whales-sdk

The original SDK with Anchor support for Node.js environments.

### whales-mobile-sdk

A mobile-friendly version of the SDK that replaces Anchor dependencies with API calls, making it compatible with React Native.

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Testing

```bash
# Run tests for all packages
pnpm test
```

## Usage

### whales-sdk (Node.js)

```typescript
import { PreMarketSolana } from 'whales-sdk';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const programId = 'your_program_id';

const preMarket = new PreMarketSolana(connection, programId);
// Use as normal
```

### whales-mobile-sdk (React Native)

```typescript
import { PreMarketSolanaMobile } from 'whales-mobile-sdk';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const programId = 'your_program_id';
const apiBaseUrl = 'https://your-api-endpoint.com';

const preMarket = new PreMarketSolanaMobile(connection, programId, apiBaseUrl);
// Use the same way as the original SDK
```

## API Server Requirements

The mobile SDK requires an API server that implements the following endpoints:

- `GET /offers/{offerId}`: Get offer account data
- `GET /orders/{orderId}`: Get order account data
- `GET /config/{configAccountPubKey}`: Get config account data
- `GET /tokens/{tokenId}/config`: Get token config account data
- `GET /ex-tokens/{tokenAddress}`: Get ex-token account data
- `POST /bootstrap`: Bootstrap the PreMarket
- `GET /offers/last-id`: Get the last offer ID
- `GET /orders/last-id`: Get the last order ID
- `POST /offers/create`: Create an offer
- `POST /offers/{offerId}/fill`: Fill an offer
- `POST /offers/{offerId}/close`: Close an unfilled offer
- `POST /orders/{orderId}/settle`: Settle an order
- `POST /ex-tokens/set-acceptance`: Set ex-token acceptance
- `POST /orders/{orderId}/settle-with-discount`: Settle an order with discount
- `POST /orders/{orderId}/cancel`: Cancel an order

## License

MIT 