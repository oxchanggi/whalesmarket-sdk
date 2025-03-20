"use client";

import React, { useState, useEffect, useRef } from "react";
import { Connection, Transaction } from "@solana/web3.js";
import { ethers } from "ethers";
import {
  WhalesPreMarketProviderProps,
  WhalesPreMarketContextValue,
  WhalesPreMarketContext,
  MultiTokenManager,
} from "@whalesmarket/core";
import { MultiPreMarketManager } from "../MultiPreMarketManager";

/**
 * WhalesPreMarketProvider for whales-sdk
 * Implemented as a functional component using hooks
 * Specialized for PreMarketSolana
 */
export const WhalesPreMarketProvider: React.FC<WhalesPreMarketProviderProps> =
  ({ markets, children }) => {
    // State for tracking initialization and loading states
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Create refs to hold managers to avoid recreation on re-renders
    const managerRef = useRef<MultiPreMarketManager>(
      new MultiPreMarketManager()
    );
    const tokensRef = useRef<MultiTokenManager>(new MultiTokenManager());

    /**
     * Custom initialization for Solana markets
     * This method is called during initialization for each market
     * @param market Market configuration
     */
    const customizeMarketInitialization = async (
      market: any
    ): Promise<void> => {
      // Additional initialization specific to Solana markets if needed
      // This is a placeholder for any custom initialization logic
      console.log(`Initialized Solana market: ${market.id}`);
    };

    // Initialize markets on component mount
    useEffect(() => {
      const initializeMarkets = async () => {
        try {
          setIsLoading(true);
          setError(null);

          // Initialize each market
          for (const market of markets) {
            if (market.type === "solana") {
              const connection = new Connection(market.rpc);
              await managerRef.current.addSolanaMarket(
                market.id,
                connection,
                market.contractAddress,
                market.configAccountPubKey
              );

              // Initialize Solana token manager for this market
              tokensRef.current.addSolanaToken(market.id, connection);
            } else if (market.type === "evm") {
              const provider = new ethers.providers.JsonRpcProvider(market.rpc);
              await managerRef.current.addEVMMarket(
                market.id,
                market.contractAddress,
                provider
              );

              // Initialize EVM token manager for this market
              tokensRef.current.addEVMToken(market.id, provider);
            }

            // Call custom initialization for each market
            await customizeMarketInitialization(market);
          }

          setIsInitialized(true);
        } catch (err) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to initialize markets")
          );
        } finally {
          setIsLoading(false);
        }
      };

      initializeMarkets();

      // Cleanup function when component unmounts
      return () => {
        managerRef.current
          .getAllMarketIds()
          .forEach(({ id }: { id: string }) => {
            managerRef.current.removeMarket(id);
            // Also remove token managers
            tokensRef.current.removeToken(id);
          });
      };
    }, [markets]); // Only re-run if markets array changes

    // Create context value from current state
    const contextValue: WhalesPreMarketContextValue = {
      markets: managerRef.current.getAllMarketIds(),
      tokens: tokensRef.current.getAllTokenIds(),
      isInitialized,
      isLoading,
      error,
      getMarket: (id: string) => managerRef.current.getMarket(id),
      createOffer: (marketId: string, params: any) =>
        managerRef.current.createOffer(marketId, params),
      matchOffer: (marketId: string, params: any) =>
        managerRef.current.matchOffer(marketId, params),
      fillOffer: (marketId: string, offerId: number, amount: number) =>
        managerRef.current.fillOffer(marketId, offerId, amount),
      cancelOffer: (marketId: string, offerId: number) =>
        managerRef.current.cancelOffer(marketId, offerId),
      settleOrder: (marketId: string, orderId: number) =>
        managerRef.current.settleOrder(marketId, orderId),
      getOffer: (marketId: string, offerId: number) =>
        managerRef.current.getOffer(marketId, offerId),
      getOrder: (marketId: string, orderId: number) =>
        managerRef.current.getOrder(marketId, orderId),
      getLastOfferId: (marketId: string) =>
        managerRef.current.getLastOfferId(marketId),
      getLastOrderId: (marketId: string) =>
        managerRef.current.getLastOrderId(marketId),
      isAcceptedToken: (marketId: string, token: string) =>
        managerRef.current.isAcceptedToken(marketId, token),
      getConfig: (marketId: string) => managerRef.current.getConfig(marketId),
      // Token functions
      getDecimals: (tokenId: string, tokenAddress: string) =>
        tokensRef.current.getDecimals(tokenId, tokenAddress),
      getName: (tokenId: string, tokenAddress: string) =>
        tokensRef.current.getName(tokenId, tokenAddress),
      getSymbol: (tokenId: string, tokenAddress: string) =>
        tokensRef.current.getSymbol(tokenId, tokenAddress),
      getUri: (tokenId: string, tokenAddress: string) =>
        tokensRef.current.getUri(tokenId, tokenAddress),
      getBalance: (tokenId: string, owner: string, tokenAddress: string) =>
        tokensRef.current.getBalance(tokenId, owner, tokenAddress),
      getAllowance: (
        tokenId: string,
        owner: string,
        tokenAddress: string,
        spender: string
      ) =>
        tokensRef.current.getAllowance(tokenId, owner, tokenAddress, spender),
      approve: (
        tokenId: string,
        tokenAddress: string,
        spender: string,
        amount: number | string
      ) => tokensRef.current.approve(tokenId, tokenAddress, spender, amount),
      getTokenInfo: (tokenId: string, tokenAddress: string) =>
        tokensRef.current.getTokenInfo(tokenId, tokenAddress),
      updateTokenProvider: (tokenId: string, provider: Connection | any) =>
        tokensRef.current.updateProvider(tokenId, provider),
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

        return tokensRef.current.executeBatch(mappedOperations);
      },
    };

    // Render the provider with the context value
    return React.createElement(
      WhalesPreMarketContext.Provider,
      { value: contextValue },
      children
    );
  };

export default WhalesPreMarketProvider;
