import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { ethers } from "ethers";
import {
  BasePreMarket,
  CreateOfferParams,
  MarketConfig,
  OfferData,
  OrderData,
  TransactionCallbacks,
  TransactionResult,
} from "../base/BasePreMarket";
import { PreMarketContract } from "../pre-markets/PreMarketEVM";
/**
 * Interface for market identification
 */
export interface MarketIdentifier {
  id: string;
  chain: "solana" | "evm";
}

type PreMarketSolana = BasePreMarket<Transaction, any>;

/**
 * Class for managing multiple pre-markets across different chains
 */
export class MultiPreMarketManager {
  private solanaMarkets: Map<string, PreMarketSolana> = new Map();
  private evmMarkets: Map<string, PreMarketContract> = new Map();

  /**
   * Add a Solana pre-market to the manager
   * @param id Unique identifier for this market
   * @param connection Solana connection
   * @param programId Program ID for the pre-market
   * @param configAccountPubKey Optional config account public key
   * @returns The added PreMarketSolana instance
   */
  public async addSolanaMarket(
    id: string,
    preMarket: PreMarketSolana
  ): Promise<PreMarketSolana> {
    if (this.solanaMarkets.has(id) || this.evmMarkets.has(id)) {
      throw new Error(`Market with ID ${id} already exists`);
    }

    this.solanaMarkets.set(id, preMarket);
    return preMarket;
  }

  /**
   * Add an EVM pre-market to the manager
   * @param id Unique identifier for this market
   * @param contractAddress Contract address for the pre-market
   * @param signerOrProvider Signer or provider for the contract
   * @returns The added PreMarketContract instance
   */
  public async addEVMMarket(
    id: string,
    contractAddress: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ): Promise<PreMarketContract> {
    if (this.solanaMarkets.has(id) || this.evmMarkets.has(id)) {
      throw new Error(`Market with ID ${id} already exists`);
    }

    const market = new PreMarketContract(contractAddress, signerOrProvider);
    await market.initialize({});

    this.evmMarkets.set(id, market);
    return market;
  }

  /**
   * Get a pre-market by ID
   * @param id The market ID
   * @returns The pre-market instance
   */
  public getMarket(id: string): BasePreMarket<any> {
    const solanaMarket = this.solanaMarkets.get(id);
    if (solanaMarket) {
      return solanaMarket;
    }

    const evmMarket = this.evmMarkets.get(id);
    if (evmMarket) {
      return evmMarket;
    }

    throw new Error(`Market with ID ${id} not found`);
  }

  /**
   * Get a Solana pre-market by ID
   * @param id The market ID
   * @returns The PreMarketSolana instance
   */
  public getSolanaMarket(id: string): PreMarketSolana {
    const market = this.solanaMarkets.get(id);
    if (!market) {
      throw new Error(`Solana market with ID ${id} not found`);
    }
    return market;
  }

  /**
   * Get an EVM pre-market by ID
   * @param id The market ID
   * @returns The PreMarketContract instance
   */
  public getEVMMarket(id: string): PreMarketContract {
    const market = this.evmMarkets.get(id);
    if (!market) {
      throw new Error(`EVM market with ID ${id} not found`);
    }
    return market;
  }

  /**
   * Remove a market by ID
   * @param id The market ID
   * @returns True if the market was removed, false otherwise
   */
  public removeMarket(id: string): boolean {
    if (this.solanaMarkets.has(id)) {
      return this.solanaMarkets.delete(id);
    }

    if (this.evmMarkets.has(id)) {
      return this.evmMarkets.delete(id);
    }

    return false;
  }

  /**
   * Get all market identifiers
   * @returns Array of market identifiers
   */
  public getAllMarketIds(): MarketIdentifier[] {
    const markets: MarketIdentifier[] = [];

    for (const id of this.solanaMarkets.keys()) {
      markets.push({ id, chain: "solana" });
    }

    for (const id of this.evmMarkets.keys()) {
      markets.push({ id, chain: "evm" });
    }

    return markets;
  }

  /**
   * Get the last offer ID from a specific market
   * @param marketId The market ID
   * @returns The last offer ID
   */
  public async getLastOfferId(marketId: string): Promise<number> {
    const market = this.getMarket(marketId);
    return market.getLastOfferId();
  }

