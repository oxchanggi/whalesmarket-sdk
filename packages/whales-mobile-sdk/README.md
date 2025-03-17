# Whales Mobile SDK

A mobile-friendly version of the Whales SDK for React Native applications. This SDK provides the same functionality as the original Whales SDK but without the Anchor dependency, making it compatible with React Native.

## Installation

```bash
# Using npm
npm install whales-mobile-sdk

# Using yarn
yarn add whales-mobile-sdk

# Using pnpm
pnpm add whales-mobile-sdk
```

## Usage

```typescript
import { PreMarketSolanaMobile } from 'whales-mobile-sdk';
import { Connection } from '@solana/web3.js';

// Initialize the SDK
const connection = new Connection('https://api.mainnet-beta.solana.com');
const programId = 'your_program_id';
const apiBaseUrl = 'https://your-api-endpoint.com';

const preMarket = new PreMarketSolanaMobile(connection, programId, apiBaseUrl);

// Initialize the PreMarket
await preMarket.initialize({ configAccountPubKey: 'your_config_account' });

// Set a signer
import { Keypair } from '@solana/web3.js';
const keypair = Keypair.generate();
preMarket.setSigner(keypair);

// Create an offer
const offerTx = await preMarket.createOffer({
  offerType: 0, // 0 for buy, 1 for sell
  tokenId: '1',
  amount: 1,
  value: 1,
  exToken: 'So11111111111111111111111111111111111111112', // SOL
  fullMatch: false
});

// Sign and send the transaction
const result = await preMarket.signAndSendTransaction(offerTx);
console.log('Transaction hash:', result.transaction.hash);
```

## API Server Requirements

This SDK requires an API server that implements the following endpoints:

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

## API Response Format

The API server should return responses in the following format:

### Offer Account

```json
{
  "id": 1,
  "offerType": "Buy",
  "tokenConfig": "1",
  "exToken": "So11111111111111111111111111111111111111112",
  "totalAmount": 1000000,
  "price": 1000000000,
  "collateral": 0,
  "filledAmount": 0,
  "status": "Open",
  "authority": "11111111111111111111111111111111",
  "isFullMatch": false
}
```

### Order Account

```json
{
  "offer": 1,
  "amount": 1000000,
  "seller": "11111111111111111111111111111111",
  "buyer": "11111111111111111111111111111111",
  "status": "Open"
}
```

### Config Account

```json
{
  "feeRefund": 10,
  "feeSettle": 10,
  "feeWallet": "11111111111111111111111111111111"
}
```

### Transaction Response

```json
{
  "transaction": "base64_encoded_transaction"
}
```

## License

MIT 