"use client";

import React from "react";
import { Transaction } from "@solana/web3.js";
import {
  WhalesPreMarketProvider as BaseWhalesPreMarketProvider,
  WhalesPreMarketProviderProps,
} from "@whales/core";
import { PreMarketSolana } from "../PreMarketSolana";
import { MultiPreMarketManager } from "../MultiPreMarketManager";

/**
 * WhalesPreMarketProvider for whales-sdk
 * Extends the base WhalesPreMarketProvider from whales-core
 * Specialized for PreMarketSolana
 */
export class WhalesPreMarketProvider extends BaseWhalesPreMarketProvider<PreMarketSolana> {
  constructor(props: WhalesPreMarketProviderProps) {
    super(props);

    // Initialize the MultiPreMarketManager for Solana
    this.manager = new MultiPreMarketManager();
  }

  /**
   * Custom initialization for Solana markets
   * This method is called by the base class during initialization
   * @param market Market configuration
   */
  protected async customizeMarketInitialization(market: any): Promise<void> {
    // Additional initialization specific to Solana markets if needed
    // For example, setting up event listeners or additional configurations

    // This is a placeholder for any custom initialization logic
    // If no custom initialization is needed, this method can be left empty
    console.log(`Initialized Solana market: ${market.id}`);
  }
}

export default WhalesPreMarketProvider;
