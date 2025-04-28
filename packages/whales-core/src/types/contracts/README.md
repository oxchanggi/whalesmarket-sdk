# Contract Types

This directory contains TypeScript types auto-generated from ABI files using TypeChain.

## Structure

- `*.ts` - Interface types for contracts
- `/factories/` - Factory classes for contract instantiation
- `/common.ts` - Common types used across contracts

## Usage

### Import Contract Types

```typescript
import { PreMarket } from '@whalesmarket/core/src/types/contracts';
```

### Connect to an Existing Contract

```typescript
import { ethers } from 'ethers';
import { PreMarket__factory } from '@whalesmarket/core/src/types/contracts';

// Set up provider
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

// Connect to an existing contract with typed interface
const preMarketContract = PreMarket__factory.connect(contractAddress, provider);

// Use typed methods
const config = await preMarketContract.config();
```

### Deploy a New Contract

```typescript
import { ethers } from 'ethers';
import { PreMarket__factory } from '@whalesmarket/core/src/types/contracts';

// Set up signer
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);

// Deploy a new contract
const preMarketFactory = new PreMarket__factory(signer);
const preMarketContract = await preMarketFactory.deploy();
await preMarketContract.deployed();

console.log('Contract deployed to:', preMarketContract.address);
```

## Regenerating Types

The types are automatically generated during the build process. To manually regenerate:

```bash
pnpm run generate-types
```

This will process all ABI files in `src/abi/*.json` and update the type files accordingly. 