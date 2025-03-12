import { Connection } from "@solana/web3.js";
import { ethers } from "ethers";
import { MarketIdentifier } from "../MultiPreMarketManager";
import React from "react";
import {
  BasePreMarket,
  CreateOfferParams,
  OfferData,
  OrderData,
  MarketConfig as BaseMarketConfig,
  TransactionCallbacks,
  TransactionResult,
} from "../BasePreMarket";
import { Transaction } from "@solana/web3.js";

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
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  getMarket: (
    id: string
  ) => BasePreMarket<ethers.PopulatedTransaction | Transaction>;
  createOffer: (
    marketId: string,
    params: CreateOfferParams
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
  signAndSendTransaction: (
    marketId: string,
    tx: ethers.PopulatedTransaction | Transaction,
    callbacks?: TransactionCallbacks
  ) => Promise<TransactionResult>;
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
