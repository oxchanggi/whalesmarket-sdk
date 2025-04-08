// @ts-nocheck
import {
  AccountMeta,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { JitoJsonRpcClient } from "../jito-sdk";
import PreMarket from "./PreMarket";
import {
  WhalesMarketWrapper as PreMarketWrapperType,
  IDL,
} from "./idl/whales_market_wrapper";
import * as anchor from "@coral-xyz/anchor";
import {
  getExTokenAccountPubKey,
  getOfferAccountPubKey,
  getOrderAccountPubKey,
  getTokenConfigAccountPubKey,
  getVaultTokenAccountPubKey,
} from "./accounts";
import { getAssociatedTokenAddressSync, NATIVE_MINT } from "@solana/spl-token";
import { WEI6 } from "./constants";
import { buildInstructionsUnWrapSol, buildInstructionsWrapSol } from "./utils";
import { BN } from "bn.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

export const MAINNET = {
  PROGRAM_ID: "8Yj95N7hy77zspBjUK3FK5Phs9gxKn1HwTgW5ptxKShk", // TODO: change to mainnet, temporarily used devnet
};

export const DEVNET = {
  PROGRAM_ID: "8Yj95N7hy77zspBjUK3FK5Phs9gxKn1HwTgW5ptxKShk",
};

export class PreMarketWrapper {
  preMarketSdk: PreMarket;
  jito: JitoJsonRpcClient;
  wrapperProgram: anchor.Program<PreMarketWrapperType>;

  constructor(preMarketSdk: PreMarket) {
    this.preMarketSdk = preMarketSdk;
    this.jito = new JitoJsonRpcClient(
      "https://mainnet.block-engine.jito.wtf/api/v1"
    );

    const wrapperProgramId = this.preMarketSdk.connection.rpcEndpoint.includes(
      "mainnet"
    )
      ? MAINNET.PROGRAM_ID
      : DEVNET.PROGRAM_ID;
    this.wrapperProgram = new anchor.Program(
      IDL,
      new PublicKey(wrapperProgramId),
      {
        connection: this.preMarketSdk.connection,
      }
    );
  }

  async matchOffer(
    user: PublicKey,
    tokenId: number,
    exToken: PublicKey,
    offerIds: number[],
    totalAmount: number,
    matchPrice: number,
    offerType: "buy" | "sell",
    newOfferFullMatch: boolean,
    newOrderIds?: number[]
  ) {
    let _newOrderIds = newOrderIds;
    if (!newOrderIds) {
      _newOrderIds = await this.preMarketSdk.findMultipleIdOrder(
        offerIds.length
      );
    }

    let newOfferId = await this.preMarketSdk.findIdOffer();

    const remainingAccounts: AccountMeta[] = _newOrderIds.reduce(
      (pre, orderId, i) => {
        return [
          ...pre,
          {
            pubkey: getOfferAccountPubKey(
              this.preMarketSdk.program,
              this.preMarketSdk.configAccountPubKey,
              offerIds[i]
            ),
            isWritable: true,
            isSigner: false,
          },
          {
            pubkey: getOrderAccountPubKey(
              this.preMarketSdk.program,
              this.preMarketSdk.configAccountPubKey,
              orderId
            ),
            isWritable: true,
            isSigner: false,
          },
        ];
      },
      []
    );

    const userOfferAccountPubKey = getOfferAccountPubKey(
      this.preMarketSdk.program,
      this.preMarketSdk.configAccountPubKey,
      newOfferId
    );

    const tokenConfigAccountPubKey = getTokenConfigAccountPubKey(
      this.preMarketSdk.program,
      this.preMarketSdk.configAccountPubKey,
      tokenId
    );

    if (exToken.toString() == PublicKey.default.toString()) {
      exToken = NATIVE_MINT;
    }
    const vaultTokenAccountPubKey = getVaultTokenAccountPubKey(
      this.preMarketSdk.program,
      this.preMarketSdk.configAccountPubKey,
      exToken
    );
    const exTokenAccountPubKey = getExTokenAccountPubKey(
      this.preMarketSdk.program,
      this.preMarketSdk.configAccountPubKey,
      exToken
    );

    const exTokenInfo = await this.preMarketSdk.connection.getParsedAccountInfo(
      exToken
    );

    let userTokenAccount = getAssociatedTokenAddressSync(
      exToken,
      user,
      false,
      exTokenInfo.value.owner
    );

    const transaction = await this.wrapperProgram.methods
      .matchOffer(
        new BN(totalAmount),
        new BN(matchPrice),
        { [offerType]: {} } as any,
        _newOrderIds.map((id) => new BN(id)),
        new BN(newOfferId),
        newOfferFullMatch
      )
      .accounts({
        newOffer: userOfferAccountPubKey,
        vaultTokenAccount: vaultTokenAccountPubKey,
        exTokenAccount: exTokenAccountPubKey,
        configAccount: this.preMarketSdk.configAccountPubKey,
        tokenConfigAccount: tokenConfigAccountPubKey,
        userTokenAccount,
        user: user,
        exToken,
        authority: this.preMarketSdk.configAccount.authority,
        tokenProgram: exTokenInfo.value.owner,
        preMarket: this.preMarketSdk.program.programId,
      })
      .remainingAccounts(remainingAccounts)
      .transaction();

    if (exToken.toString() == NATIVE_MINT.toString()) {
      const amountTransfer = new anchor.BN(matchPrice)
        .mul(new anchor.BN(totalAmount))
        .div(new anchor.BN(WEI6))
        .toNumber();

      const instructions = await buildInstructionsWrapSol(
        this.preMarketSdk.connection,
        user,
        amountTransfer
      );

      const unwrapSolInstructions = await buildInstructionsUnWrapSol(user);
      const transactionUnwrapSol = new Transaction().add(
        ...unwrapSolInstructions
      );

      if (instructions.length > 0) {
        const transactionWrapSol = new Transaction().add(...instructions);

        return transactionWrapSol.add(transaction, transactionUnwrapSol);
      }
    }
    return transaction;
  }
}
