import { ethers } from "ethers";
import { TransactionCallbacks } from "../base/BasePreMarket";

// Debug log prefixes with colors
export const LOG_PREFIXES = {
  INFO: "\x1b[36m[STREAM-INFO]\x1b[0m", // Cyan
  BLOCK: "\x1b[33m[STREAM-BLOCK]\x1b[0m", // Yellow
  EVENT: "\x1b[32m[STREAM-EVENT]\x1b[0m", // Green
  ERROR: "\x1b[31m[STREAM-ERROR]\x1b[0m", // Red
  SAVE: "\x1b[35m[STREAM-SAVE]\x1b[0m", // Magenta
  DEBUG: "\x1b[34m[STREAM-DEBUG]\x1b[0m", // Blue
};

export const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTransactionStatus = async (
  provider: ethers.providers.Provider,
  txHash: string,
  maxRetries: number = 10
): Promise<{
  status: boolean | null;
  confirmations: number;
  isCompleted: boolean;
  attempts: number;
}> => {
  let attempts = 0;
  let waitTime = 1000; // Start with 1 second

  while (attempts < maxRetries) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        attempts++;
        if (attempts === maxRetries) {
          return {
            status: null,
            confirmations: 0,
            isCompleted: false,
            attempts,
          };
        }
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        await sleep(waitTime);
        waitTime *= 2;
        continue;
      }

      // Get confirmations - in ethers v5 this is a property, not a method
      const confirmations = receipt.confirmations || 0;

      return {
        status: receipt.status === 1,
        confirmations,
        isCompleted: true,
        attempts: attempts + 1,
      };
    } catch (error: any) {
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }

  // This should never be reached due to the return in the if(!receipt) block
  throw new Error("Failed to get transaction status after maximum retries");
};

/**
 * Generic function to sign and send a transaction
 * @param tx The transaction to send
 * @param wallet The wallet or sendTransaction function to use
 * @param getRandomProvider Function to get a random provider
 * @param contract Optional contract instance
 * @param callbacks Optional callbacks for transaction events
 * @returns Transaction result with status
 */
export const signAndSendTransaction = async (
  tx: ethers.PopulatedTransaction,
  wallet: ethers.Wallet | ethers.Signer,
  getRandomProvider: () => ethers.providers.Provider,
  callbacks?: TransactionCallbacks,
  contract?: ethers.BaseContract
): Promise<{
  transaction: {
    hash: string;
  };
  status: {
    status: boolean | null;
    confirmations: number;
    isCompleted: boolean;
    attempts: number;
  };
}> => {
  const { onSubmit, onFinally, onError } = callbacks || {};
  try {
    // Prepare the transaction
    const transaction = {
      ...tx,
    };

    // Sign and send the transaction
    let txHash: string;

    // Check if wallet is an object with the expected Wallet methods
    if (wallet instanceof ethers.Wallet) {
      const connectedWallet = wallet.connect(getRandomProvider());
      const signedTx = await connectedWallet.sendTransaction(transaction);
      txHash = signedTx.hash;
    } else {
      // Assume it's a SendTransactionMutateAsync function
      const signedTx = await (wallet as ethers.Signer).sendTransaction(
        transaction
      );
      txHash = signedTx.hash;
    }

    // Call onSubmit callback if provided
    if (onSubmit) {
      await onSubmit(txHash);
    }

    // Check transaction status
    const status = await getTransactionStatus(getRandomProvider(), txHash);

    // Add new error handling
    if (status.status === null) {
      throw new Error(
        "Transaction may not be minted on-chain yet or has failed. Please check the blockchain explorer."
      );
    }

    if (status.status === false) {
      throw new Error(
        "Transaction failed. Please check the blockchain explorer for details."
      );
    }

    // Call onFinally callback if provided
    if (onFinally) {
      await onFinally({ ...status, txHash });
    }

    return {
      transaction: {
        hash: txHash,
      },
      status,
    };
  } catch (error: any) {
    // Try to decode the error if contract is provided
    if (contract && error) {
      try {
        // Handle custom errors from estimateGas or other pre-transaction errors
        if (error.code === "CALL_EXCEPTION" && error.data) {
          // The error.data contains the custom error selector (first 4 bytes of the error signature hash)
          const errorSelector = error.data;

          // Try to find matching error in the contract interface
          for (const errorFragment of Object.values(
            contract.interface.fragments
          ).filter((fragment) => fragment.type === "error")) {
            if ("name" in errorFragment) {
              // Calculate the selector for this error
              const errorDef = contract.interface.getError(
                errorFragment.name as string
              );
              if (errorDef) {
                // Check if we can match the error
                const errorSignature = errorFragment.name;

                // Compare error signatures instead of selectors
                if (errorSignature && error.data.includes(errorSignature)) {
                  // Found matching error!
                  const errorName = errorFragment.name;
                  const errorArgs = error.errorArgs || [];

                  const enhancedError = new Error(
                    `Transaction failed with custom error: ${errorName}(${errorArgs.join(
                      ", "
                    )})`
                  );

                  // Preserve original error properties
                  Object.assign(enhancedError, error);

                  if (onError) {
                    await onError(enhancedError);
                  }
                  throw enhancedError;
                }
              }
            }
          }

          // If we couldn't match the selector to a known error
          console.log(
            `${LOG_PREFIXES.DEBUG} Unknown custom error with selector: ${errorSelector}`
          );
        }
      } catch (decodeError) {
        console.error(
          `${LOG_PREFIXES.ERROR} Error decoding transaction error:`,
          decodeError
        );
      }
    }

    // Call onError callback if provided
    if (onError) {
      await onError(error instanceof Error ? error : new Error(String(error)));
    }
    throw error; // Re-throw the error after handling
  }
};
