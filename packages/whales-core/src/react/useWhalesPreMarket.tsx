import { useContext } from "react";
import WhalesPreMarketContext from "./WhalesPreMarketContext";
import { UseWhalesPreMarketReturn } from "./types";

/**
 * Hook to access WhalesPreMarket context
 * @returns WhalesPreMarket context value
 */
export const useWhalesPreMarket = (): UseWhalesPreMarketReturn => {
  const context = useContext(WhalesPreMarketContext);

  if (!context) {
    throw new Error(
      "useWhalesPreMarket must be used within a WhalesPreMarketProvider"
    );
  }

  return context;
};
