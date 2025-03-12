import { Connection } from "@solana/web3.js";
import { ethers } from "ethers";
import { MultiTokenManager } from "../MultiTokenManager";

/**
 * Example demonstrating how to use MultiTokenManager
 */
async function multiTokenExample() {
  // Khởi tạo MultiTokenManager
  const tokenManager = new MultiTokenManager();

  // Thêm token manager cho Solana
  const solanaConnection = new Connection(
    "https://api.mainnet-beta.solana.com"
  );
  const solanaTokenManager = tokenManager.addSolanaToken(
    "solana-main",
    solanaConnection
  );

  // Thêm token manager cho Ethereum
  const ethProvider = new ethers.providers.JsonRpcProvider(
    "https://mainnet.infura.io/v3/YOUR_INFURA_KEY"
  );
  const ethTokenManager = tokenManager.addEVMToken("eth-main", ethProvider);

  // Thêm token manager cho một mạng EVM khác (ví dụ: Polygon)
  const polygonProvider = new ethers.providers.JsonRpcProvider(
    "https://polygon-rpc.com"
  );
  const polygonTokenManager = tokenManager.addEVMToken(
    "polygon-main",
    polygonProvider
  );

  // Lấy thông tin về token trên Solana
  const usdcSolana = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC trên Solana
  try {
    console.log("Lấy thông tin USDC trên Solana:");
    const usdcInfo = await tokenManager.getTokenInfo("solana-main", usdcSolana);
    console.log(usdcInfo);

    // Lấy số dư USDC của một địa chỉ trên Solana
    const solanaWallet = "YourSolanaWalletAddress";
    const solanaBalance = await tokenManager.getBalance(
      "solana-main",
      solanaWallet,
      usdcSolana
    );
    console.log(`Số dư USDC trên Solana: ${solanaBalance}`);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin token Solana:", error);
  }

  // Lấy thông tin về token trên Ethereum
  const usdcEthereum = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC trên Ethereum
  try {
    console.log("\nLấy thông tin USDC trên Ethereum:");
    const usdcInfo = await tokenManager.getTokenInfo("eth-main", usdcEthereum);
    console.log(usdcInfo);

    // Lấy số dư USDC của một địa chỉ trên Ethereum
    const ethWallet = "YourEthereumWalletAddress";
    const ethBalance = await tokenManager.getBalance(
      "eth-main",
      ethWallet,
      usdcEthereum
    );
    console.log(`Số dư USDC trên Ethereum: ${ethBalance}`);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin token Ethereum:", error);
  }

  // Lấy thông tin về token trên Polygon
  const usdcPolygon = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC trên Polygon
  try {
    console.log("\nLấy thông tin USDC trên Polygon:");
    const usdcInfo = await tokenManager.getTokenInfo(
      "polygon-main",
      usdcPolygon
    );
    console.log(usdcInfo);

    // Lấy số dư USDC của một địa chỉ trên Polygon
    const polygonWallet = "YourPolygonWalletAddress";
    const polygonBalance = await tokenManager.getBalance(
      "polygon-main",
      polygonWallet,
      usdcPolygon
    );
    console.log(`Số dư USDC trên Polygon: ${polygonBalance}`);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin token Polygon:", error);
  }

  // Thực hiện các thao tác hàng loạt trên nhiều mạng
  console.log("\nThực hiện các thao tác hàng loạt:");
  try {
    const balances = await tokenManager.executeBatch([
      {
        managerId: "solana-main",
        operation: async (token) => {
          return {
            chain: "solana",
            balance: await token.getBalance(
              "YourSolanaWalletAddress",
              usdcSolana
            ),
          };
        },
      },
      {
        managerId: "eth-main",
        operation: async (token) => {
          return {
            chain: "ethereum",
            balance: await token.getBalance(
              "YourEthereumWalletAddress",
              usdcEthereum
            ),
          };
        },
      },
      {
        managerId: "polygon-main",
        operation: async (token) => {
          return {
            chain: "polygon",
            balance: await token.getBalance(
              "YourPolygonWalletAddress",
              usdcPolygon
            ),
          };
        },
      },
    ]);

    console.log("Kết quả các thao tác hàng loạt:", balances);
  } catch (error) {
    console.error("Lỗi khi thực hiện các thao tác hàng loạt:", error);
  }

  // Tạo giao dịch approve token trên Ethereum
  try {
    console.log("\nTạo giao dịch approve token trên Ethereum:");
    const spender = "0xSpenderContractAddress";
    const amount = "100"; // 100 USDC

    const approveTx = await tokenManager.approve(
      "eth-main",
      usdcEthereum,
      spender,
      amount
    );

    console.log("Giao dịch approve đã được tạo:", approveTx);
    // Giao dịch này cần được ký và gửi bởi người dùng
  } catch (error) {
    console.error("Lỗi khi tạo giao dịch approve:", error);
  }

  // Liệt kê tất cả các token manager
  const allTokenIds = tokenManager.getAllTokenIds();
  console.log("\nDanh sách tất cả các token manager:");
  console.log(allTokenIds);
}

// Chạy ví dụ
multiTokenExample().catch(console.error);
