"use client";

import { useWhalesPreMarket } from "whales-sdk";
import { useState, useEffect } from "react";
import { ConnectWallet } from "../components/ConnectWallet";

// Define data type for market
interface Market {
  id: string;
  chain: string;
}

export default function Home() {
  const {
    markets,
    isInitialized,
    isLoading,
    error,
    getMarket,
    createOffer,
    getOffer,
    getLastOfferId,
  } = useWhalesPreMarket();

  const [marketStatus, setMarketStatus] = useState<string>("Loading...");
  const [lastOfferId, setLastOfferId] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      setMarketStatus("Loading markets...");
    } else if (error) {
      setMarketStatus(`Error: ${error.message}`);
    } else if (isInitialized) {
      setMarketStatus(`Initialized ${markets.length} markets`);

      // Get the ID of the last offer from Solana market
      const fetchLastOfferId = async () => {
        try {
          if (markets.length > 0) {
            const id = await getLastOfferId("solana-market-1");
            setLastOfferId(id);
          }
        } catch (err) {
          console.error("Error when getting last offer ID:", err);
        }
      };

      fetchLastOfferId();
    }
  }, [isLoading, error, isInitialized, markets, getLastOfferId]);

  const handleCreateOffer = async () => {
    try {
      const params = {
        offerType: 0, // Buy offer
        tokenId: "token-123",
        amount: 10,
        value: 100,
        exToken: "0xTokenAddress",
        fullMatch: false,
      };

      const transaction = await createOffer("solana-market-1", params);
      console.log("Offer created:", transaction);
    } catch (error) {
      console.error("Error when creating offer:", error);
    }
  };

  return (
    <div>
      <header className="app-header">
        <h1>Whales PreMarket Example</h1>
        <ConnectWallet />
      </header>

      <p>
        This is an example of using WhalesPreMarketProvider and
        useWhalesPreMarket hook from the whales-sdk library in a Next.js
        application.
      </p>

      <div className="market-container">
        <h2>Market Status</h2>
        <p>{marketStatus}</p>

        {isInitialized && (
          <>
            <p>Market list:</p>
            <ul>
              {markets.map((market: Market) => (
                <li key={market.id}>
                  {market.id} ({market.chain})
                </li>
              ))}
            </ul>

            {lastOfferId !== null && <p>Last offer ID: {lastOfferId}</p>}

            <button onClick={handleCreateOffer}>Create new offer</button>
          </>
        )}
      </div>
    </div>
  );
}
