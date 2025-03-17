# @whales/core

Core functionality and interfaces shared between Whales SDK packages.

## Installation

This package is primarily used as a dependency for other Whales SDK packages. However, you can install it directly if needed:

```bash
# Using npm
npm install @whales/core

# Using yarn
yarn add @whales/core

# Using pnpm
pnpm add @whales/core
```

## Usage

```typescript
import { BasePreMarket, OfferData, OrderData } from '@whales/core';

// Extend BasePreMarket to create your own implementation
class MyPreMarket extends BasePreMarket<MyTransaction, MySigner> {
  // Implement abstract methods
}
```

## API Reference

### BasePreMarket

An abstract base class for PreMarket implementations. This class provides common functionality and interfaces for both Solana and EVM implementations.

```typescript
abstract class BasePreMarket<T, S extends SignerType = SignerType> {
  protected _signer?: S;

  setSigner(signer: S): void;
  removeSigner(): void;
  getSigner(): S | undefined;

  abstract initialize(config: Record<string, unknown>): Promise<void>;
  abstract getLastOfferId(): Promise<number>;
  abstract getLastOrderId(): Promise<number>;
  abstract getOffer(offerId: number): Promise<OfferData>;
  abstract getOrder(orderId: number): Promise<OrderData>;
  abstract createOffer(params: CreateOfferParams): Promise<T>;
  abstract matchOffer(params: MatchOfferParams): Promise<T>;
  abstract fillOffer(offerId: number, amount: number): Promise<T>;
  abstract cancelOffer(offerId: number): Promise<T>;
  abstract settleOrder(orderId: number): Promise<T>;
  abstract isAcceptedToken(token: string): Promise<boolean>;
  abstract getConfig(): Promise<MarketConfig>;
  abstract getTransactionStatus(txHash: string, maxRetries?: number): Promise<TransactionStatus>;
}
```

### Types

#### OfferData

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

#### OrderData

```typescript
interface OrderData {
  offerId: number;
  amount: number;
  seller: string;
  buyer: string;
  status: number;
}
```

#### CreateOfferParams

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

#### MatchOfferParams

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

#### MarketConfig

```typescript
interface MarketConfig {
  pledgeRate: number;
  feeRefund: number;
  feeSettle: number;
  feeWallet: string;
}
```

#### TransactionStatus

```typescript
interface TransactionStatus {
  status: boolean | null;
  confirmations: number;
  isCompleted: boolean;
  attempts: number;
}
```

#### TransactionResult

```typescript
interface TransactionResult {
  transaction: {
    hash: string;
  };
  status: TransactionStatus;
}
```

#### TransactionCallbacks

```typescript
interface TransactionCallbacks {
  onSubmit?: (txHash: string) => void | Promise<void>;
  onFinally?: (status: TransactionStatus & { txHash: string }) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
}
```

#### SignerType

```typescript
interface SignerType {
  publicKey?: string | any;
  connect?: (provider: any) => any;
  sendTransaction?: (...args: any[]) => Promise<any>;
  signTransaction?: (transaction: any) => Promise<any>;
}
```

## License

MIT 