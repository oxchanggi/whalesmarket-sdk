export * from "@whalesmarket/core";
export * from "./PreMarketSolanaMobile";
export * from "./adapters/AnchorAdapter";
export * from "./adapters/ApiAnchorAdapter";
export { MultiPreMarketManagerMobile } from "./MultiPreMarketManagerMobile";

// Re-export from react with explicit naming to avoid conflicts
export { WhalesPreMarketProvider as MobileWhalesPreMarketProvider } from "./react";
export type { WhalesPreMarketProviderMobileProps } from "./react";

// Thêm các hàm helper dưới đây để đảm bảo bundle không trống
export const MOBILE_SDK_VERSION = "0.1.3";

export const getMobileSDKInfo = () => {
  return {
    version: MOBILE_SDK_VERSION,
    name: "@whalesmarket/mobile-sdk"
  };
};
