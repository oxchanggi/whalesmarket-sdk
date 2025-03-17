import { ethers } from "ethers";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { TransactionCallbacks, TransactionResult } from "../base/BasePreMarket";
import { signAndSendTransaction as signAndSendEVMTransaction } from "./transaction";
import { signAndSendTransaction as signAndSendSolanaTransaction } from "./solana";

/**
 * Blockchain type enum
 */
export enum BlockchainType {
  EVM = "evm",
  SOLANA = "solana",
}

/**
 * Parameters for EVM transaction
 */
export interface EVMTransactionParams {
  tx: ethers.PopulatedTransaction;
  wallet: ethers.Wallet | ethers.Signer;
  getRandomProvider: () => ethers.providers.Provider;
  contract?: ethers.BaseContract;
}

/**
 * Parameters for Solana transaction
 */
export interface SolanaTransactionParams {
  tx: Transaction;
  signer: Keypair | WalletContextState;
  connection: Connection;
}

/**
 * Union type for transaction parameters
 */
export type TransactionParams =
  | { type: BlockchainType.EVM; params: EVMTransactionParams }
  | { type: BlockchainType.SOLANA; params: SolanaTransactionParams };

/**
 * Universal function to sign and send a transaction on either EVM or Solana
 * @param transactionParams The transaction parameters specific to the blockchain
 * @param callbacks Optional callbacks for transaction events
 * @returns Transaction result with status
 */
export async function signAndSendTransaction(
  transactionParams: TransactionParams,
  callbacks?: TransactionCallbacks
): Promise<TransactionResult> {
  try {
    // Route to the appropriate implementation based on blockchain type
    if (transactionParams.type === BlockchainType.EVM) {
      const { tx, wallet, getRandomProvider, contract } =
        transactionParams.params;
      return await signAndSendEVMTransaction(
        tx,
        wallet,
        getRandomProvider,
        callbacks,
        contract
      );
    } else if (transactionParams.type === BlockchainType.SOLANA) {
      const { tx, signer, connection } = transactionParams.params;
      return await signAndSendSolanaTransaction(
        tx,
        signer,
        connection,
        callbacks
      );
    } else {
      throw new Error("Unsupported blockchain type");
    }
  } catch (error) {
    // Handle any errors that weren't caught by the underlying implementations
    if (callbacks?.onError && error instanceof Error) {
      await callbacks.onError(error);
    }
    throw error;
  }
}

/**
 * Helper function to create EVM transaction parameters
 */
export function createEVMTransactionParams(
  tx: ethers.PopulatedTransaction,
  wallet: ethers.Wallet | ethers.Signer,
  getRandomProvider: () => ethers.providers.Provider,
  contract?: ethers.BaseContract
): TransactionParams {
  return {
    type: BlockchainType.EVM,
    params: {
      tx,
      wallet,
      getRandomProvider,
      contract,
    },
  };
}

/**
 * Helper function to create Solana transaction parameters
 */
export function createSolanaTransactionParams(
  tx: Transaction,
  signer: Keypair | WalletContextState,
  connection: Connection
): TransactionParams {
  return {
    type: BlockchainType.SOLANA,
    params: {
      tx,
      signer,
      connection,
    },
  };
}
