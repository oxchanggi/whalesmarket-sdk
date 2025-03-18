export * from "@whalesmarket/core";
export * from "./PreMarketSolana";
export { MultiPreMarketManager } from "./MultiPreMarketManager";
export { WhalesPreMarketProvider as SdkWhalesPreMarketProvider } from "./react";

// Thêm các hàm helper dưới đây để đảm bảo bundle không trống
export const SDK_VERSION = "0.1.6";

export const getSDKInfo = () => {
  return {
    version: SDK_VERSION,
    name: "@whalesmarket/sdk"
  };
};
