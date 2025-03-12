import { ethers } from "ethers";
import { BaseToken } from "./BaseToken";

/**
 * EVM Token implementation
 * Provides functionality for interacting with ERC20 tokens on EVM chains
 */
export class TokenEVM extends BaseToken<
  ethers.providers.Provider,
  ethers.PopulatedTransaction
> {
  /**
   * Constructor for TokenEVM
   * @param provider The ethers provider
   */
  constructor(provider: ethers.providers.Provider) {
    super(provider);
  }

  /**
   * Create a token contract instance with minimal ABI
   * @private
   * @param address The token address
   * @returns The contract instance
   */
  private _createContract(address: string): ethers.Contract {
    return new ethers.Contract(
      address,
      [
        "function decimals() view returns (uint8)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function tokenURI(uint256) view returns (string)",
        "function uri(uint256) view returns (string)",
        "function balanceOf(address owner) view returns (uint256)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
      ],
      this._provider
    );
  }

  /**
   * Convert a BigNumber to a number with proper decimal handling
   * @private
   * @param amount The BigNumber amount
   * @param decimals The number of decimals
   * @returns The converted number
   */
  private async _convertBigNumberToNumber(
    amount: ethers.BigNumber,
    decimals: number
  ): Promise<number> {
    // Use formatUnits to convert to string with proper decimal places
    const formattedAmount = ethers.utils.formatUnits(amount, decimals);
    // Convert string to number
    return parseFloat(formattedAmount);
  }

  /**
   * Fetch the number of decimals for the token (implementation for BaseToken)
   * @param address The token address
   * @returns The number of decimals
   * @protected
   */
  protected async _fetchDecimals(address: string): Promise<number> {
    // Handle ETH case
    if (address === ethers.constants.AddressZero) {
      return 18; // ETH has 18 decimals
    }

    try {
      // Get token decimals
      const contract = this._createContract(address);
      const decimals = await contract.decimals();
      return decimals;
    } catch (error) {
      console.error(`Error getting decimals for token ${address}:`, error);
      return 18; // Default to 18 decimals if there's an error
    }
  }

  /**
   * Fetch the name of the token (implementation for BaseToken)
   * @param address The token address
   * @returns The token name
   * @protected
   */
  protected async _fetchName(address: string): Promise<string> {
    // Handle ETH case
    if (address === ethers.constants.AddressZero) {
      return "Ethereum";
    }

    try {
      // Get token name
      const contract = this._createContract(address);
      const name = await contract.name();
      return name;
    } catch (error) {
      console.error(`Error getting name for token ${address}:`, error);
      return "Unknown Token";
    }
  }

  /**
   * Fetch the symbol of the token (implementation for BaseToken)
   * @param address The token address
   * @returns The token symbol
   * @protected
   */
  protected async _fetchSymbol(address: string): Promise<string> {
    // Handle ETH case
    if (address === ethers.constants.AddressZero) {
      return "ETH";
    }

    try {
      // Get token symbol
      const contract = this._createContract(address);
      const symbol = await contract.symbol();
      return symbol;
    } catch (error) {
      console.error(`Error getting symbol for token ${address}:`, error);
      return "UNKNOWN";
    }
  }

  /**
   * Fetch the URI for the token metadata (implementation for BaseToken)
   * @param address The token address
   * @returns The token URI
   * @protected
   */
  protected async _fetchUri(address: string): Promise<string> {
    // Handle ETH case
    if (address === ethers.constants.AddressZero) {
      return "";
    }

    try {
      const contract = this._createContract(address);
      // Try tokenURI first (ERC721)
      try {
        const uri = await contract.tokenURI(0);
        return uri;
      } catch {
        // Try uri next (ERC1155)
        try {
          const uri = await contract.uri(0);
          return uri;
        } catch {
          // Neither method available
          return "";
        }
      }
    } catch (error) {
      console.error(`Error getting URI for token ${address}:`, error);
      return "";
    }
  }

  /**
   * Parse a token amount from human-readable to raw format
   * @param address The token address
   * @param amount The amount to parse
   * @returns The parsed amount as BigNumber
   */
  async parseAmount(
    address: string,
    amount: number | string
  ): Promise<ethers.BigNumber> {
    const decimals = await this.getDecimals(address);
    return ethers.utils.parseUnits(amount.toString(), decimals);
  }

  /**
   * Format a raw token amount to human-readable format
   * @param address The token address
   * @param amount The raw amount to format as BigNumber
   * @returns The formatted amount
   */
  async formatAmount(
    address: string,
    amount: ethers.BigNumber
  ): Promise<string> {
    const decimals = await this.getDecimals(address);
    return ethers.utils.formatUnits(amount, decimals);
  }

  /**
   * Get the token balance for a specific owner
   * @param owner The address of the token owner
   * @param tokenAddress The token address
   * @returns The token balance as a number
   */
  async getBalance(owner: string, tokenAddress: string): Promise<number> {
    try {
      // Handle ETH case
      if (tokenAddress === ethers.constants.AddressZero) {
        const balanceBN = await this._provider.getBalance(owner);
        return this._convertBigNumberToNumber(balanceBN, 18); // ETH has 18 decimals
      }

      const contract = this._createContract(tokenAddress);
      const balanceBN = await contract.balanceOf(owner);
      const decimals = await this.getDecimals(tokenAddress);

      return this._convertBigNumberToNumber(balanceBN, decimals);
    } catch (error) {
      console.error(`Error getting balance for token ${tokenAddress}:`, error);
      return 0;
    }
  }

  /**
   * Get the allowance amount that a spender is allowed to use on behalf of an owner
   * @param owner The address of the token owner
   * @param tokenAddress The token address
   * @param spender The address of the spender
   * @returns The allowance amount as a number
   */
  async getAllowance(
    owner: string,
    tokenAddress: string,
    spender: string
  ): Promise<number> {
    // Handle ETH case - ETH doesn't have allowances
    if (tokenAddress === ethers.constants.AddressZero) {
      return 0;
    }

    try {
      const contract = this._createContract(tokenAddress);
      const allowanceBN = await contract.allowance(owner, spender);
      const decimals = await this.getDecimals(tokenAddress);

      return this._convertBigNumberToNumber(allowanceBN, decimals);
    } catch (error) {
      console.error(
        `Error getting allowance for token ${tokenAddress}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Approve a spender to spend tokens on behalf of the owner
   * @param tokenAddress The token address
   * @param spender The address of the spender
   * @param amount The amount to approve
   * @returns A populated transaction that can be signed and sent
   */
  async approve(
    tokenAddress: string,
    spender: string,
    amount: number | string
  ): Promise<ethers.PopulatedTransaction> {
    // Handle ETH case - ETH doesn't support approvals
    if (tokenAddress === ethers.constants.AddressZero) {
      throw new Error("Cannot approve ETH (native currency)");
    }

    try {
      const contract = this._createContract(tokenAddress);
      const amountBN = await this.parseAmount(tokenAddress, amount);

      // Return populated transaction
      return contract.populateTransaction.approve(spender, amountBN);
    } catch (error) {
      console.error(
        `Error creating approve transaction for token ${tokenAddress}:`,
        error
      );
      throw error;
    }
  }
}
