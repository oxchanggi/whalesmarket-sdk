import { Connection, Transaction } from "@solana/web3.js";
import { MultiPreMarketManager as BaseMultiPreMarketManager } from "@whalesmarket/core";
import { PreMarketSolanaMobile } from "./PreMarketSolanaMobile";

/**
 * Implementation of MultiPreMarketManager for Mobile using PreMarketSolanaMobile
 * This class manages multiple PreMarketSolanaMobile instances
 */
export class MultiPreMarketManagerMobile extends BaseMultiPreMarketManager<PreMarketSolanaMobile> {
  private apiBaseUrl: string;

  /**
   * Constructor for MultiPreMarketManagerMobile
   * @param apiBaseUrl Base URL for the API
   */
  constructor(apiBaseUrl: string) {
    super();
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Create a new Solana Mobile PreMarket instance
   * @param connection Solana connection
   * @param programId Program ID for the pre-market
   * @param configAccountPubKey Optional config account public key
   * @returns A new PreMarketSolanaMobile instance
   */
  protected async createSolanaPreMarket(
    connection: Connection,
    programId: string,
    configAccountPubKey?: string
  ): Promise<PreMarketSolanaMobile> {
    const preMarket = new PreMarketSolanaMobile(
      connection,
      programId,
      this.apiBaseUrl
    );

    if (configAccountPubKey) {
      await preMarket.initialize({ configAccountPubKey });
    }

    return preMarket;
  }
}
