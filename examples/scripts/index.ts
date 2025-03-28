import { PreMarketSolanaMobile } from "@whalesmarket/mobile-sdk";
import { PreMarketSolana } from "@whalesmarket/sdk";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
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

const preMarket = new PreMarketSolanaMobile(connection, programId, apiBaseUrl);

(async () => {
  // Initialize the PreMarket
  await preMarket.initialize({
    configAccountPubKey,
  });

  // Set a signer
  const keypair = Keypair.fromSecretKey(bs58.decode(signerSecretKey));
  preMarket.setPubkey(keypair.publicKey.toString());
  console.log("Signer public key:", keypair.publicKey.toString());

  console.log(
    "Balance: ",
    (await connection.getBalance(keypair.publicKey)) / LAMPORTS_PER_SOL
  );

  preMarket.setPubkey(keypair.publicKey.toString());

  try {
    // Create an offer
    const offerTx = await preMarket.matchOffer({
      offerIds: [],
      offerType: 0, // 0 for buy, 1 for sell
      tokenId: "8832",
      totalAmount: 500,
      totalValue: 0.075,
      exToken: "So11111111111111111111111111111111111111112", // SOL
      newOfferFullMatch: true,
    });

    // Sign and send the transaction
    console.log("Transaction hash:", offerTx);

    offerTx.sign(keypair);

    const txHash = await connection.sendRawTransaction(offerTx.serialize());
    console.log("Transaction hash:", txHash);
    const tx = await connection.confirmTransaction(txHash);
    console.log("Transaction:", tx);
  } catch (error: any) {
    console.log(JSON.stringify(error), "abc");
  }
})();
