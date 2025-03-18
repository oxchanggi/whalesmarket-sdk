import { Connection, Transaction } from "@solana/web3.js";
import { MultiPreMarketManager as BaseMultiPreMarketManager } from "@whalesmarket/core";
import { PreMarketSolana } from "./PreMarketSolana";

/**
 * Implementation of MultiPreMarketManager for Solana using PreMarketSolana
 * This class manages multiple PreMarketSolana instances
 */
export class MultiPreMarketManager extends BaseMultiPreMarketManager<PreMarketSolana> {
  /**
   * Create a new Solana PreMarket instance
   * @param connection Solana connection
   * @param programId Program ID for the pre-market
   * @param configAccountPubKey Optional config account public key
   * @returns A new PreMarketSolana instance
   */
  protected async createSolanaPreMarket(
    connection: Connection,
    programId: string,
    configAccountPubKey?: string
  ): Promise<PreMarketSolana> {
    const preMarket = new PreMarketSolana(connection, programId);

    if (configAccountPubKey) {
      await preMarket.initialize({ configAccountPubKey });
    }

    return preMarket;
  }
}
