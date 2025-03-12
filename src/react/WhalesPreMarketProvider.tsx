"use client";

import React, { useEffect, useState } from "react";
import { Connection, Transaction } from "@solana/web3.js";
import { ethers } from "ethers";
import { useWalletClient } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
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
  const {
    data: walletClient,
    isError: isWagmiError,
    error: wagmi,
  } = useWalletClient();
  const connectorSol = useWallet();

  // Check if the component is wrapped in the required providers
  useEffect(() => {
    // Check if there are EVM markets
    const hasEvmMarkets = markets.some((market) => market.type === "evm");
    // Check if there are Solana markets
    const hasSolanaMarkets = markets.some((market) => market.type === "solana");

    // Check if WagmiProvider is missing for EVM markets
    if (hasEvmMarkets && isWagmiError) {
      throw new Error(
        "WhalesPreMarketProvider must be wrapped in a WagmiProvider when using EVM markets. " +
          "Please wrap your application with WagmiProvider before using WhalesPreMarketProvider."
      );
    }

    // Check if WalletProvider is missing for Solana markets
    if (
      hasSolanaMarkets &&
      (!connectorSol || typeof connectorSol.publicKey === "undefined")
    ) {
      throw new Error(
        "WhalesPreMarketProvider must be wrapped in a WalletProvider from @solana/wallet-adapter-react when using Solana markets. " +
          "Please wrap your application with WalletProvider before using WhalesPreMarketProvider."
      );
    }
  }, [markets, isWagmiError, connectorSol]);

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
          } else if (market.type === "evm") {
            const provider = new ethers.providers.JsonRpcProvider(market.rpc);
            await manager.addEVMMarket(
              market.id,
              market.contractAddress,
              provider
            );
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
      });
    };
  }, [markets, manager]);

  // Set EVM signer when walletClient changes
  useEffect(() => {
    if (!walletClient || !isInitialized) return;

    // Get all EVM markets and set the signer
    const evmMarkets = manager
      .getAllMarketIds()
      .filter((m) => m.chain === "evm");

    for (const { id } of evmMarkets) {
      try {
        // Get the EVM market
        const market = manager.getEVMMarket(id);

        // Create an ethers provider from the walletClient
        // For wagmi v2, we need to adapt the walletClient to work with ethers
        const provider = new ethers.providers.Web3Provider(
          walletClient?.transport as any
        );

        const signer = provider.getSigner();

        // Set the signer for this market
        market.setSigner(signer);

        console.log(`Set signer for EVM market: ${id}`);
      } catch (err) {
        console.error(`Failed to set signer for market ${id}:`, err);
      }
    }
  }, [walletClient, isInitialized, manager]);

  // Set Solana signer when connectorSol changes
  useEffect(() => {
    if (!connectorSol || !isInitialized) return;

    // Get all Solana markets and set the signer
    const solanaMarkets = manager
      .getAllMarketIds()
      .filter((m) => m.chain === "solana");

    for (const { id } of solanaMarkets) {
      try {
        // Get the Solana market
        const market = manager.getSolanaMarket(id);

        // Set the wallet for this market
        market.setSigner(connectorSol);

        console.log(`Set wallet for Solana market: ${id}`);
      } catch (err) {
        console.error(`Failed to set wallet for market ${id}:`, err);
      }
    }
  }, [connectorSol, isInitialized, manager]);

  // Token functions implementation
  const getDecimals = (
    tokenId: string,
    tokenAddress: string
  ): Promise<number> => {
    // Implementation will depend on your token management system
    return Promise.resolve(18); // Default for most ERC20 tokens
  };

  const getName = (tokenId: string, tokenAddress: string): Promise<string> => {
    return Promise.resolve(""); // Placeholder implementation
  };

  const getSymbol = (
    tokenId: string,
    tokenAddress: string
  ): Promise<string> => {
    return Promise.resolve(""); // Placeholder implementation
  };

  const getUri = (tokenId: string, tokenAddress: string): Promise<string> => {
    return Promise.resolve(""); // Placeholder implementation
  };

  const getBalance = (
    tokenId: string,
    owner: string,
    tokenAddress: string
  ): Promise<number> => {
    return Promise.resolve(0); // Placeholder implementation
  };

  const getAllowance = (
    tokenId: string,
    owner: string,
    tokenAddress: string,
    spender: string
  ): Promise<number> => {
    return Promise.resolve(0); // Placeholder implementation
  };

  const approve = (
    tokenId: string,
    tokenAddress: string,
    spender: string,
    amount: number | string
  ): Promise<ethers.PopulatedTransaction | Transaction> => {
    return Promise.resolve({} as ethers.PopulatedTransaction | Transaction); // Placeholder implementation
  };

  const parseAmount = (
    tokenId: string,
    tokenAddress: string,
    amount: number | string
  ): Promise<ethers.BigNumber | BN> => {
    return Promise.resolve(ethers.BigNumber.from(0)); // Placeholder implementation
  };

  const formatAmount = (
    tokenId: string,
    tokenAddress: string,
    amount: ethers.BigNumber | BN
  ): Promise<string> => {
    return Promise.resolve("0"); // Placeholder implementation
  };

  const getTokenInfo = (tokenId: string, tokenAddress: string) => {
    return Promise.resolve({
      address: tokenAddress,
      decimals: 18,
      name: "",
      symbol: "",
    }); // Placeholder implementation
  };

  const updateTokenProvider = (
    tokenId: string,
    provider: Connection | ethers.providers.Provider
  ): void => {
    // Placeholder implementation
  };

  // Generic function to execute batch operations
  const executeBatch = async <T,>(
    operations: Array<{
      tokenId: string;
      operation: (token: any) => Promise<T>;
    }>
  ): Promise<T[]> => {
    return Promise.resolve([] as T[]); // Placeholder implementation
  };

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
    signAndSendTransaction: (
      marketId: string,
      tx: ethers.PopulatedTransaction | Transaction,
      callbacks?: TransactionCallbacks
    ) => manager.signAndSendTransaction(marketId, tx, callbacks),

    // Token functions
    getDecimals,
    getName,
    getSymbol,
    getUri,
    getBalance,
    getAllowance,
    approve,
    parseAmount,
    formatAmount,
    getTokenInfo,
    updateTokenProvider,
    executeBatch,
  };

  return (
    <WhalesPreMarketContext.Provider value={contextValue}>
      {children}
    </WhalesPreMarketContext.Provider>
  );
};
