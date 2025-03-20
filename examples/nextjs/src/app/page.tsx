"use client";

import { useWhalesPreMarket, signAndSendTransaction } from "@whalesmarket/sdk";
import { useState, useEffect } from "react";
import { ConnectWallet } from "../components/ConnectWallet";
import { ethers } from "ethers";
import { useWalletClient } from "wagmi";

// Định nghĩa các interface cần thiết nếu không được export từ thư viện
interface TransactionStatus {
  status: boolean | null;
  confirmations: number;
  isCompleted: boolean;
  attempts: number;
  txHash: string;
}

interface TransactionCallbacks {
  onSubmit?: (txHash: string) => void | Promise<void>;
  onFinally?: (status: TransactionStatus) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
}

// Define data type for market
interface Market {
  id: string;
  chain: string;
}
const marketId = "evm-market-1";

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
  const { data: walletClient } = useWalletClient();

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
            const id = await getLastOfferId(marketId);
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
    const market = getMarket(marketId);
    console.log("Market:", market);

    try {
      const params = {
        offerType: 0, // Buy offer
        tokenId:
          "0x3439333600000000000000000000000000000000000000000000000000000000",
        amount: 10,
        value: 0.0001,
        exToken: "0x0000000000000000000000000000000000000000",
        fullMatch: false,
      };

      const transaction = (await createOffer(
        marketId,
        params
      )) as ethers.PopulatedTransaction;
      console.log("Offer created:", transaction);

      transaction.gasLimit = ethers.BigNumber.from(250000);

      // Define callbacks for transaction events
      const callbacks: TransactionCallbacks = {
        onSubmit: (txHash: string) => {
          console.log("Transaction sent:", txHash);
        },
        onFinally: (status: TransactionStatus) => {
          console.log("Transaction success:", status.txHash);
        },
        onError: (error: Error) => {
          console.error("Error when sending transaction:", error);
        },
      };

      const provider = new ethers.providers.Web3Provider(
        walletClient?.transport as any
      );

      const signer = provider.getSigner();
    } catch (error) {
      console.error("Error when creating offer:", error);
    }
  };

  return (
    <div>
      <header className="app-header">
        <h1>Whales PreMarket Example</h1>
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
