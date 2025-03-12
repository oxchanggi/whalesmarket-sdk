"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WhalesPreMarketProvider } from "whales-sdk";
import { http, createConfig, WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";

const queryClient = new QueryClient();

const inter = Inter({ subsets: ["latin"] });

export const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

// export const metadata: Metadata = {
//   title: "Whales PreMarket Example",
//   description: "Example Next.js app using whales-sdk",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Configure Solana wallet
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  // Configure Whales PreMarket
  const markets = [
    // {
    //   id: "solana-market-1",
    //   type: "solana" as const,
    //   rpc: endpoint,
    //   contractAddress: "YOUR_PROGRAM_ID",
    //   configAccountPubKey: "OPTIONAL_CONFIG_ACCOUNT",
    // },
    {
      id: "evm-market-1",
      type: "evm" as const,
      rpc: "https://ethereum-sepolia.rpc.subquery.network/public",
      contractAddress: "0x2C7221dE6a85e72669e87E1CeB5Ac5d4b3c1A8DE",
    },
  ];

  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={wallets} autoConnect>
                <WhalesPreMarketProvider markets={markets}>
                  <main className="container">{children}</main>
                </WhalesPreMarketProvider>
              </WalletProvider>
            </ConnectionProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
