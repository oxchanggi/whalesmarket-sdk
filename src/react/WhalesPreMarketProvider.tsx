"use client";

import { useEffect, useState } from "react";
import { Connection, Transaction } from "@solana/web3.js";
import { ethers } from "ethers";
import { MultiPreMarketManager } from "../MultiPreMarketManager";
import { CreateOfferParams, TransactionCallbacks } from "../BasePreMarket";
import WhalesPreMarketContext from "./WhalesPreMarketContext";
import {
  WhalesPreMarketProviderProps,
  WhalesPreMarketContextValue,
} from "./types";
import BN from "bn.js";
import { MultiTokenManager } from "../MultiTokenManager";

/**
 * Provider component for WhalesPreMarket
 * Initializes and manages PreMarket instances
 */
export const WhalesPreMarketProvider = ({
  markets,
  children,
}: WhalesPreMarketProviderProps) => {
  const [manager] = useState(() => new MultiPreMarketManager());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tokens] = useState(new MultiTokenManager());

  // Initialize markets
  useEffect(() => {
    const initializeMarkets = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize each market
        for (const market of markets) {
          if (market.type === "solana") {
            const connection = new Connection(market.rpc);
            await manager.addSolanaMarket(
              market.id,
              connection,
              market.contractAddress,
              market.configAccountPubKey
            );

            // Initialize Solana token manager for this market
            tokens.addSolanaToken(market.id, connection);
          } else if (market.type === "evm") {
            const provider = new ethers.providers.JsonRpcProvider(market.rpc);
            await manager.addEVMMarket(
              market.id,
              market.contractAddress,
              provider
            );

            // Initialize EVM token manager for this market
            tokens.addEVMToken(market.id, provider);
          }
        }

        setIsInitialized(true);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to initialize markets")
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeMarkets();

    // Cleanup function
    return () => {
      // Remove all markets when component unmounts
      manager.getAllMarketIds().forEach(({ id }) => {
        manager.removeMarket(id);
        // Also remove token managers
        tokens.removeToken(id);
      });
    };
  }, [markets, manager, tokens]);

  // Context value
  const contextValue: WhalesPreMarketContextValue = {
    markets: manager.getAllMarketIds(),
    tokens: tokens.getAllTokenIds(),
    isInitialized,
    isLoading,
    error,
    getMarket: (id: string) => manager.getMarket(id),
    createOffer: (marketId: string, params: CreateOfferParams) =>
      manager.createOffer(marketId, params),
    fillOffer: (marketId: string, offerId: number, amount: number) =>
      manager.fillOffer(marketId, offerId, amount),
    cancelOffer: (marketId: string, offerId: number) =>
      manager.cancelOffer(marketId, offerId),
    settleOrder: (marketId: string, orderId: number) =>
      manager.settleOrder(marketId, orderId),
    getOffer: (marketId: string, offerId: number) =>
      manager.getOffer(marketId, offerId),
    getOrder: (marketId: string, orderId: number) =>
      manager.getOrder(marketId, orderId),
    getLastOfferId: (marketId: string) => manager.getLastOfferId(marketId),
    getLastOrderId: (marketId: string) => manager.getLastOrderId(marketId),
    isAcceptedToken: (marketId: string, token: string) =>
      manager.isAcceptedToken(marketId, token),
    getConfig: (marketId: string) => manager.getConfig(marketId),
    // Token functions
    getDecimals: (tokenId: string, tokenAddress: string) =>
      tokens.getDecimals(tokenId, tokenAddress),
    getName: (tokenId: string, tokenAddress: string) =>
      tokens.getName(tokenId, tokenAddress),
    getSymbol: (tokenId: string, tokenAddress: string) =>
      tokens.getSymbol(tokenId, tokenAddress),
    getUri: (tokenId: string, tokenAddress: string) =>
      tokens.getUri(tokenId, tokenAddress),
    getBalance: (tokenId: string, owner: string, tokenAddress: string) =>
      tokens.getBalance(tokenId, owner, tokenAddress),
    getAllowance: (
      tokenId: string,
      owner: string,
      tokenAddress: string,
      spender: string
    ) => tokens.getAllowance(tokenId, owner, tokenAddress, spender),
    approve: (
      tokenId: string,
      tokenAddress: string,
      spender: string,
      amount: number | string
    ) => tokens.approve(tokenId, tokenAddress, spender, amount),
    getTokenInfo: (tokenId: string, tokenAddress: string) =>
      tokens.getTokenInfo(tokenId, tokenAddress),
    updateTokenProvider: (
      tokenId: string,
      provider: Connection | ethers.providers.Provider
    ) => tokens.updateProvider(tokenId, provider),
    executeBatch: (
      operations: Array<{
        tokenId: string;
        operation: (token: any) => Promise<any>;
      }>
    ) => {
      // Convert the operations to the format expected by MultiTokenManager
      const mappedOperations = operations.map((op) => ({
        managerId: op.tokenId,
        operation: op.operation,
      }));

      return tokens.executeBatch(mappedOperations);
    },
  };

  return (
    <WhalesPreMarketContext.Provider value={contextValue}>
      {children}
    </WhalesPreMarketContext.Provider>
  );
};
