"use client";

import React, { Component } from "react";
import { Connection, Transaction } from "@solana/web3.js";
import { ethers } from "ethers";
import { MultiPreMarketManager } from "../managers/MultiPreMarketManager";
import {
  BasePreMarket,
  CreateOfferParams,
  MatchOfferParams,
} from "../base/BasePreMarket";
import WhalesPreMarketContext from "./WhalesPreMarketContext";
import {
  WhalesPreMarketProviderProps,
  WhalesPreMarketContextValue,
} from "./types";
import { MultiTokenManager } from "../managers/MultiTokenManager";

/**
 * Abstract Provider class for WhalesPreMarket
 * Initializes and manages PreMarket instances
 * Can be extended by child classes for custom functionality
 */
export abstract class WhalesPreMarketProvider<
  T extends BasePreMarket<Transaction, any>
> extends Component<
  WhalesPreMarketProviderProps,
  {
    isInitialized: boolean;
    isLoading: boolean;
    error: Error | null;
  }
> {
  protected manager: MultiPreMarketManager<T>;
  protected tokens: MultiTokenManager;

  constructor(props: WhalesPreMarketProviderProps) {
    super(props);

    // Initialize state
    this.state = {
      isInitialized: false,
      isLoading: true,
      error: null,
    };

    // Initialize managers
    this.manager = {} as MultiPreMarketManager<T>;
    this.tokens = new MultiTokenManager();

    // Bind methods
    this.getContextValue = this.getContextValue.bind(this);
  }

  // Abstract method that can be overridden by child classes
  protected abstract customizeMarketInitialization(market: any): Promise<void>;

  componentDidMount() {
    this.initializeMarkets();
  }

  componentWillUnmount() {
    // Cleanup when component unmounts
    this.manager.getAllMarketIds().forEach(({ id }: { id: string }) => {
      this.manager.removeMarket(id);
      // Also remove token managers
      this.tokens.removeToken(id);
    });
  }

  async initializeMarkets() {
    try {
      this.setState({ isLoading: true, error: null });

      // Initialize each market
      for (const market of this.props.markets) {
        if (market.type === "solana") {
          const connection = new Connection(market.rpc);
          await this.manager.addSolanaMarket(
            market.id,
            connection,
            market.contractAddress,
            market.configAccountPubKey
          );

          // Initialize Solana token manager for this market
          this.tokens.addSolanaToken(market.id, connection);
        } else if (market.type === "evm") {
          const provider = new ethers.providers.JsonRpcProvider(market.rpc);
          await this.manager.addEVMMarket(
            market.id,
            market.contractAddress,
            provider
          );

          // Initialize EVM token manager for this market
          this.tokens.addEVMToken(market.id, provider);
        }

        // Call the abstract method for custom initialization
        await this.customizeMarketInitialization(market);
      }

      this.setState({ isInitialized: true });
    } catch (err) {
      this.setState({
        error:
          err instanceof Error
            ? err
            : new Error("Failed to initialize markets"),
      });
    } finally {
      this.setState({ isLoading: false });
    }
  }

  // Create context value from current state and methods
  getContextValue(): WhalesPreMarketContextValue {
    return {
      markets: this.manager.getAllMarketIds(),
      tokens: this.tokens.getAllTokenIds(),
      isInitialized: this.state.isInitialized,
      isLoading: this.state.isLoading,
      error: this.state.error,
      getMarket: (id: string) => this.manager.getMarket(id),
      createOffer: (marketId: string, params: CreateOfferParams) =>
        this.manager.createOffer(marketId, params),
      matchOffer: (marketId: string, params: MatchOfferParams) =>
        this.manager.matchOffer(marketId, params),
      fillOffer: (marketId: string, offerId: number, amount: number) =>
        this.manager.fillOffer(marketId, offerId, amount),
      cancelOffer: (marketId: string, offerId: number) =>
        this.manager.cancelOffer(marketId, offerId),
      settleOrder: (marketId: string, orderId: number) =>
        this.manager.settleOrder(marketId, orderId),
      getOffer: (marketId: string, offerId: number) =>
        this.manager.getOffer(marketId, offerId),
      getOrder: (marketId: string, orderId: number) =>
        this.manager.getOrder(marketId, orderId),
      getLastOfferId: (marketId: string) =>
        this.manager.getLastOfferId(marketId),
      getLastOrderId: (marketId: string) =>
        this.manager.getLastOrderId(marketId),
      isAcceptedToken: (marketId: string, token: string) =>
        this.manager.isAcceptedToken(marketId, token),
      getConfig: (marketId: string) => this.manager.getConfig(marketId),
      // Token functions
      getDecimals: (tokenId: string, tokenAddress: string) =>
        this.tokens.getDecimals(tokenId, tokenAddress),
      getName: (tokenId: string, tokenAddress: string) =>
        this.tokens.getName(tokenId, tokenAddress),
      getSymbol: (tokenId: string, tokenAddress: string) =>
        this.tokens.getSymbol(tokenId, tokenAddress),
      getUri: (tokenId: string, tokenAddress: string) =>
        this.tokens.getUri(tokenId, tokenAddress),
      getBalance: (tokenId: string, owner: string, tokenAddress: string) =>
        this.tokens.getBalance(tokenId, owner, tokenAddress),
      getAllowance: (
        tokenId: string,
        owner: string,
        tokenAddress: string,
        spender: string
      ) => this.tokens.getAllowance(tokenId, owner, tokenAddress, spender),
      approve: (
        tokenId: string,
        tokenAddress: string,
        spender: string,
        amount: number | string
      ) => this.tokens.approve(tokenId, tokenAddress, spender, amount),
      getTokenInfo: (tokenId: string, tokenAddress: string) =>
        this.tokens.getTokenInfo(tokenId, tokenAddress),
      updateTokenProvider: (
        tokenId: string,
        provider: Connection | ethers.providers.Provider
      ) => this.tokens.updateProvider(tokenId, provider),
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

        return this.tokens.executeBatch(mappedOperations);
      },
    };
  }

  render(): JSX.Element {
    // Create a simple element that just passes through props.children
    // This is to avoid React Context Provider type issues
    return React.createElement(
      WhalesPreMarketContext.Provider,
      { value: this.getContextValue() },
      this.props.children
    );
  }
}
