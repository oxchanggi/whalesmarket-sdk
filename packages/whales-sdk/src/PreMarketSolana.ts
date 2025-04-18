import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  BasePreMarket,
  OfferData,
  OrderData,
  MarketConfig,
  CreateOfferParams,
  TransactionCallbacks,
  TransactionResult,
  TransactionStatus,
  SignerType,
  MatchOfferParams,
  waitSolanaTransaction,
} from "@whalesmarket/core";
import PreMarketOriginal from "./PreMarketSolana/PreMarket";
import { NATIVE_MINT, getMint } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { PreMarketWrapper } from "./PreMarketSolana/preMarketWrapper";

/**
 * Type definition for Solana signers
 * Can be either a Keypair or WalletContextState
 */
export type SolanaSigner = Keypair | WalletContextState;

/**
 * Solana implementation of the PreMarket
 * Extends BasePreMarket and wraps the original PreMarket implementation
 */
export class PreMarketSolana extends BasePreMarket<Transaction> {
  private preMarket: PreMarketOriginal;
  private preMarketWrapper: PreMarketWrapper;
  private connection: Connection;
  private configAccountPubKey: PublicKey | null = null;

  /**
   * Create a new PreMarketSolana instance
   * @param connection Solana connection
   * @param programId Program ID for the PreMarket program
   */
  constructor(connection: Connection, programId: string) {
    super();
    this.connection = connection;
    this.preMarket = new PreMarketOriginal(connection, programId);
    this.preMarketWrapper = new PreMarketWrapper(this.preMarket);
  }

