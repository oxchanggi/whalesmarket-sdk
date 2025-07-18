import { PreMarketEVM, PreMarketSolana } from "@whalesmarket/sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { ethers } from "ethers";
import "dotenv/config";

// Initialize the SDK
const connection = new Connection(process.env.SOLANA_RPC_URL!);
const programId = process.env.SOLANA_PROGRAM_ID!;
const apiBaseUrl = process.env.SOLANA_API_BASE_URL!;
const configAccountPubKey = process.env.SOLANA_CONFIG_ACCOUNT_PUBKEY!;
const signerSecretKey = process.env.SOLANA_SIGNER_SECRET_KEY!;

if (!connection || !programId || !apiBaseUrl || !configAccountPubKey) {
  throw new Error("Missing environment variables");
}

const provider = new ethers.providers.JsonRpcProvider(
  "https://sepolia.base.org"
);

const preMarket = new PreMarketEVM(
  "0xebC47C87C2A91b3e7F3ee9a721249caf2D15aCCb",
  provider,
  "0xcbAC68Bda2f05f499C014a37031f2383D05118d6"
);

(async () => {
  // Initialize the PreMarket
  await preMarket.initialize({
    configAccountPubKey,
  });

  // Create an offer
  const offerTx = await preMarket.matchOffer({
    offerIds: [],
    tokenId:
      "0x3839353700000000000000000000000000000000000000000000000000000000",
    totalAmount: 500,
    totalValue: 0.00075,
    offerType: 0,
    exToken: "0x0000000000000000000000000000000000000000",
    newOfferFullMatch: true,
  });

  // Sign and send the transaction
  console.log("Transaction hash:", offerTx);
})();
