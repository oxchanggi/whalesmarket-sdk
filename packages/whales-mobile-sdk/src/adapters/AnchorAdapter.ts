import { PublicKey } from "@solana/web3.js";
import { MatchOfferParams } from "@whalesmarket/core";

/**
 * Interface for Anchor functionality that needs to be replaced in mobile
 */
export interface AnchorAdapter {
  /**
   * Set the pubkey
   */
  setPubkey(pubkey: string): void;

  /**
   * Initialize the adapter
   */
  initialize(configAccount: string): void;

  /**
   * Create a BN instance (replacement for @coral-xyz/anchor BN)
   */
  createBN(value: number): any;

  /**
   * Fetch offer account data
   */
  fetchOfferAccount(offerId: number): Promise<any>;

  /**
   * Fetch order account data
   */
  fetchOrderAccount(orderId: number): Promise<any>;

  /**
   * Fetch config account data
   */
  fetchConfigAccount(configAccountPubKey: string): Promise<any>;

  /**
   * Fetch token config account data
   */
  fetchTokenConfigAccount(tokenId: number): Promise<any>;

  /**
   * Fetch ex-token account data
   */
  fetchExTokenAccount(tokenPubKey: PublicKey): Promise<any>;

  /**
   * Bootstrap the PreMarket
   */
  bootstrap(configAccountPubKey: string): Promise<void>;

  /**
   * Find the last offer ID
   */
  findIdOffer(): Promise<number>;

  /**
   * Find the last order ID
   */
  findIdOrder(): Promise<number>;

  /**
   * Create an offer
   */
  createOffer(
    tokenId: number,
    type: string,
    exToken: PublicKey,
    amount: number,
    value: number,
    fullMatch: boolean,
    signerPublicKey: PublicKey
  ): Promise<any>;

  /**
   * Fill an offer
   */
  fillOffer(
    offerId: number,
    amount: number,
    userPublicKey: PublicKey
  ): Promise<any>;

  /**
   * Close an unfilled offer
   */
  closeUnFullFilledOffer(offerId: number): Promise<any>;

  /**
   * Settle an order
   */
  settleOrder(orderId: number): Promise<any>;

  /**
   * Set ex-token acceptance
   */
  setExToken(tokenPubKey: PublicKey, isAccepted: boolean): Promise<any>;

  /**
   * Settle an order with discount
   */
  settleOrderWithDiscount(
    orderId: number,
    settleVerifier: PublicKey,
    buyerFeeDiscount: any,
    sellerFeeDiscount: any
  ): Promise<any>;

  /**
   * Cancel an order
   */
  cancelOrder(orderId: number, userPublicKey: PublicKey): Promise<any>;

  /**
   * Match multiple offers and create a new offer with the remaining amount
   * @param params Parameters for matching offers
   * @returns Transaction data
   */
  matchOffer(params: MatchOfferParams): Promise<any>;

  /**
   * Settle a batch of orders for an offer
   * @param offerId The ID of the offer to get orders for
   * @param userPublicKey The public key of the user
   * @returns Array of transactions
   */
  settleBatchOrder(offerId: number): Promise<any[]>;
}
