# Whales PreMarket React Library

This library provides React components for interacting with Whales PreMarket contracts on both Solana and EVM chains.

## Installation

```bash
npm install whales-sdk
# or
yarn add whales-sdk
```

## Usage

### Provider Setup

Wrap your application with the `WhalesPreMarketProvider` component:

```tsx
import { WhalesPreMarketProvider } from 'whales-sdk';

const App = () => {
  const markets = [
    {
      id: 'solana-market-1',
      type: 'solana',
      rpc: 'https://api.mainnet-beta.solana.com',
      contractAddress: 'YOUR_PROGRAM_ID',
      configAccountPubKey: 'OPTIONAL_CONFIG_ACCOUNT'
    },
    {
      id: 'evm-market-1',
      type: 'evm',
      rpc: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
      contractAddress: '0xYourContractAddress'
    }
  ];

  return (
    <WhalesPreMarketProvider markets={markets}>
      <YourApp />
    </WhalesPreMarketProvider>
  );
};
```

### Using the Hook

Use the `useWhalesPreMarket` hook in your components:

```tsx
import { useWhalesPreMarket } from 'whales-sdk';

const MarketComponent = () => {
  const { 
    markets,
    isInitialized,
    isLoading,
    error,
    getMarket,
    createOffer,
    fillOffer,
    cancelOffer,
    settleOrder,
    getOffer,
    getOrder,
    getLastOfferId,
    getLastOrderId,
    isAcceptedToken,
    getConfig
  } = useWhalesPreMarket();

  // Example: Create an offer
  const handleCreateOffer = async () => {
    try {
      const params = {
        offerType: 0, // Buy offer
        tokenId: 'token-id',
        amount: 10,
        value: 100,
        exToken: '0xTokenAddress',
        fullMatch: false
      };
      
      const transaction = await createOffer('market-id', params);
      // Handle transaction...
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  // Example: Fill an offer
  const handleFillOffer = async (offerId: number) => {
    try {
      const transaction = await fillOffer('market-id', offerId, 5);
      // Handle transaction...
    } catch (error) {
      console.error('Error filling offer:', error);
    }
  };

  // Rest of your component...
};
```

## API Reference

### WhalesPreMarketProvider

Props:
- `markets`: Array of market configurations
  - `id`: Unique identifier for the market
  - `type`: 'evm' or 'solana'
  - `rpc`: RPC URL for the chain
  - `contractAddress`: Contract address (EVM) or Program ID (Solana)
  - `configAccountPubKey`: (Optional) Config account public key (Solana only)
- `children`: React children

### useWhalesPreMarket

Returns an object with the following properties:

- `markets`: Array of market identifiers
- `isInitialized`: Boolean indicating if markets are initialized
- `isLoading`: Boolean indicating if markets are loading
- `error`: Error object if initialization failed
- `getMarket(id)`: Get a market instance by ID
- `createOffer(marketId, params)`: Create a new offer
- `fillOffer(marketId, offerId, amount)`: Fill an existing offer
- `cancelOffer(marketId, offerId)`: Cancel an offer
- `settleOrder(marketId, orderId)`: Settle a filled order
- `getOffer(marketId, offerId)`: Get offer data
- `getOrder(marketId, orderId)`: Get order data
- `getLastOfferId(marketId)`: Get the last offer ID
- `getLastOrderId(marketId)`: Get the last order ID
- `isAcceptedToken(marketId, token)`: Check if a token is accepted
- `getConfig(marketId)`: Get market configuration 