# Whales SDK

A Solana SDK for interacting with the Whales PreMarket program. This SDK provides a simple interface for creating, matching, and filling offers, as well as settling orders.

## Installation

```bash
# Using npm
npm install whales-sdk

# Using yarn
yarn add whales-sdk

# Using pnpm
pnpm add whales-sdk
```

## Usage

```typescript
import { PreMarketSolana } from 'whales-sdk';
import { Connection } from '@solana/web3.js';

// Initialize the SDK
const connection = new Connection('https://api.mainnet-beta.solana.com');
const programId = 'your_program_id';

const preMarket = new PreMarketSolana(connection, programId);

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

## API Reference

### PreMarketSolana

#### Constructor

```typescript
constructor(connection: Connection, programId: string)
```

#### Methods

- `initialize(config: { configAccountPubKey: string }): Promise<void>` - Initialize the PreMarket instance
- `setSigner(signer: SolanaSigner): void` - Set the signer for this PreMarket instance
- `removeSigner(): void` - Remove the current signer from this PreMarket instance
- `getSigner(): SolanaSigner | undefined` - Get the current signer
- `getSignerPublicKey(): PublicKey | null` - Get the public key of the current signer
- `getLastOfferId(): Promise<number>` - Get the last offer ID
- `getLastOrderId(): Promise<number>` - Get the last order ID
- `getOffer(offerId: number): Promise<OfferData>` - Get an offer by ID
- `getOrder(orderId: number): Promise<OrderData>` - Get an order by ID
- `createOffer(params: CreateOfferParams): Promise<Transaction>` - Create a new offer
- `matchOffer(params: MatchOfferParams): Promise<Transaction>` - Match multiple offers and create a new offer with the remaining amount
- `fillOffer(offerId: number, amount: number, user?: string): Promise<Transaction>` - Fill an existing offer
- `cancelOffer(offerId: number): Promise<Transaction>` - Cancel an offer
- `settleOrder(orderId: number): Promise<Transaction>` - Settle a filled order
- `isAcceptedToken(token: string): Promise<boolean>` - Check if a token is accepted for trading
- `getConfig(): Promise<MarketConfig>` - Get configuration data for the PreMarket
- `getPreMarketInstance(): PreMarketOriginal` - Get the underlying PreMarket instance
- `setTokenAcceptance(token: string, isAccepted: boolean): Promise<Transaction>` - Set a token's acceptance status
- `getTokenConfig(tokenId: number): Promise<any>` - Get token configuration
- `settleOrderWithDiscount(orderId: number, settleVerifier: string, buyerFeeDiscount: number, sellerFeeDiscount: number): Promise<Transaction>` - Settle an order with discount
- `cancelOrder(orderId: number): Promise<Transaction>` - Cancel an order
- `signAndSendTransaction(tx: Transaction, callbacks?: TransactionCallbacks): Promise<TransactionResult>` - Sign and send a transaction
- `getTransactionStatus(txHash: string): Promise<TransactionStatus>` - Get the status of a transaction

## Types

### SolanaSigner

```typescript
type SolanaSigner = Keypair | WalletContextState;
```

### OfferData

```typescript
interface OfferData {
  offerType: number;
  tokenId: string;
  exToken: string;
  amount: number;
  value: number;
  collateral: number;
  filledAmount: number;
  status: number;
  offeredBy: string;
  fullMatch: boolean;
}
```

### OrderData

```typescript
interface OrderData {
  offerId: number;
  amount: number;
  seller: string;
  buyer: string;
  status: number;
}
```

### CreateOfferParams

```typescript
interface CreateOfferParams {
  offerType: number;
  tokenId: string;
  amount: number;
  value: number;
  exToken?: string;
  fullMatch?: boolean;
}
```

### MatchOfferParams

```typescript
interface MatchOfferParams {
  offerIds: number[];
  tokenId: string;
  totalAmount: number;
  totalValue: number;
  offerType: number;
  exToken: string;
  newOfferFullMatch: boolean;
}
```

### MarketConfig

```typescript
interface MarketConfig {
  pledgeRate: number;
  feeRefund: number;
  feeSettle: number;
  feeWallet: string;
}
```

### TransactionStatus

```typescript
interface TransactionStatus {
  status: boolean | null;
  confirmations: number;
  isCompleted: boolean;
  attempts: number;
}
```

### TransactionResult

```typescript
interface TransactionResult {
  transaction: {
    hash: string;
  };
  status: TransactionStatus;
}
```

### TransactionCallbacks

```typescript
interface TransactionCallbacks {
  onSubmit?: (txHash: string) => void | Promise<void>;
  onFinally?: (status: TransactionStatus & { txHash: string }) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
}
```

## License

MIT 