  /**
   * Get the status of a transaction
   * @param txHash The transaction hash
   * @returns The transaction status
   */
  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    try {
      const confirmation = await this.connection.confirmTransaction(txHash);
      return {
        status: confirmation.value.err ? false : true,
        confirmations: 1,
        isCompleted: true,
        attempts: 1,
      };
    } catch (error) {
      return {
        status: null,
        confirmations: 0,
        isCompleted: false,
        attempts: 1,
      };
    }
  }

  /**
   * Wait for a transaction to be confirmed
   * @param txHash The transaction hash
   * @param confirmations Number of confirmations to wait for (default: 1)
   * @param timeout Timeout in milliseconds (default: 60000 - 1 minute)
   * @returns Transaction status
   */
  async waitTransaction(
    txHash: string,
    confirmations: number = 1,
    timeout: number = 60000
  ): Promise<TransactionStatus> {
    return waitSolanaTransaction(
      txHash,
      this.connection,
      confirmations,
      timeout
    );
  }

  /**
   * Get the public key of the current signer
   * @returns The public key of the current signer
   */
  getSignerPublicKey(): PublicKey | null {
    if (!this._pubkey) {
      return null;
    }

    return new PublicKey(this._pubkey);
  }

  /**
   * Initialize the PreMarket instance
   * @param config Configuration parameters for the PreMarket
   */
  async initialize(config: { configAccountPubKey: string }): Promise<void> {
    await this.preMarket.bootstrap(config.configAccountPubKey);
    this.configAccountPubKey = new PublicKey(config.configAccountPubKey);
  }

  /**
   * Get the last offer ID
   * @returns The last offer ID
   */
  async getLastOfferId(): Promise<number> {
    return this.preMarket.findIdOffer();
  }

  /**
   * Get the last order ID
   * @returns The last order ID
   */
  async getLastOrderId(): Promise<number> {
    return this.preMarket.findIdOrder();
  }

  /**
   * Get an offer by ID
   * @param offerId The ID of the offer to retrieve
   * @returns The offer data
   */
  async getOffer(offerId: number): Promise<OfferData> {
    const offerAccount = await this.preMarket.fetchOfferAccount(offerId);
    return {
      offerType: offerAccount.offerType.toString() === "Buy" ? 0 : 1,
      tokenId: offerAccount.tokenConfig.toString(),
      exToken: offerAccount.exToken.toString(),
      amount: Number(offerAccount.totalAmount),
      value: Number(offerAccount.price),
      collateral: Number(offerAccount.collateral),
      filledAmount: Number(offerAccount.filledAmount),
      status: offerAccount.status.toString() === "Open" ? 0 : 1,
      offeredBy: offerAccount.authority.toString(),
      fullMatch: offerAccount.isFullMatch,
    };
  }

  /**
   * Get an order by ID
   * @param orderId The ID of the order to retrieve
   * @returns The order data
   */
  async getOrder(orderId: number): Promise<OrderData> {
    const orderAccount = await this.preMarket.fetchOrderAccount(orderId);
    const offerAccount = await this.preMarket.fetchOfferAccount(
      Number(orderAccount.offer)
    );

    return {
      offerId: Number(offerAccount.id),
      amount: Number(orderAccount.amount),
      seller: orderAccount.seller.toString(),
      buyer: orderAccount.buyer.toString(),
      status:
        orderAccount.status.toString() === "Open"
          ? 0
          : orderAccount.status.toString() === "Closed"
          ? 1
          : 2,
    };
  }

  /**
   * Create a new offer
   * @param params Parameters for creating the offer
   * @returns Transaction data
   */
  async createOffer(params: CreateOfferParams): Promise<Transaction> {
    // Map CreateOfferParams to Solana-specific parameters
    const offerType = params.offerType;
    const tokenId = params.tokenId;
    let amount = params.amount;
    let value = params.value;
    const exToken = params.exToken || "";
    const fullMatch = params.fullMatch || false;

    // Convert to Solana-specific implementation
    const type = offerType === 0 ? "buy" : "sell";

    if (!this.preMarket) {
      throw new Error("PreMarket instance not initialized");
    }

    // Get the signer's public key
    const signerPublicKey = this.getSignerPublicKey();
    if (!signerPublicKey) {
      throw new Error("No signer set or signer has no public key");
    }

    // Adjust amount by multiplying with 10^6
    amount = amount * Math.pow(10, 6);

    // Get token decimals and adjust value
    const tokenPublicKey = new PublicKey(exToken || NATIVE_MINT.toString());
    try {
      // Get token mint info to retrieve decimals
      const mintInfo = await getMint(this.connection, tokenPublicKey);

      // Adjust value based on token decimals
      // Multiply by 10^decimals
      value = value * Math.pow(10, mintInfo.decimals);
    } catch (error) {
      console.error(`Error getting decimals for token ${exToken}:`, error);
      // Default to 9 decimals (common in Solana) if there's an error
      value = value * Math.pow(10, 9);
    }

    return this.preMarket.createOffer(
      parseInt(tokenId),
      type,
      tokenPublicKey,
      amount,
      value,
      fullMatch,
      signerPublicKey
    );
  }

  /**
   * Match multiple offers and create a new offer with the remaining amount
   * @param params Parameters for matching offers
   * @returns Transaction data
   */
  async matchOffer(params: MatchOfferParams): Promise<Transaction> {
    const {
      offerIds,
      tokenId,
      totalAmount,
      totalValue,
      offerType,
      exToken,
      newOfferFullMatch,
      signer,
    } = params;

    if (totalAmount <= 0) {
      throw new Error("Total amount must be greater than zero");
    }

    if (totalValue <= 0) {
      throw new Error("Total value must be greater than zero");
    }

    // Convert to Solana-specific implementation
    const type = offerType === 0 ? "buy" : "sell";

    if (!this.preMarket) {
      throw new Error("PreMarket instance not initialized");
    }

    // Get the signer's public key
    let signerPublicKey: PublicKey;
    if (signer) {
      // Use the provided signer string if available
      signerPublicKey = new PublicKey(signer);
    } else {
      // Otherwise, get from the current signer
      const currentSignerPublicKey = this.getSignerPublicKey();
      if (!currentSignerPublicKey) {
        throw new Error("No signer set or signer has no public key");
      }
      signerPublicKey = currentSignerPublicKey;
    }

    // Adjust amount by multiplying with 10^6
    const adjustedAmount = totalAmount * Math.pow(10, 6);

    // Get token decimals and adjust value
    const tokenPublicKey = new PublicKey(exToken || NATIVE_MINT.toString());
    let adjustedValue = totalValue;
    let mintDecimals = 9;
    try {
      // Get token mint info to retrieve decimals
      const mintInfo = await getMint(this.connection, tokenPublicKey);

      // Adjust value based on token decimals
      // Multiply by 10^decimals
      adjustedValue = totalValue * Math.pow(10, mintInfo.decimals);
      mintDecimals = mintInfo.decimals;
    } catch (error) {
      console.error(`Error getting decimals for token ${exToken}:`, error);
      // Default to 9 decimals (common in Solana) if there's an error
      adjustedValue = totalValue * Math.pow(10, 9);
    }

    try {
      // Use the preMarketWrapper to match offers
      // The preMarketWrapper.matchOffer method expects:
      // user: PublicKey, offerIds: number[], totalAmount: number, matchPrice: number,
      // offerType: "buy" | "sell", newOfferFullMatch: boolean, newOrderIds?: number[]
      return await this.preMarketWrapper.matchOffer(
        signerPublicKey,
        parseInt(tokenId),
        new PublicKey(exToken || NATIVE_MINT.toString()),
        offerIds,
        adjustedAmount,
        Number((adjustedValue / totalAmount).toFixed(mintDecimals)),
        type,
        newOfferFullMatch || false,
        undefined
      );
    } catch (error) {
      console.error("Error in matchOffer:", error);
      throw new Error(
        `Failed to match offers: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Fill an existing offer
   * @param offerId The ID of the offer to fill
   * @param amount The amount to fill
   * @param user Optional user's public key
   * @returns Transaction data
   */
  async fillOffer(
    offerId: number,
    amount: number,
    user?: string
  ): Promise<Transaction> {
    // Adjust amount by multiplying with 10^6
    const adjustedAmount = amount * Math.pow(10, 6);

    // Use provided user public key or get from signer
    let userPublicKey: PublicKey;
    if (user) {
      userPublicKey = new PublicKey(user);
    } else {
      const signerPublicKey = this.getSignerPublicKey();
      if (!signerPublicKey) {
        throw new Error("No signer set or signer has no public key");
      }
      userPublicKey = signerPublicKey;
    }

    return this.preMarket.fillOffer(offerId, adjustedAmount, userPublicKey);
  }

  /**
   * Cancel an offer
   * @param offerId The ID of the offer to cancel
   * @returns Transaction data
   */
  async cancelOffer(offerId: number): Promise<Transaction> {
    return this.preMarket.closeUnFullFilledOffer(offerId);
  }

  /**
   * Settle a filled order
   * @param orderId The ID of the order to settle
   * @returns Transaction data
   */
  async settleOrder(orderId: number): Promise<Transaction> {
    const { finalTransaction } = await this.preMarket.settleOrder(
      orderId,
      undefined,
      []
    );
    return finalTransaction;
  }

  async settleBatchOrder(offerId: number): Promise<Transaction[]> {
    const sellerPublicKey = this.getSignerPublicKey();
    if (!sellerPublicKey) {
      throw new Error("No signer set or signer has no public key");
    }
    return this.preMarket.settleBatchOrder(offerId, sellerPublicKey);
  }

  /**
   * Check if a token is accepted for trading
   * @param token The token address
   * @returns Whether the token is accepted
   */
  async isAcceptedToken(token: string): Promise<boolean> {
    try {
      const tokenPubKey = new PublicKey(token);
      const exTokenAccount = await this.preMarket.fetchExTokenAccount(
        tokenPubKey
      );
      return exTokenAccount.isAccepted;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get configuration data for the PreMarket
   * @returns The configuration data
   */
  async getConfig(): Promise<MarketConfig> {
    if (!this.configAccountPubKey) {
      throw new Error("PreMarket not initialized");
    }

    const configAccount = await this.preMarket.fetchConfigAccount(
      this.configAccountPubKey.toString()
    );

    return {
      pledgeRate: 0, // This value is not directly available in configAccount
      feeRefund: Number(configAccount.feeRefund),
      feeSettle: Number(configAccount.feeSettle),
      feeWallet: configAccount.feeWallet.toString(),
    };
  }

  /**
   * Get the underlying PreMarket instance
   * @returns The original PreMarket instance
   */
  getPreMarketInstance(): PreMarketOriginal {
    return this.preMarket;
  }

  /**
   * Set a token's acceptance status
   * @param token The token address
   * @param isAccepted Whether the token should be accepted
   * @returns Transaction data
   */
  async setTokenAcceptance(
    token: string,
    isAccepted: boolean
  ): Promise<Transaction> {
    return this.preMarket.setExToken(new PublicKey(token), isAccepted);
  }

  /**
   * Get token configuration
   * @param tokenId The token ID
   * @returns Token configuration data
   */
  async getTokenConfig(tokenId: number): Promise<any> {
    return this.preMarket.fetchTokenConfigAccount(tokenId);
  }

  /**
   * Settle an order with discount
   * @param orderId The order ID
   * @param settleVerifier The settle verifier public key
   * @param buyerFeeDiscount Buyer fee discount
   * @param sellerFeeDiscount Seller fee discount
   * @returns Transaction data
   */
  async settleOrderWithDiscount(
    orderId: number,
    settleVerifier: string,
    buyerFeeDiscount: number,
    sellerFeeDiscount: number
  ): Promise<Transaction> {
    return this.preMarket.settleOrderWithDiscount(
      orderId,
      new PublicKey(settleVerifier),
      new BN(buyerFeeDiscount),
      new BN(sellerFeeDiscount)
    );
  }

  /**
   * Cancel an order
   * @param orderId The order ID
   * @returns Transaction data
   */
  async cancelOrder(orderId: number): Promise<Transaction> {
    return this.preMarket.cancelUnfilledOrder(orderId);
  }

  /**
   * Check the allowance of tokens that a spender is allowed to use
   * @param spender The address of the spender
   * @param tokenAddress The address of the token
   * @returns The amount of tokens the spender is allowed to use
   */
  async checkAllowance(spender: string, tokenAddress: string): Promise<number> {
    return Number.MAX_SAFE_INTEGER;
  }

  /**
   * Approve a spender to use a specific amount of tokens
   * @param spender The address of the spender
   * @param tokenAddress The address of the token
   * @param amount The amount of tokens to approve
   * @returns Transaction of type T
   */
  async approve(
    spender: string,
    tokenAddress: string,
    amount: string | number
  ): Promise<Transaction> {
    return new Transaction();
  }
}
