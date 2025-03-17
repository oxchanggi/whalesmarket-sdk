import { Connection } from "@solana/web3.js";
import { ethers } from "ethers";
import { BaseToken, TokenInfo } from "../base/BaseToken";
import BN from "bn.js";
import { TokenSolana } from "../tokens/TokenSolana";
import { TokenEVM } from "../tokens/TokenEVM";

/**
 * Interface for token identification
 */
export interface TokenIdentifier {
  id: string;
  chain: "solana" | "evm";
}

/**
 * Class for managing multiple tokens across different chains
 */
export class MultiTokenManager {
  private solanaTokens: Map<string, TokenSolana> = new Map();
  private evmTokens: Map<string, TokenEVM> = new Map();

  /**
   * Add a Solana token manager to the MultiTokenManager
   * @param id Unique identifier for this token manager
   * @param connection Solana connection
   * @returns The added TokenSolana instance
   */
  public addSolanaToken(id: string, connection: Connection): TokenSolana {
    if (this.solanaTokens.has(id) || this.evmTokens.has(id)) {
      throw new Error(`Token manager with ID ${id} already exists`);
    }

    const token = new TokenSolana(connection);
    this.solanaTokens.set(id, token);
    return token;
  }

  /**
   * Add an EVM token manager to the MultiTokenManager
   * @param id Unique identifier for this token manager
   * @param provider Ethers provider
   * @returns The added TokenEVM instance
   */
  public addEVMToken(
    id: string,
    provider: ethers.providers.Provider
  ): TokenEVM {
    if (this.solanaTokens.has(id) || this.evmTokens.has(id)) {
      throw new Error(`Token manager with ID ${id} already exists`);
    }

    const token = new TokenEVM(provider);
    this.evmTokens.set(id, token);
    return token;
  }

  /**
   * Get a token manager by ID
   * @param id The token manager ID
   * @returns The token manager instance
   */
  public getToken(id: string): BaseToken<any> {
    const solanaToken = this.solanaTokens.get(id);
    if (solanaToken) {
      return solanaToken;
    }

    const evmToken = this.evmTokens.get(id);
    if (evmToken) {
      return evmToken;
    }

    throw new Error(`Token manager with ID ${id} not found`);
  }

  /**
   * Get a Solana token manager by ID
   * @param id The token manager ID
   * @returns The TokenSolana instance
   */
  public getSolanaToken(id: string): TokenSolana {
    const token = this.solanaTokens.get(id);
    if (!token) {
      throw new Error(`Solana token manager with ID ${id} not found`);
    }
    return token;
  }

  /**
   * Get an EVM token manager by ID
   * @param id The token manager ID
   * @returns The TokenEVM instance
   */
  public getEVMToken(id: string): TokenEVM {
    const token = this.evmTokens.get(id);
    if (!token) {
      throw new Error(`EVM token manager with ID ${id} not found`);
    }
    return token;
  }

  /**
   * Remove a token manager by ID
   * @param id The token manager ID
   * @returns True if the token manager was removed, false otherwise
   */
  public removeToken(id: string): boolean {
    if (this.solanaTokens.has(id)) {
      return this.solanaTokens.delete(id);
    }

    if (this.evmTokens.has(id)) {
      return this.evmTokens.delete(id);
    }

    return false;
  }

  /**
   * Get all token manager identifiers
   * @returns Array of token manager identifiers
   */
  public getAllTokenIds(): TokenIdentifier[] {
    const tokens: TokenIdentifier[] = [];

    for (const id of this.solanaTokens.keys()) {
      tokens.push({ id, chain: "solana" });
    }

    for (const id of this.evmTokens.keys()) {
      tokens.push({ id, chain: "evm" });
    }

    return tokens;
  }

  /**
   * Get token decimals
   * @param managerId The token manager ID
   * @param tokenAddress The token address or mint
   * @returns The number of decimals
   */
  public async getDecimals(
    managerId: string,
    tokenAddress: string
  ): Promise<number> {
    const token = this.getToken(managerId);
    return token.getDecimals(tokenAddress);
  }

  /**
   * Get token name
   * @param managerId The token manager ID
   * @param tokenAddress The token address or mint
   * @returns The token name
   */
  public async getName(
    managerId: string,
    tokenAddress: string
  ): Promise<string> {
    const token = this.getToken(managerId);
    return token.getName(tokenAddress);
  }

