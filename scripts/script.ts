import { ethers } from "ethers";
import { PreMarketContract } from "../packages/whales-core/src/pre-markets/PreMarketEVM";
import {
  createEVMTransactionParams,
  signAndSendTransaction,
} from "../packages/whales-core/src/utils";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Script to initialize pre-market, create offer and sign & send transaction
 */
async function main() {
  try {
    console.log("Starting pre-market initialization and offer creation...");

    // Connection configuration from environment variables
    const rpcUrl = process.env.RPC_URL || ""; // RPC URL from .env
    const privateKey = process.env.PRIVATE_KEY || ""; // Private key from .env
    const preMarketContractAddress =
      process.env.PREMARKET_CONTRACT_ADDRESS || ""; // PreMarket contract address from .env

    // Validate required environment variables
    if (!rpcUrl || !privateKey || !preMarketContractAddress) {
      throw new Error(
        "Missing required environment variables. Please check your .env file."
      );
    }

    // Initialize provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`Wallet address: ${wallet.address}`);

    // Initialize PreMarketContract
    const preMarket = new PreMarketContract(preMarketContractAddress, wallet);

    // Set signer for contract
    preMarket.setSigner(wallet);

    // Get PreMarket configuration
    const config = await preMarket.getConfig();
    console.log("PreMarket configuration:", {
      pledgeRate: config.pledgeRate,
      feeRefund: config.feeRefund,
      feeSettle: config.feeSettle,
      feeWallet: config.feeWallet,
    });

    // Get last offer ID
    const lastOfferId = await preMarket.getLastOfferId();
    console.log(`Last offer ID: ${lastOfferId}`);

    // Parameters for creating offer
    const offerParams = {
      offerType: 0, // 0: Sell, 1: Buy
      tokenId:
        "0x3439333600000000000000000000000000000000000000000000000000000000", // Replace with your token ID
      amount: 100, // Token amount
      value: 0.0001, // Offer value (in ETH if using ETH)
      exToken: "0x0000000000000000000000000000000000000000", // Use ETH as exchange token
      fullMatch: false, // Whether full match is required
    };

    console.log("Creating offer with parameters:", offerParams);

    // Create offer
    const offerTx = await preMarket.createOffer(offerParams);
    console.log("Offer transaction created, preparing to sign and send...");

    // Sign and send transaction
    const result = await signAndSendTransaction(
      createEVMTransactionParams(offerTx, wallet, () => provider),
      {
        onSubmit: (txHash) => {
          console.log(`Transaction sent with hash: ${txHash}`);
        },
        onFinally: (status) => {
          console.log(`Transaction completed with status:`, status);
        },
        onError: (error) => {
          console.error(`Error sending transaction:`, error);
        },
      }
    );

    console.log("Transaction result:", {
      hash: result.transaction.hash,
      status: result.status.status ? "Success" : "Failed",
      confirmations: result.status.confirmations,
      isCompleted: result.status.isCompleted,
    });

    // Get information about the newly created offer
    if (result.status.status) {
      const newOfferId = lastOfferId + 1;
      const newOffer = await preMarket.getOffer(newOfferId);
      console.log(`New offer information (ID: ${newOfferId}):`, newOffer);
    }
  } catch (error) {
    console.error("Error during execution:", error);
  }
}

// Run script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
