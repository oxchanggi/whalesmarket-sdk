import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
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
} from "@whalesmarket/core";
import { NATIVE_MINT, getMint } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { AnchorAdapter } from "./adapters/AnchorAdapter";
import { ApiAnchorAdapter } from "./adapters/ApiAnchorAdapter";

/**
 * Type definition for Solana signers
 * Can be either a Keypair or WalletContextState
 */
export type SolanaSigner = Keypair | WalletContextState;

/**
 * PreMarketOriginalMobile class that uses the AnchorAdapter
 * This replaces the original PreMarket class that uses Anchor directly
 */
class PreMarketOriginalMobile {
  private connection: Connection;
  private programId: string;
  private adapter: AnchorAdapter;

  constructor(
    connection: Connection,
    programId: string,
    adapter: AnchorAdapter
  ) {
    this.connection = connection;
    this.programId = programId;
    this.adapter = adapter;
  }

  async bootstrap(configAccountPubKey: string): Promise<void> {
    return this.adapter.bootstrap(configAccountPubKey);
  }

  async findIdOffer(): Promise<number> {
    return this.adapter.findIdOffer();
  }

  async findIdOrder(): Promise<number> {
    return this.adapter.findIdOrder();
  }

  async fetchOfferAccount(offerId: number): Promise<any> {
    return this.adapter.fetchOfferAccount(offerId);
  }

  async fetchOrderAccount(orderId: number): Promise<any> {
    return this.adapter.fetchOrderAccount(orderId);
  }

  async fetchConfigAccount(configAccountPubKey: string): Promise<any> {
    return this.adapter.fetchConfigAccount(configAccountPubKey);
  }

  async fetchTokenConfigAccount(tokenId: number): Promise<any> {
    return this.adapter.fetchTokenConfigAccount(tokenId);
  }

  async fetchExTokenAccount(tokenPubKey: PublicKey): Promise<any> {
    return this.adapter.fetchExTokenAccount(tokenPubKey);
  }

  async createOffer(
    tokenId: number,
    type: string,
    tokenPublicKey: PublicKey,
    amount: number,
    value: number,
    fullMatch: boolean,
    signerPublicKey: PublicKey
  ): Promise<Transaction> {
    return this.adapter.createOffer(
      tokenId,
      type,
      tokenPublicKey,
      amount,
      value,
      fullMatch,
      signerPublicKey
    );
  }

  async fillOffer(
    offerId: number,
    amount: number,
    userPublicKey: PublicKey
  ): Promise<Transaction> {
    return this.adapter.fillOffer(offerId, amount, userPublicKey);
  }

  async closeUnFullFilledOffer(offerId: number): Promise<Transaction> {
    return this.adapter.closeUnFullFilledOffer(offerId);
  }

  async settleOrder(orderId: number): Promise<Transaction> {
    return this.adapter.settleOrder(orderId);
  }

  async setExToken(
    tokenPubKey: PublicKey,
    isAccepted: boolean
  ): Promise<Transaction> {
    return this.adapter.setExToken(tokenPubKey, isAccepted);
  }

  async settleOrderWithDiscount(
    orderId: number,
    settleVerifier: PublicKey,
    buyerFeeDiscount: any,
    sellerFeeDiscount: any
  ): Promise<Transaction> {
    return this.adapter.settleOrderWithDiscount(
      orderId,
      settleVerifier,
      buyerFeeDiscount,
      sellerFeeDiscount
    );
  }

  async cancelOrder(
    orderId: number,
    userPublicKey: PublicKey
  ): Promise<Transaction> {
    return this.adapter.cancelOrder(orderId, userPublicKey);
  }
}

/**
 * PreMarketWrapperMobile class that uses the AnchorAdapter
 * This replaces the original PreMarketWrapper class
 */
class PreMarketWrapperMobile {
  private preMarket: PreMarketOriginalMobile;
  private adapter: AnchorAdapter;

  constructor(preMarket: PreMarketOriginalMobile, adapter: AnchorAdapter) {
    this.preMarket = preMarket;
    this.adapter = adapter;
  }

