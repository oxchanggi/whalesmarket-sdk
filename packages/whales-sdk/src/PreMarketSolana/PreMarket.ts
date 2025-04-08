import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BN, BorshCoder, EventParser, web3 } from "@coral-xyz/anchor";
import { PreMarketType, IDL } from "./idl/pre_market";
import {
  getConfigAccountPubKey,
  getExTokenAccountPubKey,
  getOfferAccountPubKey,
  getOrderAccountPubKey,
  getRoleAccountPubKey,
  getTokenConfigAccountPubKey,
  getVaultTokenAccountPubKey,
} from "./accounts";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import _ from "lodash";
import { buildInstructionsUnWrapSol, buildInstructionsWrapSol } from "./utils";
import { IS_UNITTEST, WEI6 } from "./constants";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomInt = (min: number, max: number) => {
  min = Math.max(1, min);
  return Math.floor(Math.random() * (max - min + 1) + min);
};
const RANGE_MIN = 20;
const RANGE_MAX = 30;

export default class PreMarket {
  connection: Connection;
  program: anchor.Program<PreMarketType>;

  // @ts-ignore
  configAccountPubKey: PublicKey;
  // @ts-ignore
  configAccount: anchor.IdlAccounts<PreMarketType>["configAccount"];

  constructor(connection: Connection, programId: string) {
    this.connection = connection;
    this.program = new anchor.Program(IDL, new PublicKey(programId), {
      connection: this.connection,
    });
  }

  async bootstrap(configAccountPubKey: string) {
    this.configAccountPubKey = new PublicKey(configAccountPubKey);
    await this.fetchConfigAccount(configAccountPubKey);
  }

  async fetchConfigAccount(
    configAccountPubKey: string,
    commitment?: anchor.web3.Commitment
  ): Promise<anchor.IdlAccounts<PreMarketType>["configAccount"]> {
    this.configAccount = await this.program.account.configAccount.fetch(
      configAccountPubKey,
      commitment
    );
    return this.configAccount;
  }

  createConfigAccount(
    signer: PublicKey,
    feeWallet: PublicKey
  ): Promise<Transaction> {
    if (this.configAccountPubKey) {
      throw new Error("Config account already exists");
    }
    this.configAccountPubKey = getConfigAccountPubKey(this.program, signer);
    return this.program.methods
      .initialize()
      .accounts({
        configAccount: this.configAccountPubKey,
        authority: signer,
        feeWallet: feeWallet,
      })
      .transaction();
  }

  setRole(
    signer: PublicKey,
    user: PublicKey,
    role: anchor.IdlTypes<PreMarketType>["Role"]
  ): Promise<Transaction> {
    this.configAccountPubKey = getConfigAccountPubKey(this.program, signer);
    const roleAccount = getRoleAccountPubKey(
      this.program,
      this.configAccountPubKey,
      user
    );
    return this.program.methods
      .setRole(role)
      .accounts({
        configAccount: this.configAccountPubKey,
        roleAccount: roleAccount,
        user: user,
        authority: signer,
      })
      .transaction();
  }

  updateConfigAccount(data: {
    feeRefund?: BN;
    feeSettle?: BN;
    nativePledgeRate?: BN;
    feeWallet?: PublicKey;
  }): Promise<Transaction> {
    return this.program.methods
      .updateConfig(
        data.feeRefund ?? null,
        data.feeSettle ?? null,
        data.feeWallet ?? null
      )
      .accounts({
        configAccount: this.configAccountPubKey,
        authority: this.configAccount.authority,
      })
      .transaction();
  }

  createTokenConfig(
    id: number,
    settleDuration: number,
    pledgeRate: number,
    category: anchor.IdlTypes<PreMarketType>["TokenCategory"],
    admin: PublicKey
  ): Promise<Transaction> {
    const tokenConfigAccountPubKey = getTokenConfigAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );
    const roleAccountPubKey = getRoleAccountPubKey(
      this.program,
      this.configAccountPubKey,
      admin
    );

