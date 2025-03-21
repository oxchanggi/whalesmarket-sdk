/**
 * Abstract base class for Token implementations
 * This class provides common functionality and interfaces for both Solana and EVM token implementations
 * @template P The provider type (Solana Connection or ethers.Provider)
 * @template T The transaction type (Solana Transaction or ethers.PopulatedTransaction)
 */

/**
 * Interface for token information
 */
export interface TokenInfo {
  decimals?: number;
  name?: string;
  symbol?: string;
  uri?: string;
}

export abstract class BaseToken<P, T = any> {
  /**
   * The provider instance
   * @protected
   */
  protected _provider: P;

  /**
   * Cache for token information
   * @protected
   */
  protected _tokenInfoCache: Map<string, TokenInfo> = new Map();

  /**
   * Constructor for BaseToken
   * @param provider The provider instance
   */
  constructor(provider: P) {
    this._provider = provider;
  }

  /**
   * Set the provider for this Token instance
   * @param provider The provider to use
   */
  setProvider(provider: P): void {
    this._provider = provider;
  }

  /**
   * Get the current provider
   * @returns The current provider
   */
  getProvider(): P {
    return this._provider;
  }

  /**
   * Get the number of decimals for the token
   * @param address The token address or mint
   * @returns The number of decimals
   */
  async getDecimals(address: string): Promise<number> {
    // Check if the value is in cache
    const tokenInfo = this._tokenInfoCache.get(address);
    if (tokenInfo?.decimals !== undefined) {
      return tokenInfo.decimals;
    }

    // If not in cache, fetch and store it
    const decimals = await this._fetchDecimals(address);
    this._updateTokenInfo(address, { decimals });
    return decimals;
  }

  /**
   * Fetch the number of decimals for the token (to be implemented by subclasses)
   * @param address The token address or mint
   * @returns The number of decimals
   * @protected
   */
  protected abstract _fetchDecimals(address: string): Promise<number>;

  /**
   * Get the name of the token
   * @param address The token address or mint
   * @returns The token name
   */
  async getName(address: string): Promise<string> {
    // Check if the value is in cache
    const tokenInfo = this._tokenInfoCache.get(address);
    if (tokenInfo?.name !== undefined) {
      return tokenInfo.name;
    }

    // If not in cache, fetch and store it
    const name = await this._fetchName(address);
    this._updateTokenInfo(address, { name });
    return name;
  }

  /**
   * Fetch the name of the token (to be implemented by subclasses)
   * @param address The token address or mint
   * @returns The token name
   * @protected
   */
  protected abstract _fetchName(address: string): Promise<string>;

  /**
   * Get the symbol of the token
   * @param address The token address or mint
   * @returns The token symbol
   */
  async getSymbol(address: string): Promise<string> {
    // Check if the value is in cache
    const tokenInfo = this._tokenInfoCache.get(address);
    if (tokenInfo?.symbol !== undefined) {
      return tokenInfo.symbol;
    }

    // If not in cache, fetch and store it
    const symbol = await this._fetchSymbol(address);
    this._updateTokenInfo(address, { symbol });
    return symbol;
  }

  /**
   * Fetch the symbol of the token (to be implemented by subclasses)
   * @param address The token address or mint
   * @returns The token symbol
   * @protected
   */
  protected abstract _fetchSymbol(address: string): Promise<string>;

  /**
   * Get the URI for the token metadata
   * @param address The token address or mint
   * @returns The token URI
   */
  async getUri(address: string): Promise<string> {
    // Check if the value is in cache
    const tokenInfo = this._tokenInfoCache.get(address);
    if (tokenInfo?.uri !== undefined) {
      return tokenInfo.uri;
    }

    // If not in cache, fetch and store it
    const uri = await this._fetchUri(address);
    this._updateTokenInfo(address, { uri });
    return uri;
  }

  /**
   * Update token information in the cache
   * @param address The token address or mint
   * @param info The token information to update
   * @private
   */
  private _updateTokenInfo(address: string, info: Partial<TokenInfo>): void {
    const existingInfo = this._tokenInfoCache.get(address) || {};
    this._tokenInfoCache.set(address, { ...existingInfo, ...info });
  }

  /**
   * Fetch the URI for the token metadata (to be implemented by subclasses)
   * @param address The token address or mint
   * @returns The token URI
   * @protected
   */
  protected abstract _fetchUri(address: string): Promise<string>;

  /**
   * Parse a token amount from human-readable to raw format
   * @param address The token address or mint
   * @param amount The amount to parse
   * @returns The parsed amount
   */
  abstract parseAmount(address: string, amount: number | string): Promise<any>;

  /**
   * Format a raw token amount to human-readable format
   * @param address The token address or mint
   * @param amount The raw amount to format
   * @returns The formatted amount
   */
  abstract formatAmount(address: string, amount: any): Promise<string>;

  /**
   * Get the token balance for a specific owner
   * @param owner The address of the token owner
   * @param tokenAddress The token address or mint
   * @returns The token balance as a number
   */
  abstract getBalance(owner: string, tokenAddress: string): Promise<number>;

  /**
   * Get the allowance amount that a spender is allowed to use on behalf of an owner
   * @param owner The address of the token owner
   * @param tokenAddress The token address or mint
   * @param spender The address of the spender
   * @returns The allowance amount as a number
   */
  abstract getAllowance(
    owner: string,
    tokenAddress: string,
    spender: string
  ): Promise<number>;

  /**
   * Approve a spender to spend tokens on behalf of the owner
   * @param tokenAddress The token address or mint
   * @param spender The address of the spender
   * @param amount The amount to approve
   * @returns A populated transaction that can be signed and sent
   */
  abstract approve(
    tokenAddress: string,
    spender: string,
    amount: number | string
  ): Promise<T>;
}