  async matchOffer(
    user: PublicKey,
    offerIds: number[],
    totalAmount: number,
    matchPrice: number,
    offerType: string,
    newOfferFullMatch: boolean
  ): Promise<Transaction> {
    try {
      // In a real implementation, this would call the API to match offers
      // For now, we'll create a dummy transaction
      const transaction = new Transaction();

      // Add a memo to the transaction to identify it
      // In a real implementation, this would be replaced with actual instructions
      // transaction.add(new TransactionInstruction({
      //   keys: [],
      //   programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      //   data: Buffer.from(`Match offers: ${offerIds.join(',')}`, 'utf-8'),
      // }));

      return transaction;
    } catch (error) {
      console.error("Error in matchOffer:", error);
      throw new Error(
        `Failed to match offers: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

/**
 * Mobile-friendly implementation of PreMarketSolana
 * Uses API calls instead of Anchor
 */
export class PreMarketSolanaMobile extends BasePreMarket<
  Transaction,
  SolanaSigner
> {
  private preMarket: PreMarketOriginalMobile;
  private preMarketWrapper: PreMarketWrapperMobile;
  private connection: Connection;
  private configAccountPubKey: PublicKey | null = null;
  private adapter: AnchorAdapter;

  /**
   * Create a new PreMarketSolanaMobile instance
   * @param connection Solana connection
   * @param programId Program ID for the PreMarket program
   * @param apiBaseUrl Base URL for the API
   */
  constructor(
    connection: Connection,
    programId: string,
    apiBaseUrl: string = "http://localhost:3000"
  ) {
    super();
    this.connection = connection;
    this.adapter = new ApiAnchorAdapter(apiBaseUrl);
    this.preMarket = new PreMarketOriginalMobile(
      connection,
      programId,
      this.adapter
    );
    this.preMarketWrapper = new PreMarketWrapperMobile(
      this.preMarket,
      this.adapter
    );
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
   * Sign and send a transaction
   * @param tx The transaction to sign and send
   * @param callbacks Optional callbacks for transaction events
   * @returns The transaction result
   */
  async signAndSendTransaction(
    tx: Transaction,
    callbacks?: TransactionCallbacks
  ): Promise<TransactionResult> {
    if (!this._signer) {
      throw new Error("No signer set. Please call setSigner() first.");
    }

    try {
      // Add recent blockhash
      tx.recentBlockhash = (
        await this.connection.getLatestBlockhash()
      ).blockhash;

      let signature: string;

      // Handle different signer types
      if (this._signer instanceof Keypair) {
        // Sign with Keypair
        tx.sign(this._signer);
        signature = await this.connection.sendRawTransaction(tx.serialize());
      } else {
        // Sign with WalletContextState
        if (!this._signer.signTransaction) {
          throw new Error("Wallet does not support signing transactions");
        }

        const signedTx = await this._signer.signTransaction(tx);
        signature = await this.connection.sendRawTransaction(
          signedTx.serialize()
        );
      }

      // Call onSubmit callback if provided
      if (callbacks?.onSubmit) {
        await callbacks.onSubmit(signature);
      }

      // Get transaction status
      const status = await this.getTransactionStatus(signature);

      // Call onFinally callback if provided
      if (callbacks?.onFinally) {
        await callbacks.onFinally({
          ...status,
          txHash: signature,
        });
      }

      return {
        transaction: { hash: signature },
        status,
      };
    } catch (error) {
      // Call onError callback if provided
      if (callbacks?.onError && error instanceof Error) {
        await callbacks.onError(error);
      }

      throw error;
    }
  }

  /**
   * Get the public key of the current signer
   * @returns The public key of the current signer
   */
  getSignerPublicKey(): PublicKey | null {
    if (!this._signer) {
      return null;
    }

    if (this._signer instanceof Keypair) {
      return this._signer.publicKey;
    } else {
      return this._signer.publicKey || null;
    }
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
    } = params;

    // Validate input parameters
    if (!offerIds || offerIds.length === 0) {
      throw new Error("At least one offer ID must be provided");
    }

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
    const signerPublicKey = this.getSignerPublicKey();
    if (!signerPublicKey) {
      throw new Error("No signer set or signer has no public key");
    }

    // Adjust amount by multiplying with 10^6
    const adjustedAmount = totalAmount * Math.pow(10, 6);

    // Get token decimals and adjust value
    const tokenPublicKey = new PublicKey(exToken || NATIVE_MINT.toString());
    let adjustedValue = totalValue;
    try {
      // Get token mint info to retrieve decimals
      const mintInfo = await getMint(this.connection, tokenPublicKey);

      // Adjust value based on token decimals
      // Multiply by 10^decimals
      adjustedValue = totalValue * Math.pow(10, mintInfo.decimals);
    } catch (error) {
      console.error(`Error getting decimals for token ${exToken}:`, error);
      // Default to 9 decimals (common in Solana) if there's an error
      adjustedValue = totalValue * Math.pow(10, 9);
    }

    try {
      // Use the preMarketWrapper to match offers
      return await this.preMarketWrapper.matchOffer(
        signerPublicKey,
        offerIds,
        adjustedAmount,
        adjustedValue,
        type,
        newOfferFullMatch
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
    return this.preMarket.settleOrder(orderId);
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
  getPreMarketInstance(): PreMarketOriginalMobile {
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
      this.adapter.createBN(buyerFeeDiscount),
      this.adapter.createBN(sellerFeeDiscount)
    );
  }

  /**
   * Cancel an order
   * @param orderId The order ID
   * @returns Transaction data
   */
  async cancelOrder(orderId: number): Promise<Transaction> {
    const signerPublicKey = this.getSignerPublicKey();
    if (!signerPublicKey) {
      throw new Error("No signer set or signer has no public key");
    }
    return this.preMarket.cancelOrder(orderId, signerPublicKey);
  }
}
