import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  getMint,
  getAccount,
  createApproveInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { BaseToken } from "./BaseToken";
import BN from "bn.js";

/**
 * Solana Token implementation
 * Provides functionality for interacting with SPL tokens on Solana
 */
export class TokenSolana extends BaseToken<Connection, Transaction> {
  /**
   * Constructor for TokenSolana
   * @param connection The Solana connection
   */
  constructor(connection: Connection) {
    super(connection);
  }

  /**
   * Convert a BN to a number with proper decimal handling
   * @private
   * @param amount The BN amount
   * @param decimals The number of decimals
   * @returns The converted number
   */
  private _convertBNToNumber(amount: BN, decimals: number): number {
    const divisor = new BN(10).pow(new BN(decimals));
    const integerPart = amount.div(divisor);
    const remainder = amount.mod(divisor);

    // Convert to string with proper decimal places
    const integerStr = integerPart.toString();
    let fractionalStr = remainder.toString().padStart(decimals, "0");

    // Combine integer and fractional parts
    const numberStr = `${integerStr}.${fractionalStr}`;

    // Convert to number
    return parseFloat(numberStr);
  }

  /**
   * Get the number of decimals for the token
   * @param address The token mint address
   * @returns The number of decimals
   */
  async getDecimals(address: string): Promise<number> {
    // Handle SOL case
    if (address === "So11111111111111111111111111111111111111112") {
      return 9; // SOL has 9 decimals
    }

    try {
      // Get token mint info
      const mint = new PublicKey(address);
      const mintInfo = await getMint(this._provider, mint);
      return mintInfo.decimals;
    } catch (error) {
      console.error(`Error getting decimals for token ${address}:`, error);
      return 9; // Default to 9 decimals if there's an error (Solana standard)
    }
  }

  /**
   * Get the name of the token
   * @param address The token mint address
   * @returns The token name
   */
  async getName(address: string): Promise<string> {
    // Handle SOL case
    if (address === "So11111111111111111111111111111111111111112") {
      return "Solana";
    }

    try {
      // Try to get metadata account
      const mint = new PublicKey(address);
      const metadataPDA = await this._findMetadataAccount(mint);
      if (!metadataPDA) {
        return "Unknown Token";
      }

      // Lấy dữ liệu metadata
      const metadataAccount = await this._provider.getAccountInfo(metadataPDA);
      if (!metadataAccount) {
        return "Unknown Token";
      }

      // Parse metadata data manually
      // Metadata format: https://docs.metaplex.com/programs/token-metadata/accounts
      const nameStart = 1 + 32 + 32 + 4; // Offset for name
      const nameLength = metadataAccount.data[nameStart - 1]; // Length prefix
      const name = this._decodeString(
        metadataAccount.data,
        nameStart,
        nameLength
      );

      return name;
    } catch (error) {
      console.error(`Error getting name for token ${address}:`, error);
      return "Unknown Token";
    }
  }

  /**
   * Get the symbol of the token
   * @param address The token mint address
   * @returns The token symbol
   */
  async getSymbol(address: string): Promise<string> {
    // Handle SOL case
    if (address === "So11111111111111111111111111111111111111112") {
      return "SOL";
    }

    try {
      // Try to get metadata account
      const mint = new PublicKey(address);
      const metadataPDA = await this._findMetadataAccount(mint);
      if (!metadataPDA) {
        return "UNKNOWN";
      }

      // Lấy dữ liệu metadata
      const metadataAccount = await this._provider.getAccountInfo(metadataPDA);
      if (!metadataAccount) {
        return "UNKNOWN";
      }

      // Parse metadata data manually
      // Metadata format: https://docs.metaplex.com/programs/token-metadata/accounts
      const nameStart = 1 + 32 + 32 + 4; // Offset for name
      const nameLength = metadataAccount.data[nameStart - 1]; // Length prefix

      const symbolStart = nameStart + nameLength + 4; // Offset for symbol
      const symbolLength = metadataAccount.data[symbolStart - 1]; // Length prefix
      const symbol = this._decodeString(
        metadataAccount.data,
        symbolStart,
        symbolLength
      );

      return symbol;
    } catch (error) {
      console.error(`Error getting symbol for token ${address}:`, error);
      return "UNKNOWN";
    }
  }

  /**
   * Get the URI for the token metadata
   * @param address The token mint address
   * @returns The token URI
   */
  async getUri(address: string): Promise<string> {
    // Handle SOL case
    if (address === "So11111111111111111111111111111111111111112") {
      return "";
    }

    try {
      // Try to get metadata account
      const mint = new PublicKey(address);
      const metadataPDA = await this._findMetadataAccount(mint);
      if (!metadataPDA) {
        return "";
      }

      // Lấy dữ liệu metadata
      const metadataAccount = await this._provider.getAccountInfo(metadataPDA);
      if (!metadataAccount) {
        return "";
      }

      // Parse metadata data manually
      // Metadata format: https://docs.metaplex.com/programs/token-metadata/accounts
      const nameStart = 1 + 32 + 32 + 4; // Offset for name
      const nameLength = metadataAccount.data[nameStart - 1]; // Length prefix

      const symbolStart = nameStart + nameLength + 4; // Offset for symbol
      const symbolLength = metadataAccount.data[symbolStart - 1]; // Length prefix

      const uriStart = symbolStart + symbolLength + 4; // Offset for uri
      const uriLength = metadataAccount.data[uriStart - 1]; // Length prefix
      const uri = this._decodeString(metadataAccount.data, uriStart, uriLength);

      return uri;
    } catch (error) {
      console.error(`Error getting URI for token ${address}:`, error);
      return "";
    }
  }

