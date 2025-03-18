"use client";

import React from "react";
import { Transaction } from "@solana/web3.js";
import {
  WhalesPreMarketProvider as BaseWhalesPreMarketProvider,
  WhalesPreMarketProviderProps,
} from "@whalesmarket/core";
import { PreMarketSolanaMobile } from "../PreMarketSolanaMobile";
import { MultiPreMarketManagerMobile } from "../MultiPreMarketManagerMobile";

/**
 * Props for WhalesPreMarketProviderMobile
 * Extends the base WhalesPreMarketProviderProps with mobile-specific properties
 */
export interface WhalesPreMarketProviderMobileProps
  extends WhalesPreMarketProviderProps {
  apiBaseUrl: string;
}

/**
 * WhalesPreMarketProvider for whales-mobile-sdk
 * Extends the base WhalesPreMarketProvider from whales-core
 * Specialized for PreMarketSolanaMobile
 */
export class WhalesPreMarketProvider extends BaseWhalesPreMarketProvider<PreMarketSolanaMobile> {
  private apiBaseUrl: string;

  constructor(props: WhalesPreMarketProviderMobileProps) {
    super(props);

    // Store the API base URL
    this.apiBaseUrl = props.apiBaseUrl;

    // Initialize the MultiPreMarketManagerMobile with the API base URL
    this.manager = new MultiPreMarketManagerMobile(this.apiBaseUrl);
  }

  /**
   * Custom initialization for Solana Mobile markets
   * This method is called by the base class during initialization
   * @param market Market configuration
   */
  protected async customizeMarketInitialization(market: any): Promise<void> {
    // Additional initialization specific to Solana Mobile markets if needed
    // For example, setting up mobile-specific configurations or event listeners

    // This is a placeholder for any custom initialization logic
    // If no custom initialization is needed, this method can be left empty
    console.log(
      `Initialized Solana Mobile market: ${market.id} with API: ${this.apiBaseUrl}`
    );
  }
}

export default WhalesPreMarketProvider;
