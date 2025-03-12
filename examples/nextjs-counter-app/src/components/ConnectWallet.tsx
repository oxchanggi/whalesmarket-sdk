"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState } from "react";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (isConnected) {
    return (
      <div className="wallet-container">
        <button className="wallet-button connected" onClick={toggleDropdown}>
          {formatAddress(address || "")}
        </button>

        {isDropdownOpen && (
          <div className="wallet-dropdown">
            <button
              className="disconnect-button"
              onClick={() => {
                disconnect();
                setIsDropdownOpen(false);
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <button
        className="wallet-button"
        onClick={toggleDropdown}
        disabled={isPending}
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>

      {isDropdownOpen && (
        <div className="wallet-dropdown">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              className="connector-button"
              onClick={() => {
                connect({ connector });
                setIsDropdownOpen(false);
              }}
              disabled={isPending}
            >
              {connector.name}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .wallet-container {
          position: relative;
          display: inline-block;
        }

        .wallet-button {
          background-color: #3b82f6;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .wallet-button:hover {
          background-color: #2563eb;
        }

        .wallet-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .wallet-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          z-index: 10;
          min-width: 180px;
        }

        .connector-button {
          width: 100%;
          text-align: left;
          padding: 10px 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: #1f2937;
          font-weight: 500;
        }

        .connector-button:hover {
          background-color: #f3f4f6;
        }

        .connector-button:disabled {
          color: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
