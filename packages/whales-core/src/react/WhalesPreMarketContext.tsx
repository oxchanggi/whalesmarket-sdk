"use client";

import React, { createContext, useContext } from "react";
import { WhalesPreMarketContextValue } from "./types";

// Create context with default values
export const WhalesPreMarketContext = createContext<WhalesPreMarketContextValue>({
  markets: [],
  tokens: [],
  isInitialized: false,
  isLoading: false,
  error: null,
  getMarket: () => {
    throw new Error("WhalesPreMarketProvider not initialized");
  },
  createOffer: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  matchOffer: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  fillOffer: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  cancelOffer: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  settleOrder: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  getOffer: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  getOrder: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  getLastOfferId: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  getLastOrderId: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  isAcceptedToken: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  getConfig: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  // Token functions
  getDecimals: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  getName: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  getSymbol: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  getUri: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  getBalance: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  getAllowance: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  approve: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  getTokenInfo: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
  updateTokenProvider: () => {
    throw new Error("WhalesPreMarketProvider not initialized");
  },
  executeBatch: () =>
    Promise.reject(new Error("WhalesPreMarketProvider not initialized")),
});

export default WhalesPreMarketContext;
