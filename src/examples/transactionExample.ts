import { ethers } from "ethers";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import {
  signAndSendTransaction,
  createEVMTransactionParams,
  createSolanaTransactionParams,
  BlockchainType,
} from "../utils/transactionWrapper";
import { TransactionCallbacks } from "../BasePreMarket";

/**
 * Example of using the transaction wrapper for EVM
 */
async function evmTransactionExample() {
  // Setup EVM transaction
  const provider = new ethers.providers.JsonRpcProvider("https://rpc-url");
  const wallet = new ethers.Wallet("private-key", provider);

  // Example contract ABI and address
  const contractAbi = ["function transfer(address to, uint256 amount)"];
  const contractAddress = "0x1234567890123456789012345678901234567890";

  // Create contract instance
  const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

  // Create a transaction
  const tx = await contract.populateTransaction.transfer(
    "0xRecipientAddress",
    ethers.utils.parseEther("1.0")
  );

  // Define callbacks
  const callbacks: TransactionCallbacks = {
    onSubmit: (txHash) => {
      console.log(`Transaction submitted: ${txHash}`);
    },
    onFinally: (status) => {
      console.log(`Transaction completed: ${status.txHash}`);
      console.log(`Status: ${status.status ? "Success" : "Failed"}`);
    },
    onError: (error) => {
      console.error(`Transaction error: ${error.message}`);
    },
  };

  // Create transaction parameters
  const txParams = createEVMTransactionParams(
    tx,
    wallet,
    () => provider,
    contract
  );

  try {
    // Send transaction using the wrapper
    const result = await signAndSendTransaction(txParams, callbacks);
    console.log(`Transaction hash: ${result.transaction.hash}`);
    console.log(`Transaction status: ${result.status.status}`);
  } catch (error) {
    console.error("Failed to send transaction:", error);
  }
}

/**
 * Example of using the transaction wrapper for Solana
 */
async function solanaTransactionExample() {
  // Setup Solana connection
  const connection = new Connection("https://api.mainnet-beta.solana.com");

  // Create a keypair from a private key
  const privateKey = new Uint8Array([
    /* your private key bytes */
  ]);
  const signer = Keypair.fromSecretKey(privateKey);

  // Create a simple transaction
  const transaction = new Transaction();
  // Add instructions to the transaction...

  // Define callbacks
  const callbacks: TransactionCallbacks = {
    onSubmit: (txHash) => {
      console.log(`Transaction submitted: ${txHash}`);
    },
    onFinally: (status) => {
      console.log(`Transaction completed: ${status.txHash}`);
      console.log(`Status: ${status.status ? "Success" : "Failed"}`);
    },
    onError: (error) => {
      console.error(`Transaction error: ${error.message}`);
    },
  };

  // Create transaction parameters
  const txParams = createSolanaTransactionParams(
    transaction,
    signer,
    connection
  );

  try {
    // Send transaction using the wrapper
    const result = await signAndSendTransaction(txParams, callbacks);
    console.log(`Transaction hash: ${result.transaction.hash}`);
    console.log(`Transaction status: ${result.status.status}`);
  } catch (error) {
    console.error("Failed to send transaction:", error);
  }
}

/**
 * Example of using the transaction wrapper with dynamic blockchain type
 */
async function dynamicBlockchainExample(blockchainType: BlockchainType) {
  if (blockchainType === BlockchainType.EVM) {
    await evmTransactionExample();
  } else if (blockchainType === BlockchainType.SOLANA) {
    await solanaTransactionExample();
  } else {
    console.error("Unsupported blockchain type");
  }
}

// Export examples
export {
  evmTransactionExample,
  solanaTransactionExample,
  dynamicBlockchainExample,
};