    return this.program.methods
      .createToken(id, new BN(settleDuration), new BN(pledgeRate), category)
      .accounts({
        configAccount: this.configAccountPubKey,
        tokenConfigAccount: tokenConfigAccountPubKey,
        configAuthority: this.configAccount.authority,
        roleAccount: roleAccountPubKey,
        admin: admin,
      })
      .transaction();
  }

  reallocTokenConfig(id: number, signer: PublicKey): Promise<Transaction> {
    const tokenConfigAccountPubKey = getTokenConfigAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );
    return this.program.methods
      .reallocTokenConfig()
      .accounts({
        configAccount: this.configAccountPubKey,
        tokenConfigAccount: tokenConfigAccountPubKey,
        authority: signer,
      })
      .transaction();
  }

  updateTokenConfig(
    id: number,
    data: {
      status?: anchor.IdlTypes<PreMarketType>["TokenStatus"];
      settleDuration?: BN;
      pledgeRate?: BN;
      settleRate?: BN;
      feeRefund?: BN;
      feeSettle?: BN;
    }
  ): Promise<Transaction> {
    const tokenConfigAccountPubKey = getTokenConfigAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );
    return this.program.methods
      .updateTokenConfig(
        data.status ?? null,
        data.settleDuration ?? null,
        data.pledgeRate ?? null,
        data.settleRate ?? null,
        data.feeRefund ?? null,
        data.feeSettle ?? null
      )
      .accounts({
        tokenConfigAccount: tokenConfigAccountPubKey,
        configAccount: this.configAccountPubKey,
        authority: this.configAccount.authority,
      })
      .transaction();
  }

  updateSettleDuration(
    id: number,
    settleDuration: number,
    operator: PublicKey
  ): Promise<Transaction> {
    const tokenConfigAccountPubKey = getTokenConfigAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );
    const roleAccountPubKey = getRoleAccountPubKey(
      this.program,
      this.configAccountPubKey,
      operator
    );
    return this.program.methods
      .updateSettleDuration(new BN(settleDuration))
      .accounts({
        tokenConfigAccount: tokenConfigAccountPubKey,
        configAccount: this.configAccountPubKey,
        roleAccount: roleAccountPubKey,
        authority: this.configAccount.authority,
        operator: operator,
      })
      .transaction();
  }

  async updateTokenAddress(id: number, token: PublicKey): Promise<Transaction> {
    const tokenConfigAccountPubKey = getTokenConfigAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );
    const tokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(token);
    if (!tokenInfo.value) {
      throw new Error(`Token not found: ${token.toString()}`);
    }

    return this.program.methods
      .updateTokenAddress()
      .accounts({
        tokenConfigAccount: tokenConfigAccountPubKey,
        configAccount: this.configAccountPubKey,
        mint: token,
        authority: this.configAccount.authority,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tokenProgram: tokenInfo.value.owner,
      })
      .transaction();
  }

  async tokenToSettlePhase(
    id: number,
    settleRate: number | null,
    token: PublicKey,
    admin: PublicKey
  ): Promise<Transaction> {
    const tokenConfigAccountPubKey = getTokenConfigAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );
    const roleAccountPubKey = getRoleAccountPubKey(
      this.program,
      this.configAccountPubKey,
      admin
    );
    const tokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(token);
    if (!tokenInfo.value) {
      throw new Error(`Token not found: ${token.toString()}`);
    }
    return this.program.methods
      .tokenToSettlePhase(settleRate ? new BN(settleRate) : null)
      .accounts({
        configAccount: this.configAccountPubKey,
        tokenConfigAccount: tokenConfigAccountPubKey,
        mint: token,
        configAuthority: this.configAccount.authority,
        roleAccount: roleAccountPubKey,
        admin: admin,
        tokenProgram: tokenInfo.value.owner,
      })
      .transaction();
  }

  fetchTokenConfigAccount(
    id: number
  ): Promise<anchor.IdlAccounts<PreMarketType>["tokenConfigAccount"]> {
    return this.program.account.tokenConfigAccount.fetch(
      getTokenConfigAccountPubKey(this.program, this.configAccountPubKey, id)
    );
  }

  async setExToken(
    token: PublicKey,
    is_accepted: boolean
  ): Promise<Transaction> {
    const exTokenAccountPubKey = getExTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      token
    );

    const vaultTokenAccountPubKey = getVaultTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      token
    );

    const tokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(token);
    if (!tokenInfo.value) {
      throw new Error(`Token not found: ${token.toString()}`);
    }

    return this.program.methods
      .setExToken(is_accepted)
      .accounts({
        vaultTokenAccount: vaultTokenAccountPubKey,
        exTokenAccount: exTokenAccountPubKey,
        configAccount: this.configAccountPubKey,
        mint: token,
        authority: this.configAccount.authority,
        tokenProgram: tokenInfo.value.owner,
      })
      .transaction();
  }

  fetchExTokenAccount(
    token: PublicKey
  ): Promise<anchor.IdlAccounts<PreMarketType>["exTokenAccount"]> {
    return this.program.account.exTokenAccount.fetch(
      getExTokenAccountPubKey(this.program, this.configAccountPubKey, token)
    );
  }

  async findIdOffer(): Promise<number> {
    await this.fetchConfigAccount(
      this.configAccountPubKey.toString(),
      "processed"
    );
    let id = IS_UNITTEST
      ? this.configAccount.lastOfferId.toNumber() + 1
      : randomInt(
          this.configAccount.lastOfferId.toNumber() - RANGE_MIN,
          this.configAccount.lastOfferId.toNumber() + RANGE_MAX
        );
    let counter = 0;
    while (true) {
      try {
        await this.fetchOfferAccount(id, "processed");
      } catch (e) {
        break;
      }
      id = randomInt(
        this.configAccount.lastOfferId.toNumber() - RANGE_MIN,
        this.configAccount.lastOfferId.toNumber() + RANGE_MAX
      );
      counter++;
      if (counter > RANGE_MIN + RANGE_MAX) {
        return 0;
      }
    }
    return id;
  }

  async findIdOrder(): Promise<number> {
    await this.fetchConfigAccount(
      this.configAccountPubKey.toString(),
      "processed"
    );
    let id = IS_UNITTEST
      ? this.configAccount.lastOrderId.toNumber() + 1
      : randomInt(
          this.configAccount.lastOrderId.toNumber() - RANGE_MIN,
          this.configAccount.lastOrderId.toNumber() + RANGE_MAX
        );
    let counter = 0;
    while (true) {
      try {
        await this.fetchOrderAccount(id, "processed");
      } catch (e) {
        break;
      }
      id = randomInt(
        this.configAccount.lastOrderId.toNumber() - RANGE_MIN,
        this.configAccount.lastOrderId.toNumber() + RANGE_MAX
      );
      counter++;
      if (counter > RANGE_MIN + RANGE_MAX) {
        return 0;
      }
    }
    return id;
  }
  async findMultipleIdOrder(count: number): Promise<number[]> {
    await this.fetchConfigAccount(
      this.configAccountPubKey.toString(),
      "processed"
    );

    const ids: number[] = [];
    let counter = 0;
    const maxRange = (RANGE_MIN + RANGE_MAX) * count;

    while (ids.length < count) {
      let id = randomInt(
        this.configAccount.lastOrderId.toNumber() - RANGE_MIN,
        this.configAccount.lastOrderId.toNumber() + maxRange
      );

      try {
        await this.fetchOrderAccount(id, "processed");
      } catch (e) {
        if (!ids.includes(id)) {
          ids.push(id);
        }
        continue;
      }

      counter++;
      if (counter > maxRange) {
        throw new Error(`Could not find ${count} available order IDs`);
      }
    }

    return ids;
  }

  async createOffer(
    tokenId: number,
    type: "buy" | "sell",
    exToken: PublicKey,
    amount: number,
    price: number,
    is_fully_match: boolean,
    user: PublicKey
  ): Promise<Transaction> {
    const tokenConfigAccountPubKey = getTokenConfigAccountPubKey(
      this.program,
      this.configAccountPubKey,
      tokenId
    );

    if (exToken.toString() == PublicKey.default.toString()) {
      exToken = NATIVE_MINT;
    }

    const vaultTokenAccountPubKey = getVaultTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      exToken
    );

    const exTokenAccountPubKey = getExTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      exToken
    );

    const exTokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(exToken);
    if (!exTokenInfo.value) {
      throw new Error(`Token not found: ${exToken.toString()}`);
    }

    const userTokenAccount = await getAssociatedTokenAddress(
      exToken,
      user,
      false,
      exTokenInfo.value.owner
    );

    const tokenConfigData = await this.fetchTokenConfigAccount(tokenId);

    const collateral = new anchor.BN(amount)
      .mul(new anchor.BN(price))
      .mul(new anchor.BN(tokenConfigData.pledgeRate))
      .div(new anchor.BN(WEI6))
      .div(new anchor.BN(WEI6))
      .toNumber();

    const value = new anchor.BN(amount)
      .mul(new anchor.BN(price))
      .div(new anchor.BN(WEI6))
      .toNumber();

    let amountTransfer = type == "buy" ? value : collateral;

    let id = await this.findIdOffer();
    const offerAccountPubKey = getOfferAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );

    const transaction = await this.program.methods
      .createOffer(
        { [type]: {} } as any,
        new BN(amount),
        new BN(price),
        is_fully_match,
        new BN(id)
      )
      .accounts({
        offerAccount: offerAccountPubKey,
        vaultTokenAccount: vaultTokenAccountPubKey,
        configAccount: this.configAccountPubKey,
        tokenConfigAccount: tokenConfigAccountPubKey,
        exTokenAccount: exTokenAccountPubKey,
        userTokenAccount,
        user: user,
        exToken,
        authority: this.configAccount.authority,
        tokenProgram: exTokenInfo.value.owner,
      })
      .transaction();

    if (exToken.toString() == NATIVE_MINT.toString()) {
      const instructions = await buildInstructionsWrapSol(
        this.connection,
        user,
        amountTransfer
      );
      const transactionWrapSol = new Transaction().add(...instructions);

      return transactionWrapSol.add(transaction);
    }

    return transaction;
  }

  fetchOfferAccount(
    id: number,
    commitment?: anchor.web3.Commitment
  ): Promise<anchor.IdlAccounts<PreMarketType>["offerAccount"]> {
    return this.program.account.offerAccount.fetch(
      getOfferAccountPubKey(this.program, this.configAccountPubKey, id),
      commitment
    );
  }

  fetchRoleAccount(
    user: PublicKey,
    commitment?: anchor.web3.Commitment
  ): Promise<anchor.IdlAccounts<PreMarketType>["roleAccount"]> {
    return this.program.account.roleAccount.fetch(
      getRoleAccountPubKey(this.program, this.configAccountPubKey, user),
      commitment
    );
  }

  async fillOffer(
    offerId: number,
    amount: number,
    user: PublicKey
  ): Promise<Transaction> {
    const offerAccountPubKey = getOfferAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerId
    );

    const offerAccount = await this.fetchOfferAccount(offerId);

    const tokenConfigAccountPubKey = offerAccount.tokenConfig;

    let exToken = offerAccount.exToken;

    if (exToken.toString() == PublicKey.default.toString()) {
      exToken = NATIVE_MINT;
    }
    const vaultTokenAccountPubKey = getVaultTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      exToken
    );
    const exTokenAccountPubKey = getExTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      exToken
    );

    const exTokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(exToken);
    if (!exTokenInfo.value) {
      throw new Error(`Token not found: ${exToken.toString()}`);
    }

    let userTokenAccount = await getAssociatedTokenAddress(
      exToken,
      user,
      false,
      exTokenInfo.value.owner
    );

    const id = await this.findIdOrder();

    const orderAccountPubKey = getOrderAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );

    const transaction = await this.program.methods
      .fillOffer(new BN(amount), new BN(id))
      .accounts({
        orderAccount: orderAccountPubKey,
        offerAccount: offerAccountPubKey,
        vaultTokenAccount: vaultTokenAccountPubKey,
        exTokenAccount: exTokenAccountPubKey,
        configAccount: this.configAccountPubKey,
        tokenConfigAccount: tokenConfigAccountPubKey,
        userTokenAccount,
        user: user,
        exToken,
        authority: this.configAccount.authority,
        tokenProgram: exTokenInfo.value.owner,
      })
      .transaction();

    if (exToken.toString() == NATIVE_MINT.toString()) {
      let amountTransfer;
      if (Object.keys(offerAccount.offerType)[0] == "buy") {
        amountTransfer = offerAccount.collateral
          .mul(new anchor.BN(amount))
          .div(offerAccount.totalAmount)
          .toNumber();
      } else {
        amountTransfer = offerAccount.price
          .mul(new anchor.BN(amount))
          .div(new anchor.BN(WEI6))
          .toNumber();
      }

      const instructions = await buildInstructionsWrapSol(
        this.connection,
        user,
        amountTransfer
      );
      if (instructions.length > 0) {
        const transactionWrapSol = new Transaction().add(...instructions);

        return transactionWrapSol.add(transaction);
      }
    }
    return transaction;
  }

  fetchOrderAccount(
    id: number,
    commitment?: anchor.web3.Commitment
  ): Promise<anchor.IdlAccounts<PreMarketType>["orderAccount"]> {
    return this.program.account.orderAccount.fetch(
      getOrderAccountPubKey(this.program, this.configAccountPubKey, id),
      commitment
    );
  }

  async settleOrder(
    id: number,
    _orderData?: anchor.IdlAccounts<PreMarketType>["orderAccount"],
    isAtaCreated: boolean = false
  ): Promise<Transaction> {
    const orderAccountPubKey = getOrderAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );
    const orderAccount = _orderData ?? (await this.fetchOrderAccount(id));

    const offerAccount = await this.program.account.offerAccount.fetch(
      orderAccount.offer
    );

    const tokenConfigAccountPubKey = offerAccount.tokenConfig;

    const tokenConfigAccount =
      await this.program.account.tokenConfigAccount.fetch(
        tokenConfigAccountPubKey
      );

    const tokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(
        tokenConfigAccount.token
      );
    if (!tokenInfo.value) {
      throw new Error(
        `Token not found: ${tokenConfigAccount.token.toString()}`
      );
    }

    const sellerTokenAccount = await getAssociatedTokenAddress(
      tokenConfigAccount.token,
      orderAccount.seller,
      false,
      tokenInfo.value.owner
    );

    const buyerTokenAccount = getAssociatedTokenAddressSync(
      tokenConfigAccount.token,
      orderAccount.buyer,
      false,
      tokenInfo.value.owner
    );

    const vaultExTokenAccountPubKey = getVaultTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerAccount.exToken
    );

    const exTokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(
        offerAccount.exToken
      );
    if (!exTokenInfo.value) {
      throw new Error(`Token not found: ${offerAccount.exToken.toString()}`);
    }

    const feeExTokenAccountPubKey = await getAssociatedTokenAddress(
      offerAccount.exToken,
      this.configAccount.feeWallet,
      false,
      exTokenInfo.value.owner
    );

    const feeTokenAccountPubKey = getAssociatedTokenAddressSync(
      tokenConfigAccount.token,
      this.configAccount.feeWallet,
      false,
      tokenInfo.value.owner
    );

    const sellerExTokenAccountPubKey = getAssociatedTokenAddressSync(
      offerAccount.exToken,
      orderAccount.seller,
      false,
      exTokenInfo.value.owner
    );

    const finalTransaction = new Transaction();

    if (!isAtaCreated) {
      try {
        await getAccount(
          this.connection,
          feeExTokenAccountPubKey,
          "confirmed",
          exTokenInfo.value.owner
        );
      } catch (e) {
        finalTransaction.add(
          createAssociatedTokenAccountInstruction(
            orderAccount.seller,
            feeExTokenAccountPubKey,
            this.configAccount.feeWallet,
            offerAccount.exToken,
            exTokenInfo.value.owner
          )
        );
      }

      try {
        await getAccount(
          this.connection,
          feeTokenAccountPubKey,
          "confirmed",
          tokenInfo.value.owner
        );
      } catch (e) {
        finalTransaction.add(
          createAssociatedTokenAccountInstruction(
            orderAccount.seller,
            feeTokenAccountPubKey,
            this.configAccount.feeWallet,
            tokenConfigAccount.token,
            tokenInfo.value.owner
          )
        );
      }

      try {
        await getAccount(
          this.connection,
          buyerTokenAccount,
          "confirmed",
          tokenInfo.value.owner
        );
      } catch (e) {
        finalTransaction.add(
          createAssociatedTokenAccountInstruction(
            orderAccount.seller,
            buyerTokenAccount,
            orderAccount.buyer,
            tokenConfigAccount.token,
            tokenInfo.value.owner
          )
        );
      }

      try {
        await getAccount(
          this.connection,
          sellerExTokenAccountPubKey,
          "confirmed",
          exTokenInfo.value.owner
        );
      } catch (e) {
        finalTransaction.add(
          createAssociatedTokenAccountInstruction(
            orderAccount.seller,
            sellerExTokenAccountPubKey,
            orderAccount.seller,
            offerAccount.exToken,
            exTokenInfo.value.owner
          )
        );
      }
    }

    const exTokenAccountPubKey = getExTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerAccount.exToken
    );

    const transaction = await this.program.methods
      .settleOrder()
      .accounts({
        orderAccount: orderAccountPubKey,
        offerAccount: orderAccount.offer,
        vaultExTokenAccount: vaultExTokenAccountPubKey,
        configAccount: this.configAccountPubKey,
        tokenConfigAccount: tokenConfigAccountPubKey,
        feeExTokenAccount: feeExTokenAccountPubKey,
        sellerExTokenAccount: sellerExTokenAccountPubKey,
        exTokenAccount: exTokenAccountPubKey,
        exToken: offerAccount.exToken,
        sellerTokenAccount,
        buyerTokenAccount,
        feeTokenAccount: feeTokenAccountPubKey,
        token: tokenConfigAccount.token,
        seller: orderAccount.seller,
        buyer: orderAccount.buyer,
        feeWallet: this.configAccount.feeWallet,
        configAuthority: this.configAccount.authority,
        tokenProgram: tokenInfo.value.owner,
        exTokenProgram: exTokenInfo.value.owner,
      })
      .transaction();

    finalTransaction.add(transaction);

    if (offerAccount.exToken.toString() == NATIVE_MINT.toString()) {
      const transactionUnWrapSol = new Transaction().add(
        ...(await buildInstructionsUnWrapSol(orderAccount.seller))
      );

      return finalTransaction.add(transactionUnWrapSol);
    }

    return finalTransaction;
  }

  async settleBatchOrder(
    offerId: number,
    seller: PublicKey
  ): Promise<Transaction[]> {
    const offer = getOfferAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerId
    );
    const orders = await this.program.account.orderAccount.all([
      {
        memcmp: {
          offset: 49,
          bytes: offer.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 114,
          bytes: seller.toBase58(),
        },
      },
    ]);

    const transactions = await Promise.all(
      orders.map((order, index) =>
        this.settleOrder(
          order.account.id.toNumber(),
          order.account,
          index === 0
        )
      )
    );

    return transactions;
  }

  async settleOrderWithDiscount(
    id: number,
    settleVerifier: PublicKey,
    buyerFeeDiscount: BN,
    sellerFeeDiscount: BN
  ): Promise<Transaction> {
    const roleAccountPubKey = getRoleAccountPubKey(
      this.program,
      this.configAccountPubKey,
      settleVerifier
    );
    const orderAccountPubKey = getOrderAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );
    const orderAccount = await this.fetchOrderAccount(id);

    const offerAccount = await this.program.account.offerAccount.fetch(
      orderAccount.offer
    );

    const tokenConfigAccountPubKey = offerAccount.tokenConfig;

    const tokenConfigAccount =
      await this.program.account.tokenConfigAccount.fetch(
        tokenConfigAccountPubKey
      );

    const tokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(
        tokenConfigAccount.token
      );
    if (!tokenInfo.value) {
      throw new Error(
        `Token not found: ${tokenConfigAccount.token.toString()}`
      );
    }

    const exTokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(
        offerAccount.exToken
      );
    if (!exTokenInfo.value) {
      throw new Error(`Token not found: ${offerAccount.exToken.toString()}`);
    }

    const sellerTokenAccount = await getAssociatedTokenAddress(
      tokenConfigAccount.token,
      orderAccount.seller,
      false,
      tokenInfo.value.owner
    );

    const buyerTokenAccount = getAssociatedTokenAddressSync(
      tokenConfigAccount.token,
      orderAccount.buyer,
      false,
      tokenInfo.value.owner
    );

    const vaultExTokenAccountPubKey = getVaultTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerAccount.exToken
    );

    const feeExTokenAccountPubKey = await getAssociatedTokenAddress(
      offerAccount.exToken,
      this.configAccount.feeWallet,
      false,
      exTokenInfo.value.owner
    );

    const feeTokenAccountPubKey = getAssociatedTokenAddressSync(
      tokenConfigAccount.token,
      this.configAccount.feeWallet,
      false,
      tokenInfo.value.owner
    );

    const finalTransaction = new Transaction();

    try {
      await getAccount(
        this.connection,
        feeExTokenAccountPubKey,
        "confirmed",
        exTokenInfo.value.owner
      );
    } catch (e) {
      finalTransaction.add(
        createAssociatedTokenAccountInstruction(
          orderAccount.seller,
          feeExTokenAccountPubKey,
          this.configAccount.feeWallet,
          offerAccount.exToken,
          exTokenInfo.value.owner
        )
      );
    }

    try {
      await getAccount(
        this.connection,
        feeTokenAccountPubKey,
        "confirmed",
        tokenInfo.value.owner
      );
    } catch (e) {
      finalTransaction.add(
        createAssociatedTokenAccountInstruction(
          orderAccount.seller,
          feeTokenAccountPubKey,
          this.configAccount.feeWallet,
          tokenConfigAccount.token,
          tokenInfo.value.owner
        )
      );
    }

    try {
      await getAccount(
        this.connection,
        buyerTokenAccount,
        "confirmed",
        tokenInfo.value.owner
      );
    } catch (e) {
      finalTransaction.add(
        createAssociatedTokenAccountInstruction(
          orderAccount.seller,
          buyerTokenAccount,
          orderAccount.buyer,
          tokenConfigAccount.token,
          tokenInfo.value.owner
        )
      );
    }

    const sellerExTokenAccountPubKey = getAssociatedTokenAddressSync(
      offerAccount.exToken,
      orderAccount.seller,
      false,
      exTokenInfo.value.owner
    );

    try {
      await getAccount(
        this.connection,
        sellerExTokenAccountPubKey,
        "confirmed",
        exTokenInfo.value.owner
      );
    } catch (e) {
      finalTransaction.add(
        createAssociatedTokenAccountInstruction(
          orderAccount.seller,
          sellerExTokenAccountPubKey,
          orderAccount.seller,
          offerAccount.exToken,
          exTokenInfo.value.owner
        )
      );
    }

    const exTokenAccountPubKey = getExTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerAccount.exToken
    );

    const transaction = await this.program.methods
      .settleOrderWithDiscount(buyerFeeDiscount, sellerFeeDiscount)
      .accounts({
        orderAccount: orderAccountPubKey,
        offerAccount: orderAccount.offer,
        vaultExTokenAccount: vaultExTokenAccountPubKey,
        configAccount: this.configAccountPubKey,
        tokenConfigAccount: tokenConfigAccountPubKey,
        feeExTokenAccount: feeExTokenAccountPubKey,
        sellerExTokenAccount: sellerExTokenAccountPubKey,
        exTokenAccount: exTokenAccountPubKey,
        exToken: offerAccount.exToken,
        sellerTokenAccount,
        buyerTokenAccount,
        feeTokenAccount: feeTokenAccountPubKey,
        token: tokenConfigAccount.token,
        operator: settleVerifier,
        roleAccount: roleAccountPubKey,
        seller: orderAccount.seller,
        buyer: orderAccount.buyer,
        feeWallet: this.configAccount.feeWallet,
        configAuthority: this.configAccount.authority,
        tokenProgram: tokenInfo.value.owner,
        exTokenProgram: exTokenInfo.value.owner,
      })
      .transaction();

    finalTransaction.add(transaction);

    if (offerAccount.exToken.toString() == NATIVE_MINT.toString()) {
      const transactionUnWrapSol = new Transaction().add(
        ...(await buildInstructionsUnWrapSol(orderAccount.seller))
      );

      return finalTransaction.add(transactionUnWrapSol);
    }

    return finalTransaction;
  }

  async settleOrderTwoStep(
    id: number,
    operator: PublicKey
  ): Promise<Transaction> {
    const orderAccountPubKey = getOrderAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );

    const roleAccountPubKey = getRoleAccountPubKey(
      this.program,
      this.configAccountPubKey,
      operator
    );
    const orderAccount = await this.fetchOrderAccount(id);

    const offerAccount = await this.program.account.offerAccount.fetch(
      orderAccount.offer
    );

    const tokenConfigAccountPubKey = offerAccount.tokenConfig;

    const tokenConfigAccount =
      await this.program.account.tokenConfigAccount.fetch(
        tokenConfigAccountPubKey
      );

    const vaultExTokenAccountPubKey = getVaultTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerAccount.exToken
    );

    const exTokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(
        offerAccount.exToken
      );
    if (!exTokenInfo.value) {
      throw new Error(`Token not found: ${offerAccount.exToken.toString()}`);
    }

    const feeExTokenAccountPubKey = await getAssociatedTokenAddress(
      offerAccount.exToken,
      this.configAccount.feeWallet,
      false,
      exTokenInfo.value.owner
    );

    const finalTransaction = new Transaction();

    const sellerExTokenAccountPubKey = await getAssociatedTokenAddress(
      offerAccount.exToken,
      orderAccount.seller,
      false,
      exTokenInfo.value.owner
    );

    const exTokenAccountPubKey = getExTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerAccount.exToken
    );

    const transaction = await this.program.methods
      .settleTwoStepOrder()
      .accounts({
        orderAccount: orderAccountPubKey,
        offerAccount: orderAccount.offer,
        vaultExTokenAccount: vaultExTokenAccountPubKey,
        configAccount: this.configAccountPubKey,
        tokenConfigAccount: tokenConfigAccountPubKey,
        feeExTokenAccount: feeExTokenAccountPubKey,
        sellerExTokenAccount: sellerExTokenAccountPubKey,
        exTokenAccount: exTokenAccountPubKey,
        exToken: offerAccount.exToken,
        roleAccount: roleAccountPubKey,
        operator: operator,
        seller: orderAccount.seller,
        buyer: orderAccount.buyer,
        feeWallet: this.configAccount.feeWallet,
        configAuthority: this.configAccount.authority,
        exTokenProgram: exTokenInfo.value.owner,
      })
      .transaction();

    finalTransaction.add(transaction);

    // if (offerAccount.exToken.toString() == NATIVE_MINT.toString()) {
    //   const transactionUnWrapSol = new Transaction().add(
    //     ...(await buildInstructionsUnWrapSol(orderAccount.seller))
    //   );

    //   return finalTransaction.add(transactionUnWrapSol);
    // }

    return finalTransaction;
  }

  async cancelUnfilledOrder(
    id: number,
    cancelOperator: PublicKey | null = null
  ): Promise<Transaction> {
    const orderAccountPubKey = getOrderAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );

    const orderAccount = await this.fetchOrderAccount(id);

    const offerAccount = await this.program.account.offerAccount.fetch(
      orderAccount.offer
    );

    const tokenConfigAccountPubKey = offerAccount.tokenConfig;

    const exTokenAccountPubKey = getExTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerAccount.exToken
    );

    const vaultExTokenAccountPubKey = getVaultTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerAccount.exToken
    );

    const exTokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(
        offerAccount.exToken
      );
    if (!exTokenInfo.value) {
      throw new Error(`Token not found: ${offerAccount.exToken.toString()}`);
    }

    const feeExTokenAccountPubKey = getAssociatedTokenAddressSync(
      offerAccount.exToken,
      this.configAccount.feeWallet,
      false,
      exTokenInfo.value.owner
    );

    const buyerExTokenAccountPubKey = getAssociatedTokenAddressSync(
      offerAccount.exToken,
      orderAccount.buyer,
      false,
      exTokenInfo.value.owner
    );

    const finalTransaction = new Transaction();

    try {
      await getAccount(
        this.connection,
        buyerExTokenAccountPubKey,
        "confirmed",
        exTokenInfo.value.owner
      );
    } catch (e) {
      finalTransaction.add(
        createAssociatedTokenAccountInstruction(
          cancelOperator ?? orderAccount.buyer,
          buyerExTokenAccountPubKey,
          orderAccount.buyer,
          offerAccount.exToken,
          exTokenInfo.value.owner
        )
      );
    }

    const transaction = await this.program.methods
      .cancelUnFilledOrder()
      .accounts({
        orderAccount: orderAccountPubKey,
        offerAccount: orderAccount.offer,
        configAccount: this.configAccountPubKey,
        tokenConfigAccount: tokenConfigAccountPubKey,
        vaultExTokenAccount: vaultExTokenAccountPubKey,
        feeExTokenAccount: feeExTokenAccountPubKey,
        buyerExTokenAccount: buyerExTokenAccountPubKey,
        exTokenAccount: exTokenAccountPubKey,
        exToken: offerAccount.exToken,
        roleAccount: cancelOperator
          ? getRoleAccountPubKey(
              this.program,
              this.configAccountPubKey,
              cancelOperator
            )
          : null,
        buyerOrOperator: cancelOperator ?? orderAccount.buyer,
        feeWallet: this.configAccount.feeWallet,
        configAuthority: this.configAccount.authority,
        tokenProgram: exTokenInfo.value.owner,
      })
      .transaction();

    finalTransaction.add(transaction);

    if (
      offerAccount.exToken.toString() == NATIVE_MINT.toString() &&
      !cancelOperator
    ) {
      const transactionUnWrapSol = new Transaction().add(
        ...(await buildInstructionsUnWrapSol(orderAccount.buyer))
      );

      return finalTransaction.add(transactionUnWrapSol);
    }

    return finalTransaction;
  }

  async cancelOrderWithDiscount(
    id: number,
    settleVerifier: PublicKey,
    buyerFeeDiscount: BN,
    sellerFeeDiscount: BN,
    cancelOperator: PublicKey | null = null
  ): Promise<Transaction> {
    const roleAccountPubKey = getRoleAccountPubKey(
      this.program,
      this.configAccountPubKey,
      settleVerifier
    );

    const orderAccountPubKey = getOrderAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );

    const orderAccount = await this.fetchOrderAccount(id);

    const offerAccount = await this.program.account.offerAccount.fetch(
      orderAccount.offer
    );

    const tokenConfigAccountPubKey = offerAccount.tokenConfig;

    const exTokenAccountPubKey = getExTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerAccount.exToken
    );

    const vaultExTokenAccountPubKey = getVaultTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerAccount.exToken
    );

    const exTokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(
        offerAccount.exToken
      );
    if (!exTokenInfo.value) {
      throw new Error(`Token not found: ${offerAccount.exToken.toString()}`);
    }

    const feeExTokenAccountPubKey = getAssociatedTokenAddressSync(
      offerAccount.exToken,
      this.configAccount.feeWallet,
      false,
      exTokenInfo.value.owner
    );

    const buyerExTokenAccountPubKey = getAssociatedTokenAddressSync(
      offerAccount.exToken,
      orderAccount.buyer,
      false,
      exTokenInfo.value.owner
    );

    const sellerExTokenAccountPubKey = await getAssociatedTokenAddress(
      offerAccount.exToken,
      orderAccount.seller,
      false,
      exTokenInfo.value.owner
    );

    const finalTransaction = new Transaction();

    try {
      await getAccount(
        this.connection,
        feeExTokenAccountPubKey,
        "confirmed",
        exTokenInfo.value.owner
      );
    } catch (e) {
      finalTransaction.add(
        createAssociatedTokenAccountInstruction(
          cancelOperator ?? orderAccount.buyer,
          feeExTokenAccountPubKey,
          this.configAccount.feeWallet,
          offerAccount.exToken,
          exTokenInfo.value.owner
        )
      );
    }

    try {
      await getAccount(
        this.connection,
        buyerExTokenAccountPubKey,
        "confirmed",
        exTokenInfo.value.owner
      );
    } catch (e) {
      finalTransaction.add(
        createAssociatedTokenAccountInstruction(
          cancelOperator ?? orderAccount.buyer,
          buyerExTokenAccountPubKey,
          orderAccount.buyer,
          offerAccount.exToken,
          exTokenInfo.value.owner
        )
      );
    }

    if (sellerFeeDiscount.gtn(0)) {
      try {
        await getAccount(
          this.connection,
          sellerExTokenAccountPubKey,
          "confirmed",
          exTokenInfo.value.owner
        );
      } catch (e) {
        finalTransaction.add(
          createAssociatedTokenAccountInstruction(
            orderAccount.buyer,
            sellerExTokenAccountPubKey,
            orderAccount.seller,
            offerAccount.exToken,
            exTokenInfo.value.owner
          )
        );
      }
    }

    const transaction = await this.program.methods
      .cancelUnFilledOrderWithDiscount(buyerFeeDiscount, sellerFeeDiscount)
      .accountsStrict({
        orderAccount: orderAccountPubKey,
        offerAccount: orderAccount.offer,
        configAccount: this.configAccountPubKey,
        tokenConfigAccount: tokenConfigAccountPubKey,
        vaultExTokenAccount: vaultExTokenAccountPubKey,
        feeExTokenAccount: feeExTokenAccountPubKey,
        buyerExTokenAccount: buyerExTokenAccountPubKey,
        sellerExTokenAccount: sellerFeeDiscount.gtn(0)
          ? sellerExTokenAccountPubKey
          : null,
        exTokenAccount: exTokenAccountPubKey,
        exToken: offerAccount.exToken,
        settleOperator: settleVerifier,
        settleRoleAccount: roleAccountPubKey,
        cancelRoleAccount: cancelOperator
          ? getRoleAccountPubKey(
              this.program,
              this.configAccountPubKey,
              cancelOperator
            )
          : null,
        buyerOrOperator: cancelOperator ?? orderAccount.buyer,
        feeWallet: this.configAccount.feeWallet,
        configAuthority: this.configAccount.authority,
        tokenProgram: exTokenInfo.value.owner,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    finalTransaction.add(transaction);

    if (
      offerAccount.exToken.toString() == NATIVE_MINT.toString() &&
      !cancelOperator
    ) {
      const transactionUnWrapSol = new Transaction().add(
        ...(await buildInstructionsUnWrapSol(orderAccount.buyer))
      );

      return finalTransaction.add(transactionUnWrapSol);
    }

    return finalTransaction;
  }

  async cancelOrder(id: number, operator: PublicKey): Promise<Transaction> {
    const orderAccountPubKey = getOrderAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );

    const orderAccount = await this.fetchOrderAccount(id);

    const offerAccount = await this.program.account.offerAccount.fetch(
      orderAccount.offer
    );

    const tokenConfigAccountPubKey = offerAccount.tokenConfig;

    const exTokenAccountPubKey = getExTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerAccount.exToken
    );

    const vaultExTokenAccountPubKey = getVaultTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      offerAccount.exToken
    );

    const exTokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(
        offerAccount.exToken
      );
    if (!exTokenInfo.value) {
      throw new Error(`Token not found: ${offerAccount.exToken.toString()}`);
    }

    const buyerExTokenAccountPubKey = getAssociatedTokenAddressSync(
      offerAccount.exToken,
      orderAccount.buyer,
      false,
      exTokenInfo.value.owner
    );

    const sellerExTokenAccountPubKey = getAssociatedTokenAddressSync(
      offerAccount.exToken,
      orderAccount.seller,
      false,
      exTokenInfo.value.owner
    );

    const roleAccountPubKey = getRoleAccountPubKey(
      this.program,
      this.configAccountPubKey,
      operator
    );

    const transaction = await this.program.methods
      .cancelOrder()
      .accounts({
        orderAccount: orderAccountPubKey,
        offerAccount: orderAccount.offer,
        configAccount: this.configAccountPubKey,
        tokenConfigAccount: tokenConfigAccountPubKey,
        vaultExTokenAccount: vaultExTokenAccountPubKey,
        buyerExTokenAccount: buyerExTokenAccountPubKey,
        sellerExTokenAccount: sellerExTokenAccountPubKey,
        exTokenAccount: exTokenAccountPubKey,
        exToken: offerAccount.exToken,
        seller: orderAccount.seller,
        buyer: orderAccount.buyer,
        offerAuthority: offerAccount.authority,
        configAuthority: this.configAccount.authority,
        operator: operator,
        roleAccount: roleAccountPubKey,
        tokenProgram: exTokenInfo.value.owner,
      })
      .transaction();

    // if (offerAccount.exToken.toString() == NATIVE_MINT.toString()) {
    //   const transactionUnWrapSol = new Transaction().add(
    //     ...(await buildInstructionsUnWrapSol(orderAccount.authority))
    //   );
    //
    //   return transaction.add(transactionUnWrapSol);
    // }

    return transaction;
  }

  async cancelOrders(id: number[], operator: PublicKey): Promise<Transaction> {
    if (id.length > 2) {
      throw new Error("Cannot cancel more than 4 orders at once");
    }
    const transaction = new Transaction();

    const txs = await Promise.all(
      id.map((orderId) => this.cancelOrder(orderId, operator))
    );
    txs.forEach((tx) => transaction.add(tx));

    return transaction;
  }

  async closeUnFullFilledOffer(
    id: number,
    cancelOperator: PublicKey | null = null
  ): Promise<Transaction> {
    const offerAccountPubKey = getOfferAccountPubKey(
      this.program,
      this.configAccountPubKey,
      id
    );

    const offerAccount = await this.fetchOfferAccount(id);
    const user = offerAccount.authority;

    const exToken = offerAccount.exToken;

    const vaultExTokenAccountPubKey = getVaultTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      exToken
    );

    const exTokenInfo =
      await this.program.provider.connection.getParsedAccountInfo(exToken);
    if (!exTokenInfo.value) {
      throw new Error(`Token not found: ${exToken.toString()}`);
    }

    const feeExTokenAccountPubKey = await getAssociatedTokenAddress(
      exToken,
      this.configAccount.feeWallet,
      false,
      exTokenInfo.value.owner
    );

    const userExTokenAccountPubKey = await getAssociatedTokenAddress(
      exToken,
      user,
      false,
      exTokenInfo.value.owner
    );

    const exTokenAccountPubKey = getExTokenAccountPubKey(
      this.program,
      this.configAccountPubKey,
      exToken
    );

    const finalTransaction = new Transaction();

    try {
      await getAccount(
        this.connection,
        userExTokenAccountPubKey,
        "confirmed",
        exTokenInfo.value.owner
      );
    } catch (e) {
      finalTransaction.add(
        createAssociatedTokenAccountInstruction(
          cancelOperator ?? user,
          userExTokenAccountPubKey,
          user,
          offerAccount.exToken,
          exTokenInfo.value.owner
        )
      );
    }

    const transaction = await this.program.methods
      .closeUnFullFilledOffer()
      .accounts({
        offerAccount: offerAccountPubKey,
        vaultExTokenAccount: vaultExTokenAccountPubKey,
        tokenConfigAccount: offerAccount.tokenConfig,
        configAccount: this.configAccountPubKey,
        feeExTokenAccount: feeExTokenAccountPubKey,
        userExTokenAccount: userExTokenAccountPubKey,
        exTokenAccount: exTokenAccountPubKey,
        exToken,
        roleAccount: cancelOperator
          ? getRoleAccountPubKey(
              this.program,
              this.configAccountPubKey,
              cancelOperator
            )
          : null,
        userOrOperator: cancelOperator ?? user,
        feeWallet: this.configAccount.feeWallet,
        configAuthority: this.configAccount.authority,
        tokenProgram: exTokenInfo.value.owner,
      })
      .transaction();

    finalTransaction.add(transaction);

    if (
      offerAccount.exToken.toString() == NATIVE_MINT.toString() &&
      !cancelOperator
    ) {
      const transactionUnWrapSol = new Transaction().add(
        ...(await buildInstructionsUnWrapSol(user))
      );

      return finalTransaction.add(transactionUnWrapSol);
    }

    return finalTransaction;
  }

  private async getProgramSignatures(params?: {
    before?: string;
    until?: string;
    limit?: number;
  }): Promise<string[]> {
    const options: any = {};

    if (params?.before) {
      options.before = params.before;
    } else if (params?.until) {
      options.until = params.until;
    }
    if (params?.limit) {
      options.limit = params.limit;
    }

    const confirmedSignatureInfo =
      await this.connection.getSignaturesForAddress(
        this.program.programId,
        { ...options },
        "finalized"
      );

    return confirmedSignatureInfo
      .filter((item) => item.err == null)
      .map((item) => item.signature);
  }

  private async splitTransactions(
    signatures: string[]
  ): Promise<Array<string[]>> {
    let batchSignatures: Array<string[]>;
    if (signatures.length < 10) {
      batchSignatures = [signatures];
    } else {
      batchSignatures = _.chunk(signatures, 10);
    }

    return batchSignatures;
  }

  public async parseTransactions(
    signatures: string[]
  ): Promise<web3.ParsedTransactionWithMeta[]> {
    const transactions: web3.ParsedTransactionWithMeta[] = [];
    while (true) {
      try {
        const batchTransactions = await this.connection.getParsedTransactions(
          signatures,
          {
            commitment: "finalized",
            maxSupportedTransactionVersion: 0,
          }
        );
        // @ts-ignore
        transactions.push(...batchTransactions);
        break;
      } catch (e) {
        console.error(e);
        await sleep(1000);
      }
    }

    return _.flatten(transactions);
  }

  async getTransactions(params?: {
    beforeSignature?: string;
    untilSignature?: string;
    limit?: number;
  }): Promise<{
    data: Array<string[]>;
    latestSignature?: string;
  }> {
    const signatures = await this.getProgramSignatures({
      before: params?.beforeSignature,
      until: params?.untilSignature,
      limit: params?.limit,
    });

    return {
      data: signatures.length ? await this.splitTransactions(signatures) : [],
      latestSignature: signatures.length
        ? params?.beforeSignature
          ? signatures[signatures.length - 1]
          : signatures[0]
        : params?.beforeSignature || params?.untilSignature,
    };
  }

  parseEvent(transactionParsed: web3.ParsedTransactionWithMeta) {
    const eventParser = new EventParser(
      this.program.programId,
      new BorshCoder(this.program.idl)
    );
    // @ts-ignore
    const events = eventParser.parseLogs(transactionParsed.meta.logMessages);
    const eventsData: any[] = [];
    // @ts-ignore
    for (const event of events) {
      eventsData.push(event);
    }
    return eventsData.map((event) => {
      return {
        ...event,
        tx_hash: transactionParsed.transaction.signatures[0],
        block_number: transactionParsed.blockTime,
        signer:
          transactionParsed.transaction?.message?.accountKeys?.[0]?.pubkey,
      };
    });
  }

  parseEvents(transactionsParsed: web3.ParsedTransactionWithMeta[]) {
    const events = transactionsParsed.map((transactionParsed) => {
      return this.parseEvent(transactionParsed);
    });
    return _.flatten(events);
  }

  async getLatestSignature(): Promise<string | undefined> {
    const signatures = await this.getProgramSignatures({
      limit: 1,
    });
    return signatures.length > 0 ? signatures[0] : undefined;
  }
}
