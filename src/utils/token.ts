import { ethers } from "ethers";

/**
 * Get the number of decimals for a token
 * @param tokenAddress The address of the token
 * @param provider The ethers provider
 * @returns The number of decimals for the token
 */
export async function getTokenDecimals(
  tokenAddress: string,
  provider: ethers.providers.Provider
): Promise<number> {
  // Handle ETH case
  if (tokenAddress === ethers.constants.AddressZero) {
    return 18; // ETH has 18 decimals
  }

  // Create token contract instance with minimal ABI
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ["function decimals() view returns (uint8)"],
    provider
  );

  try {
    // Get token decimals
    const decimals = await tokenContract.decimals();
    return decimals;
  } catch (error) {
    console.error(`Error getting decimals for token ${tokenAddress}:`, error);
    return 18; // Default to 18 decimals if there's an error
  }
}

/**
 * Convert a number to a BigNumber with the correct number of decimals
 * @param value The value to convert
 * @param decimals The number of decimals
 * @returns The value as a BigNumber
 */
export function parseTokenAmount(
  value: number | string,
  decimals: number
): ethers.BigNumber {
  return ethers.utils.parseUnits(value.toString(), decimals);
}
