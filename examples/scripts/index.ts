import { PreMarketSolanaMobile } from "@whalesmarket/mobile-sdk";
import { Connection } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";

// Initialize the SDK
const connection = new Connection("https://api.mainnet-beta.solana.com");
const programId = "stPdYNaJNsV3ytS9Xtx4GXXXRcVqVS6x66ZFa26K39S";
const apiBaseUrl = "https://whales-sdk-api-dev.uslab.dev";

const preMarket = new PreMarketSolanaMobile(connection, programId, apiBaseUrl);

(async () => {
  // Initialize the PreMarket
  await preMarket.initialize({
    configAccountPubKey: "GDsMbTq82sYcxPRLdQ9RHL9ZLY3HNVpXjXtCnyxpb2rQ",
  });

  // Set a signer
  const keypair = Keypair.generate();
  preMarket.setPubkey(keypair.publicKey.toString());
  console.log("Signer public key:", keypair.publicKey.toString());

  // Create an offer
  const offerTx = await preMarket.createOffer({
    offerType: 0, // 0 for buy, 1 for sell
    tokenId: "9366",
    amount: 1,
    value: 1,
    exToken: "So11111111111111111111111111111111111111112", // SOL
    fullMatch: false,
  });

  // Sign and send the transaction
  console.log("Transaction hash:", offerTx);
})();
