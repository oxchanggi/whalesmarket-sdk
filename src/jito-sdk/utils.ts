import * as anchor from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
// import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { ed25519 } from "@noble/curves/ed25519";
// import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

// const API_ENDPOINT = "https://quote-api.jup.ag/v6";

export const sign = (
  message: Parameters<typeof ed25519.sign>[0],
  secretKey: any
) => ed25519.sign(message, secretKey.slice(0, 32));

export async function accountExist(
  connection: anchor.web3.Connection,
  account: anchor.web3.PublicKey
): Promise<boolean> {
  try {
    const info = await connection.getAccountInfo(account, "confirmed");
    if (info == null || info.data.length == 0) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

// export async function createAndSendV0Tx(
//   connection: anchor.web3.Connection,
//   payer: anchor.web3.Keypair,
//   signers: anchor.web3.Keypair[],
//   txInstructions: anchor.web3.TransactionInstruction[],
//   addressLookupTableAccounts?: anchor.web3.AddressLookupTableAccount[],
//   confirmed: boolean = false
// ) {
//   // Step 1 - Fetch Latest Blockhash
//   try {
//     const latestBlockhash = await connection.getLatestBlockhash("finalized");
//     console.log(
//       "   ✅ - Fetched latest blockhash. Last valid height:",
//       latestBlockhash.lastValidBlockHeight
//     );

//     // Step 2 - Generate Transaction Message
//     const messageV0 = new anchor.web3.TransactionMessage({
//       payerKey: payer.publicKey,
//       recentBlockhash: latestBlockhash.blockhash,
//       instructions: txInstructions,
//     }).compileToV0Message(addressLookupTableAccounts);
//     console.log("   ✅ - Compiled transaction message");
//     const transaction = new anchor.web3.VersionedTransaction(messageV0);

//     // Step 3 - Sign your transaction with the required Signers
//     transaction.sign([...signers]);
//     console.log("   ✅ - Transaction Signed");

//     const simulateTx = await connection.simulateTransaction(transaction, {
//       sigVerify: true,
//       commitment: "processed",
//     });

//     if (simulateTx.value.err) {
//       console.log(JSON.stringify(simulateTx, null, 2));

//       return {
//         txHash: null,
//         confirmed: false,
//         error: simulateTx.value.err.toString(),
//         logs: simulateTx.value.logs ?? [],
//       };
//     }

//     console.log("transaction size", transaction.serialize().length);

//     // return {
//     //   message: 'Transaction successfully submitted !',
//     //   txt_hash: '' as anchor.web3.TransactionSignature,
//     // };

//     // process.exit();

//     // Step 4 - Send our v0 transaction to the cluster
//     const serializedTx = Buffer.from(transaction.serialize()).toString(
//       "base64"
//     );

//     const txHash = await sendTransaction(serializedTx).catch((e) => {
//       console.log(e.getLogs());
//       console.log("e", e); // console by M-MON
//     });

//     // Step 5 - Confirm Transaction
//     if (confirmed) {
//       const confirmation = await watchTransaction(
//         connection,
//         txHash as string,
//         serializedTx,
//         sendTransaction
//       );

//       if (confirmation.confirmed) {
//         return {
//           txHash,
//           confirmed: true,
//           error: null,
//           logs: simulateTx.value.logs ?? [],
//         };
//       }
//     }

//     return {
//       txHash,
//       confirmed: false,
//       error: null,
//       logs: simulateTx.value.logs ?? [],
//     };
//   } catch (e: any) {
//     console.log("[createAndSendV0Tx] [ERROR]", e); // console by M-MON
//     console.log("[createAndSendV0Tx] [ERROR] [string]", JSON.stringify(e)); // console by M-MON
//     return {
//       txHash: null,
//       confirmed: false,
//       error: e.toString(),
//       logs: [],
//     };
//   }
// }

export async function signAndSerializeV0Tx(
  connection: anchor.web3.Connection,
  payer: anchor.web3.PublicKey,
  signers: anchor.web3.Keypair[],
  txInstructions: anchor.web3.TransactionInstruction[],
  addressLookupTableAccounts?: anchor.web3.AddressLookupTableAccount[],
  signTransaction?: any
) {
  // Step 1 - Fetch Latest Blockhash
  try {
    const latestBlockhash = await connection.getLatestBlockhash("finalized");
    // console.log(
    //   "   ✅ - Fetched latest blockhash. Last valid height:",
    //   latestBlockhash.lastValidBlockHeight
    // );

    // Step 2 - Generate Transaction Message
    const messageV0 = new anchor.web3.TransactionMessage({
      payerKey: payer,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: txInstructions,
    }).compileToV0Message(addressLookupTableAccounts);
    // console.log("   ✅ - Compiled transaction message");
    let transaction = new anchor.web3.VersionedTransaction(messageV0);

    signers.forEach((signer) => {
      transaction.addSignature(
        signer.publicKey,
        Buffer.from(sign(transaction.message.serialize(), signer.secretKey))
      );
    });
    // FE sign transaction
    if (signTransaction) {
      transaction = await signTransaction(transaction);
    }

    const simulateTx = await connection.simulateTransaction(transaction, {
      sigVerify: false,
      commitment: "processed",
    });

    console.log("simulateTx", simulateTx);

    // console.log("transaction size", transaction.serialize().length);

    // Step 4 - Send our v0 transaction to the cluster
    // const serialized_tx = Buffer.from(transaction.serialize()).toString("base64");
    const serialized_tx = bs58.encode(transaction.serialize());

    return {
      message: "Transaction serialized successfully!",
      serialized_tx,
      transaction,
    };
  } catch (e: any) {
    console.log("[createAndSerializeV0Tx] [ERROR]", e);
    return {
      message: "Transaction failed.",
      serialized_tx: "",
      transaction: null,
    };
  }
}

// export const getQuote = async (
//   fromMint: anchor.web3.PublicKey,
//   toMint: anchor.web3.PublicKey,
//   amount: string,
//   slippage: number[]
// ) => {
//   const slippageBps = Math.floor((slippage[0] / slippage[1]) * 10_000);

//   return fetch(
//     `${API_ENDPOINT}/quote?inputMint=${fromMint.toBase58()}&outputMint=${toMint.toBase58()}&amount=${amount}&slippageBps=${slippageBps}&computeAutoSlippage=true&swapMode=ExactIn&onlyDirectRoutes=false&asLegacyTransaction=false&maxAccounts=64&restrictIntermediateTokens=true`
//   ).then((response) => response.json());
// };

// export const getSwapIx = async (
//   user: anchor.web3.PublicKey,
//   quote: any,
//   destinationTokenAccount: anchor.web3.PublicKey
// ): Promise<any> => {
//   const data = {
//     quoteResponse: quote,
//     userPublicKey: user.toBase58(),
//     destinationTokenAccount: destinationTokenAccount.toBase58(),
//   };

//   return fetch(`${API_ENDPOINT}/swap-instructions`, {
//     method: "POST",
//     headers: {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   }).then((response) => response.json());
// };

// export const getAdressLookupTableAccounts = async (
//   connection: anchor.web3.Connection,
//   keys: string[]
// ): Promise<anchor.web3.AddressLookupTableAccount[]> => {
//   const addressLookupTableAccountInfos =
//     await connection.getMultipleAccountsInfo(
//       keys.map((key) => new anchor.web3.PublicKey(key))
//     );

//   return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
//     const addressLookupTableAddress = keys[index];
//     if (accountInfo) {
//       const addressLookupTableAccount =
//         new anchor.web3.AddressLookupTableAccount({
//           key: new anchor.web3.PublicKey(addressLookupTableAddress),
//           state: anchor.web3.AddressLookupTableAccount.deserialize(
//             accountInfo.data
//           ),
//         });
//       acc.push(addressLookupTableAccount);
//     }

//     return acc;
//   }, new Array<anchor.web3.AddressLookupTableAccount>());
// };

// export const instructionDataToTransactionInstruction = (
//   instructionPayload: any
// ) => {
//   if (instructionPayload === null) {
//     return null;
//   }

//   return new anchor.web3.TransactionInstruction({
//     programId: new anchor.web3.PublicKey(instructionPayload.programId),
//     keys: instructionPayload.accounts.map((key: any) => ({
//       pubkey: new anchor.web3.PublicKey(key.pubkey),
//       isSigner: key.isSigner,
//       isWritable: key.isWritable,
//     })),
//     data: Buffer.from(instructionPayload.data, "base64"),
//   });
// };

// export const swapJupiter = async (
//   connection: anchor.web3.Connection,
//   signer: anchor.web3.Keypair,
//   inputToken: anchor.web3.PublicKey,
//   outputToken: anchor.web3.PublicKey,
//   amountIn: anchor.BN,
//   slippage: number[] = [100, 10_000] // 1%
// ) => {
//   // Find the best Quote from the Jupiter API
//   const quote = await getQuote(
//     inputToken,
//     outputToken,
//     amountIn.toString(),
//     slippage
//   );

//   const outputTokenInfo = await connection.getParsedAccountInfo(outputToken);

//   // Convert the Quote into a Swap instruction
//   const result = await getSwapIx(
//     signer.publicKey,
//     quote,
//     getAssociatedTokenAddressSync(
//       outputToken,
//       signer.publicKey,
//       true,
//       outputTokenInfo?.value?.owner
//     )
//   );

//   if ("error" in result) {
//     console.log({ result });
//     throw new Error(result.toString());
//   }

//   // We have now both the instruction and the lookup table addresses.
//   const {
//     // computeBudgetInstructions, // The necessary instructions to setup the compute budget.
//     setupInstructions, // Setup missing ATA for the users.
//     swapInstruction, // The actual swap instruction.
//     cleanupInstruction, // Unwrap the SOL if `wrapUnwrapSOL = true`.
//     addressLookupTableAddresses, // The lookup table addresses that you can use if you are using versioned transaction.
//   } = result;

//   //   console.log({ computeBudgetInstructions });

//   const instructions = [
//     // ...computeBudgetInstructions.map(instructionDataToTransactionInstruction),
//     ...setupInstructions.map(instructionDataToTransactionInstruction),
//     instructionDataToTransactionInstruction(swapInstruction),
//     instructionDataToTransactionInstruction(cleanupInstruction), // can be null
//   ].filter((instruction) => {
//     return instruction !== null;
//   });

//   // If you want, you can add more lookup table accounts here
//   const addressLookupTableAccounts = await getAdressLookupTableAccounts(
//     connection,
//     addressLookupTableAddresses
//   );

//   const cu = anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
//     microLamports: 500_000,
//   });

//   const { txHash, confirmed, error, logs } = await createAndSendV0Tx(
//     connection,
//     signer,
//     [signer],
//     [cu, ...instructions],
//     addressLookupTableAccounts,
//     true
//   );

//   return { txHash, confirmed, error, logs };
// };
