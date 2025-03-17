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