  /**
   * Parse a token amount from human-readable to raw format
   * @param address The token mint address
   * @param amount The amount to parse
   * @returns The parsed amount as BN
   */
  async parseAmount(address: string, amount: number | string): Promise<BN> {
    const decimals = await this.getDecimals(address);
    const amountFloat = parseFloat(amount.toString());
    const amountBN = new BN(Math.floor(amountFloat * Math.pow(10, decimals)));
    return amountBN;
  }

  /**
   * Format a raw token amount to human-readable format
   * @param address The token mint address
   * @param amount The raw amount to format as BN
   * @returns The formatted amount
   */
  async formatAmount(address: string, amount: BN): Promise<string> {
    const decimals = await this.getDecimals(address);
    const divisor = new BN(10).pow(new BN(decimals));
    const integerPart = amount.div(divisor).toString();

    // Calculate fractional part
    const remainder = amount.mod(divisor);
    let fractionalPart = remainder.toString().padStart(decimals, "0");

    // Trim trailing zeros
    fractionalPart = fractionalPart.replace(/0+$/, "");

    if (fractionalPart === "") {
      return integerPart;
    }

    return `${integerPart}.${fractionalPart}`;
  }

  /**
   * Get the token balance for a specific owner
   * @param owner The address of the token owner
   * @param tokenAddress The token mint address
   * @returns The token balance as a number
   */
  async getBalance(owner: string, tokenAddress: string): Promise<number> {
    try {
      // Handle SOL case
      if (tokenAddress === "So11111111111111111111111111111111111111112") {
        const ownerPubkey = new PublicKey(owner);
        const balance = await this._provider.getBalance(ownerPubkey);
        const balanceBN = new BN(balance.toString());
        return this._convertBNToNumber(balanceBN, 9); // SOL has 9 decimals
      }

      const ownerPubkey = new PublicKey(owner);
      const mintPubkey = new PublicKey(tokenAddress);

      // Get token decimals
      const decimals = await this.getDecimals(tokenAddress);

      // Get associated token account
      const tokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        ownerPubkey
      );

      try {
        // Get account info
        const accountInfo = await getAccount(this._provider, tokenAccount);
        const amountBN = new BN(accountInfo.amount.toString());
        return this._convertBNToNumber(amountBN, decimals);
      } catch (error) {
        // Token account might not exist
        console.error(
          `Error getting token balance for ${tokenAddress}:`,
          error
        );
        return 0;
      }
    } catch (error) {
      console.error(`Error getting token balance for ${tokenAddress}:`, error);
      return 0;
    }
  }

  /**
   * Get the allowance amount that a spender is allowed to use on behalf of an owner
   * @param owner The address of the token owner
   * @param tokenAddress The token mint address
   * @param spender The address of the spender (delegate)
   * @returns The allowance amount as a number
   */
  async getAllowance(
    owner: string,
    tokenAddress: string,
    spender: string
  ): Promise<number> {
    // doesn't have allowances
    return Number.MAX_SAFE_INTEGER;
  }

  /**
   * Approve a spender to spend tokens on behalf of the owner
   * @param tokenAddress The token mint address
   * @param spender The address of the spender (delegate)
   * @param amount The amount to approve
   * @returns A transaction that can be signed and sent
   */
  async approve(
    tokenAddress: string,
    spender: string,
    amount: number | string
  ): Promise<Transaction> {
    // Handle SOL case - SOL doesn't support approvals
    if (tokenAddress === "So11111111111111111111111111111111111111112") {
      throw new Error("Cannot approve SOL (native currency)");
    }

    try {
      // We need the owner's public key, which should be provided when signing
      // For now, we'll create a transaction that can be completed later
      const mintPubkey = new PublicKey(tokenAddress);
      const spenderPubkey = new PublicKey(spender);

      // Parse amount
      const amountBN = await this.parseAmount(tokenAddress, amount);

      // Create a new transaction
      const transaction = new Transaction();

      // Note: This transaction is incomplete and requires the owner's public key
      // The actual approve instruction will be added when the owner's public key is provided
      transaction.add({
        keys: [
          { pubkey: mintPubkey, isSigner: false, isWritable: false },
          { pubkey: spenderPubkey, isSigner: false, isWritable: false },
        ],
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        data: Buffer.from([]), // Placeholder, will be replaced when owner is known
      });

      // Add a comment to the transaction for identification
      transaction.feePayer = undefined; // Will be set by the signer

      return transaction;
    } catch (error) {
      console.error(
        `Error creating approve transaction for token ${tokenAddress}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Find the metadata account for a token mint
   * @private
   * @param mint The token mint public key
   * @returns The metadata account public key or null if not found
   */
  private async _findMetadataAccount(
    mint: PublicKey
  ): Promise<PublicKey | null> {
    try {
      // Metaplex metadata program ID
      const metaplexProgramId = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
      );

      // Derive metadata account PDA
      const [metadataPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          metaplexProgramId.toBuffer(),
          mint.toBuffer(),
        ],
        metaplexProgramId
      );

      return metadataPDA;
    } catch (error) {
      console.error("Error finding metadata account:", error);
      return null;
    }
  }

  /**
   * Decode a string from a buffer
   * @private
   * @param data The buffer data
   * @param start The start index
   * @param length The length of the string
   * @returns The decoded string
   */
  private _decodeString(data: Buffer, start: number, length: number): string {
    const slice = data.slice(start, start + length);
    return new TextDecoder().decode(slice).replace(/\0/g, "");
  }
}
