import { Connection } from "@solana/web3.js";
import { ethers } from "ethers";
import { MarketIdentifier } from "../managers/MultiPreMarketManager";
import React from "react";
import {
  BasePreMarket,
  CreateOfferParams,
  MatchOfferParams,
  OfferData,
  OrderData,
  MarketConfig as BaseMarketConfig,
  TransactionCallbacks,
  TransactionResult,
} from "../base/BasePreMarket";
import { Transaction } from "@solana/web3.js";
import { TokenInfo } from "../base/BaseToken";
import { TokenIdentifier } from "../managers/MultiTokenManager";

/**
 * Market configuration for provider
 */
export interface MarketConfig {
  id: string;
  type: "evm" | "solana";
  rpc: string;
  contractAddress: string; // For EVM this is contract address, for Solana this is program ID
  configAccountPubKey?: string; // Only for Solana
}

/**
 * Context value for WhalesPreMarketProvider
 */
export interface WhalesPreMarketContextValue {
  markets: MarketIdentifier[];
  tokens: TokenIdentifier[];
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;

  // Market functions
  getMarket: (
    id: string
  ) => BasePreMarket<ethers.PopulatedTransaction | Transaction>;
  createOffer: (
    marketId: string,
    params: CreateOfferParams
  ) => Promise<ethers.PopulatedTransaction | Transaction>;
  matchOffer: (
    marketId: string,
    params: MatchOfferParams
  ) => Promise<ethers.PopulatedTransaction | Transaction>;
  fillOffer: (
    marketId: string,
    offerId: number,
    amount: number
  ) => Promise<ethers.PopulatedTransaction | Transaction>;
  cancelOffer: (
    marketId: string,
    offerId: number
  ) => Promise<ethers.PopulatedTransaction | Transaction>;
  settleOrder: (
    marketId: string,
    orderId: number
  ) => Promise<ethers.PopulatedTransaction | Transaction>;
  getOffer: (marketId: string, offerId: number) => Promise<OfferData>;
  getOrder: (marketId: string, orderId: number) => Promise<OrderData>;
  getLastOfferId: (marketId: string) => Promise<number>;
  getLastOrderId: (marketId: string) => Promise<number>;
  isAcceptedToken: (marketId: string, token: string) => Promise<boolean>;
  getConfig: (marketId: string) => Promise<BaseMarketConfig>;
  // Token functions
  getDecimals: (tokenId: string, tokenAddress: string) => Promise<number>;
  getName: (tokenId: string, tokenAddress: string) => Promise<string>;
  getSymbol: (tokenId: string, tokenAddress: string) => Promise<string>;
  getUri: (tokenId: string, tokenAddress: string) => Promise<string>;
  getBalance: (
    tokenId: string,
    owner: string,
    tokenAddress: string
  ) => Promise<number>;
  getAllowance: (
    tokenId: string,
    owner: string,
    tokenAddress: string,
    spender: string
  ) => Promise<number>;
  approve: (
    tokenId: string,
    tokenAddress: string,
    spender: string,
    amount: number | string
  ) => Promise<ethers.PopulatedTransaction | Transaction>;

  getTokenInfo: (tokenId: string, tokenAddress: string) => Promise<TokenInfo>;
  updateTokenProvider: (
    tokenId: string,
    provider: Connection | ethers.providers.Provider
  ) => void;
  executeBatch: <T>(
    operations: Array<{
      tokenId: string;
      operation: (token: any) => Promise<T>;
    }>
  ) => Promise<T[]>;
}

/**
 * Props for WhalesPreMarketProvider
 */
export interface WhalesPreMarketProviderProps {
  markets: MarketConfig[];
  children: React.ReactNode;
}

/**
 * Return type for useWhalesPreMarket hook
 */
export interface UseWhalesPreMarketReturn extends WhalesPreMarketContextValue {}
