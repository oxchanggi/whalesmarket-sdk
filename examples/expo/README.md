# Whales SDK Expo Example

This is an example of using Whales SDK in a React Native Expo application.

## Prerequisites

- Node.js (v16 or higher)
- pnpm
- Expo CLI

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Start the Expo development server:

```bash
pnpm start
```

3. Use the Expo Go app on your mobile device to scan the QR code, or press 'i' to open in iOS simulator or 'a' to open in Android emulator.

## Features

- Integration with Whales SDK
- Wallet connection using wagmi for Ethereum
- Solana wallet integration
- Market information display
- Create offer functionality (simulated)

## Project Structure

- `App.tsx` - Main application component with providers setup
- `components/` - React Native components
  - `WalletConnectButton.tsx` - Component for connecting wallets
  - `MarketInfo.tsx` - Component for displaying market information

## Notes

- This example is for demonstration purposes and some functionality is simulated
- For a production application, you would need to properly handle wallet connections and transactions in a mobile environment
- The Ethereum wallet integration uses wagmi, which may require additional setup for production use in React Native

## Troubleshooting

If you encounter any issues:

1. Make sure you have the latest version of Expo CLI
2. Check that all dependencies are installed correctly
3. Ensure you have the correct environment variables set up
4. For wallet connection issues, make sure you have a compatible wallet installed on your device

## License

MIT 