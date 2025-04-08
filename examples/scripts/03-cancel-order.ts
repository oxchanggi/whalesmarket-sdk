import { PreMarketSolana } from "@whalesmarket/sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
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

const preMarket = new PreMarketSolana(connection, programId);

(async () => {
  // Initialize the PreMarket
  await preMarket.initialize({
    configAccountPubKey,
  });

  // Set a signer
  const keypair = Keypair.fromSecretKey(bs58.decode(signerSecretKey));
  const pubkey = "G4Yha1ArUbfjiM8QJaa4VfY4FdYhiVgLHJaQjZKUzrGu";

  preMarket.setPubkey(pubkey);
  console.log("Signer public key:", pubkey);

  // Create an offer
  const offerTx = await preMarket.cancelOrder(1002427);

  offerTx.feePayer = new PublicKey(pubkey);
  offerTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const simulation = await connection.simulateTransaction(offerTx);
  console.log("Simulation:", simulation);
})();