  /**
   * Get the last order ID from a specific market
   * @param marketId The market ID
   * @returns The last order ID
   */
  public async getLastOrderId(marketId: string): Promise<number> {
    const market = this.getMarket(marketId);
    return market.getLastOrderId();
  }

  /**
   * Get an offer by ID from a specific market
   * @param marketId The market ID
   * @param offerId The offer ID
   * @returns The offer data
   */
  public async getOffer(marketId: string, offerId: number): Promise<OfferData> {
    const market = this.getMarket(marketId);
    return market.getOffer(offerId);
  }

  /**
   * Get an order by ID from a specific market
   * @param marketId The market ID
   * @param orderId The order ID
   * @returns The order data
   */
  public async getOrder(marketId: string, orderId: number): Promise<OrderData> {
    const market = this.getMarket(marketId);
    return market.getOrder(orderId);
  }

  /**
   * Create a new offer in a specific market
   * @param marketId The market ID
   * @param params Parameters for creating the offer
   * @returns Transaction (type depends on the chain)
   */
  public async createOffer(
    marketId: string,
    params: CreateOfferParams
  ): Promise<Transaction | ethers.PopulatedTransaction> {
    const market = this.getMarket(marketId);
    return market.createOffer(params);
  }

  /**
   * Fill an existing offer in a specific market
   * @param marketId The market ID
   * @param offerId The ID of the offer to fill
   * @param amount The amount to fill
   * @returns Transaction (type depends on the chain)
   */
  public async fillOffer(
    marketId: string,
    offerId: number,
    amount: number
  ): Promise<Transaction | ethers.PopulatedTransaction> {
    const market = this.getMarket(marketId);
    return market.fillOffer(offerId, amount);
  }

  /**
   * Cancel an offer in a specific market
   * @param marketId The market ID
   * @param offerId The ID of the offer to cancel
   * @returns Transaction (type depends on the chain)
   */
  public async cancelOffer(
    marketId: string,
    offerId: number
  ): Promise<Transaction | ethers.PopulatedTransaction> {
    const market = this.getMarket(marketId);
    return market.cancelOffer(offerId);
  }

  /**
   * Settle a filled order in a specific market
   * @param marketId The market ID
   * @param orderId The ID of the order to settle
   * @returns Transaction (type depends on the chain)
   */
  public async settleOrder(
    marketId: string,
    orderId: number
  ): Promise<Transaction | ethers.PopulatedTransaction> {
    const market = this.getMarket(marketId);
    return market.settleOrder(orderId);
  }

  /**
   * Check if a token is accepted for trading in a specific market
   * @param marketId The market ID
   * @param token The token address or identifier
   * @returns Whether the token is accepted
   */
  public async isAcceptedToken(
    marketId: string,
    token: string
  ): Promise<boolean> {
    const market = this.getMarket(marketId);
    return market.isAcceptedToken(token);
  }

  /**
   * Get configuration data for a specific market
   * @param marketId The market ID
   * @returns The configuration data
   */
  public async getConfig(marketId: string): Promise<MarketConfig> {
    const market = this.getMarket(marketId);
    return market.getConfig();
  }

  /**
   * Sign and send a transaction for a specific market
   * @param marketId The market ID
   * @param tx The transaction to sign and send
   * @param callbacks Optional callbacks for transaction events
   * @returns Transaction result with status
   */
  public async signAndSendTransaction(
    marketId: string,
    tx: Transaction | ethers.PopulatedTransaction,
    callbacks?: TransactionCallbacks
  ): Promise<TransactionResult> {
    throw new Error("Not implemented");
  }

  /**
   * Execute a batch of operations across multiple markets
   * @param operations Array of operations to execute
   * @returns Results of the operations
   */
  public async executeBatch<T>(
    operations: Array<{
      marketId: string;
      operation: (market: BasePreMarket<any>) => Promise<T>;
    }>
  ): Promise<T[]> {
    const results: T[] = [];

    for (const op of operations) {
      const market = this.getMarket(op.marketId);
      const result = await op.operation(market);
      results.push(result);
    }

    return results;
  }
}