  /**
   * Get token symbol
   * @param managerId The token manager ID
   * @param tokenAddress The token address or mint
   * @returns The token symbol
   */
  public async getSymbol(
    managerId: string,
    tokenAddress: string
  ): Promise<string> {
    const token = this.getToken(managerId);
    return token.getSymbol(tokenAddress);
  }

  /**
   * Get token URI
   * @param managerId The token manager ID
   * @param tokenAddress The token address or mint
   * @returns The token URI
   */
  public async getUri(
    managerId: string,
    tokenAddress: string
  ): Promise<string> {
    const token = this.getToken(managerId);
    return token.getUri(tokenAddress);
  }

  /**
   * Get token balance
   * @param managerId The token manager ID
   * @param owner The address of the token owner
   * @param tokenAddress The token address or mint
   * @returns The token balance as a number
   */
  public async getBalance(
    managerId: string,
    owner: string,
    tokenAddress: string
  ): Promise<number> {
    const token = this.getToken(managerId);
    return token.getBalance(owner, tokenAddress);
  }

  /**
   * Get token allowance
   * @param managerId The token manager ID
   * @param owner The address of the token owner
   * @param tokenAddress The token address or mint
   * @param spender The address of the spender
   * @returns The allowance amount as a number
   */
  public async getAllowance(
    managerId: string,
    owner: string,
    tokenAddress: string,
    spender: string
  ): Promise<number> {
    const token = this.getToken(managerId);
    return token.getAllowance(owner, tokenAddress, spender);
  }

  /**
   * Approve token spending
   * @param managerId The token manager ID
   * @param tokenAddress The token address or mint
   * @param spender The address of the spender
   * @param amount The amount to approve
   * @returns A transaction that can be signed and sent
   */
  public async approve(
    managerId: string,
    tokenAddress: string,
    spender: string,
    amount: number | string
  ): Promise<ethers.PopulatedTransaction> {
    const token = this.getToken(managerId);
    return token.approve(tokenAddress, spender, amount);
  }

  /**
   * Parse a token amount from human-readable to raw format
   * @param managerId The token manager ID
   * @param tokenAddress The token address or mint
   * @param amount The amount to parse
   * @returns The parsed amount (BigNumber for EVM, BN for Solana)
   */
  public async parseAmount(
    managerId: string,
    tokenAddress: string,
    amount: number | string
  ): Promise<ethers.BigNumber | BN> {
    const token = this.getToken(managerId);
    return token.parseAmount(tokenAddress, amount);
  }

  /**
   * Format a raw token amount to human-readable format
   * @param managerId The token manager ID
   * @param tokenAddress The token address or mint
   * @param amount The raw amount to format
   * @returns The formatted amount
   */
  public async formatAmount(
    managerId: string,
    tokenAddress: string,
    amount: ethers.BigNumber | BN
  ): Promise<string> {
    const token = this.getToken(managerId);
    return token.formatAmount(tokenAddress, amount);
  }

  /**
   * Get complete token information
   * @param managerId The token manager ID
   * @param tokenAddress The token address or mint
   * @returns Promise resolving to token information
   */
  public async getTokenInfo(
    managerId: string,
    tokenAddress: string
  ): Promise<TokenInfo> {
    const token = this.getToken(managerId);

    // Fetch all token information in parallel
    const [decimals, name, symbol, uri] = await Promise.all([
      token.getDecimals(tokenAddress),
      token.getName(tokenAddress),
      token.getSymbol(tokenAddress),
      token.getUri(tokenAddress),
    ]);

    return {
      decimals,
      name,
      symbol,
      uri,
    };
  }

  /**
   * Update provider for a token manager
   * @param managerId The token manager ID
   * @param provider The new provider
   */
  public updateProvider(
    managerId: string,
    provider: Connection | ethers.providers.Provider
  ): void {
    const token = this.getToken(managerId);
    token.setProvider(provider);
  }

  /**
   * Execute a batch of operations across multiple token managers
   * @param operations Array of operations to execute
   * @returns Results of the operations
   */
  public async executeBatch<T>(
    operations: Array<{
      managerId: string;
      operation: (token: BaseToken<any>) => Promise<T>;
    }>
  ): Promise<T[]> {
    const results: T[] = [];

    for (const op of operations) {
      const token = this.getToken(op.managerId);
      const result = await op.operation(token);
      results.push(result);
    }

    return results;
  }
}
