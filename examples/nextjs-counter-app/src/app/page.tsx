"use client";

import { useWhalesPreMarket } from "whales-sdk";
import { useState, useEffect } from "react";

// Định nghĩa kiểu dữ liệu cho market
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
      setMarketStatus("Đang tải thị trường...");
    } else if (error) {
      setMarketStatus(`Lỗi: ${error.message}`);
    } else if (isInitialized) {
      setMarketStatus(`Đã khởi tạo ${markets.length} thị trường`);

      // Lấy ID của offer cuối cùng từ thị trường Solana
      const fetchLastOfferId = async () => {
        try {
          if (markets.length > 0) {
            const id = await getLastOfferId("solana-market-1");
            setLastOfferId(id);
          }
        } catch (err) {
          console.error("Lỗi khi lấy ID offer cuối cùng:", err);
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
      console.log("Đã tạo offer:", transaction);
    } catch (error) {
      console.error("Lỗi khi tạo offer:", error);
    }
  };

  return (
    <div>
      <h1>Whales PreMarket Example</h1>
      <p>
        Đây là ví dụ về việc sử dụng WhalesPreMarketProvider và
        useWhalesPreMarket hook từ thư viện whales-sdk trong ứng dụng Next.js.
      </p>

      <div className="market-container">
        <h2>Trạng thái thị trường</h2>
        <p>{marketStatus}</p>

        {isInitialized && (
          <>
            <p>Danh sách thị trường:</p>
            <ul>
              {markets.map((market: Market) => (
                <li key={market.id}>
                  {market.id} ({market.chain})
                </li>
              ))}
            </ul>

            {lastOfferId !== null && <p>ID offer cuối cùng: {lastOfferId}</p>}

            <button onClick={handleCreateOffer}>Tạo offer mới</button>
          </>
        )}
      </div>
    </div>
  );
}
