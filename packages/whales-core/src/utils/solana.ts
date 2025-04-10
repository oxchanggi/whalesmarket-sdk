import { Keypair } from "@solana/web3.js";
import { Connection, Transaction } from "@solana/web3.js";
import {
  TransactionCallbacks,
  TransactionResult,
  TransactionStatus,
} from "../base/BasePreMarket";
import { WalletContextState } from "@solana/wallet-adapter-react";

/**
 * Get the status of a transaction
 * @param txHash The transaction hash
 * @returns The transaction status
 */
export async function getTransactionStatus(
  txHash: string,
  connection: Connection
): Promise<TransactionStatus> {
  try {
    const confirmation = await connection.confirmTransaction(txHash);
    return {
      status: confirmation.value.err ? false : true,
      confirmations: 1,
      isCompleted: true,
      attempts: 1,
    };
  } catch (error) {
    return {
      status: null,
      confirmations: 0,
      isCompleted: false,
      attempts: 1,
    };
  }
}

/**
 * Wait for a Solana transaction to be confirmed
 * @param txHash The transaction hash
 * @param connection The Solana connection
 * @param confirmations Number of confirmations to wait for (default: 1)
 * @param timeout Timeout in milliseconds (default: 60000 - 1 minute)
 * @returns Transaction status
 */
export async function waitSolanaTransaction(
  txHash: string,
  connection: Connection,
  confirmations: number = 1,
  timeout: number = 60000
): Promise<TransactionStatus> {
  const startTime = Date.now();

  // Create a commitment level based on confirmations
  // For Solana, different commitment levels represent different confirmation requirements
  let commitment: "processed" | "confirmed" | "finalized" = "processed";
  if (confirmations >= 1) commitment = "confirmed";
  if (confirmations > 1) commitment = "finalized"; // Finalized is the highest level of confirmation

  try {
    const blockhash = await connection.getLatestBlockhash(commitment);
    // Wait for the transaction to be confirmed
    const result = await connection.confirmTransaction(
      {
        signature: txHash,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
      },
      commitment
    );

    if (result.value.err) {
      return {
        status: false,
        confirmations: 0,
        isCompleted: true,
        attempts: 1,
      };
    }

    // Check if we've reached the timeout
    if (Date.now() - startTime > timeout) {
      return {
        status: null,
        confirmations: 0,
        isCompleted: false,
        attempts: 1,
      };
    }

    return {
      status: true,
      confirmations:
        commitment === "finalized" ? 32 : commitment === "confirmed" ? 1 : 0,
      isCompleted: true,
      attempts: 1,
    };
  } catch (error) {
    // If we reach timeout while waiting
    if (Date.now() - startTime > timeout) {
      return {
        status: null,
        confirmations: 0,
        isCompleted: false,
        attempts: 1,
      };
    }

    // Check the transaction status in case of error
    try {
      const status = await connection.getSignatureStatus(txHash, {
        searchTransactionHistory: true,
      });

      if (status && status.value) {
        return {
          status: status.value.err ? false : true,
          confirmations: status.value.confirmations || 0,
          isCompleted: status.value.confirmationStatus === "finalized",
          attempts: 1,
        };
      }
    } catch (statusError) {
      // Ignore error from status check
    }

    return {
      status: null,
      confirmations: 0,
      isCompleted: false,
      attempts: 1,
    };
  }
}

/**
 * Sign and send a transaction
 * @param tx The transaction to sign and send
 * @param callbacks Optional callbacks for transaction events
 * @returns The transaction result
 */
export async function signAndSendTransaction(
  tx: Transaction,
  signer: Keypair | WalletContextState,
  connection: Connection,
  callbacks?: TransactionCallbacks
): Promise<TransactionResult> {
  if (!signer) {
    throw new Error("No signer set. Please call setSigner() first.");
  }

  try {
    // Add recent blockhash
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    let signature: string;

    // Handle different signer types
    if (signer instanceof Keypair) {
      // Sign with Keypair
      tx.sign(signer);
      signature = await connection.sendRawTransaction(tx.serialize());
    } else {
      // Sign with WalletContextState
      if (!signer.signTransaction) {
        throw new Error("Wallet does not support signing transactions");
      }

      const signedTx = await signer.signTransaction(tx);
      signature = await connection.sendRawTransaction(signedTx.serialize());
    }

    // Call onSubmit callback if provided
    if (callbacks?.onSubmit) {
      await callbacks.onSubmit(signature);
    }

    // Get transaction status
    const status = await getTransactionStatus(signature, connection);

    // Call onFinally callback if provided
    if (callbacks?.onFinally) {
      await callbacks.onFinally({
        ...status,
        txHash: signature,
      });
    }

    return {
      transaction: { hash: signature },
      status,
    };
  } catch (error) {
    // Call onError callback if provided
    if (callbacks?.onError && error instanceof Error) {
      await callbacks.onError(error);
    }

    throw error;
  }
}
