import { Connection } from "@solana/web3.js";
import { ethers } from "ethers";
import { MultiPreMarketManager } from "../MultiPreMarketManager";

// This is a simple example of how to use the MultiPreMarketManager
// Note: This is not a real test, just an example
describe("MultiPreMarketManager", () => {
  it("Example usage", async () => {
    // Create a new manager
    const manager = new MultiPreMarketManager();

    // Example: Add a Solana market
    // In a real application, you would use actual connection and program ID
    const solanaConnection = new Connection(
      "https://api.mainnet-beta.solana.com"
    );
    const solanaProgramId = "YourSolanaProgramId";
    const configAccountPubKey = "YourConfigAccountPubKey";

    await manager.addSolanaMarket(
      "solana-market-1",
      solanaConnection,
      solanaProgramId,
      configAccountPubKey
    );

    // Example: Add an EVM market
    // In a real application, you would use actual provider and contract address
    const provider = new ethers.providers.JsonRpcProvider(
      "https://mainnet.infura.io/v3/your-infura-key"
    );
    const contractAddress = "0xYourContractAddress";

    await manager.addEVMMarket("evm-market-1", contractAddress, provider);

    // Example: Get all market IDs
    const marketIds = manager.getAllMarketIds();
    console.log("Market IDs:", marketIds);

    // Example: Get a specific market
    const solanaMarket = manager.getSolanaMarket("solana-market-1");
    const evmMarket = manager.getEVMMarket("evm-market-1");

    // Example: Get the last offer ID from a specific market
    const lastOfferId = await manager.getLastOfferId("solana-market-1");
    console.log("Last offer ID:", lastOfferId);

    // Example: Create an offer in a specific market
    const offerParams = {
      offerType: 0, // Buy
      tokenId: "token123",
      amount: 100,
      value: 50,
      exToken: "USDC",
      fullMatch: false,
    };

    const createOfferTx = await manager.createOffer(
      "solana-market-1",
      offerParams
    );
    console.log("Create offer transaction:", createOfferTx);

    // Example: Execute a batch of operations across multiple markets
    const batchResults = await manager.executeBatch([
      {
        marketId: "solana-market-1",
        operation: (market) => market.getLastOfferId(),
      },
      {
        marketId: "evm-market-1",
        operation: (market) => market.getLastOrderId(),
      },
    ]);

    console.log("Batch results:", batchResults);

    // Example: Remove a market
    const removed = manager.removeMarket("solana-market-1");
    console.log("Market removed:", removed);
  });
});
