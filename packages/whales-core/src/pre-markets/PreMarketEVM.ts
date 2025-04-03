import { ethers } from "ethers";
import { PreMarket } from "../types/contracts/PreMarket";
import { PreMarket__factory } from "../types/contracts/factories/PreMarket__factory";
import {
  BasePreMarket,
  OfferData,
  OrderData,
  MarketConfig,
  CreateOfferParams,
  TransactionStatus,
  MatchOfferParams,
} from "../base/BasePreMarket";
import { getTokenDecimals, parseTokenAmount } from "../utils/token";
import { TokenEVM } from "../tokens/TokenEVM";

/**
 * Class for interacting with the PreMarket contract
 */
export class PreMarketEVM extends BasePreMarket<ethers.PopulatedTransaction> {
  private contract: PreMarket;
  // ETH address constant (address(0))
  private readonly ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
  private tokens: TokenEVM;

  /**
   * Create a new instance of the PreMarket contract
   * @param provider Ethers provider
   * @param contractAddress Address of the PreMarket contract
   * @param signerOrProvider Signer or provider to use for transactions
   */
  constructor(
    contractAddress: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    super();
    this.contract = PreMarket__factory.connect(
      contractAddress,
      signerOrProvider
    );
    this.tokens = new TokenEVM(signerOrProvider as ethers.providers.Provider);
  }

  /**
   * Initialize the PreMarket instance
   * @param config Configuration parameters (not needed for EVM implementation)
   */
  async initialize(config: Record<string, unknown>): Promise<void> {
    // No initialization needed for EVM implementation
    return Promise.resolve();
  }

  /**
   * Get the contract instance
   * @returns The PreMarket contract instance
   */
  public getContract(): PreMarket {
    return this.contract;
  }

  /**
   * Get the last offer ID
   * @returns The last offer ID
   */
  public async getLastOfferId(): Promise<number> {
    const result = await this.contract.lastOfferId();
    return result.toNumber();
  }

  /**
   * Get the last order ID
   * @returns The last order ID
   */
  public async getLastOrderId(): Promise<number> {
    const result = await this.contract.lastOrderId();
    return result.toNumber();
  }

  /**
   * Get an offer by ID
   * @param offerId The ID of the offer to retrieve
   * @returns The offer data
   */
  public async getOffer(offerId: number): Promise<OfferData> {
    const offer = await this.contract.offers(offerId);
    const exToken = offer.exToken;
    const exTokenDecimals = await this.tokens.getDecimals(exToken);
    return {
      offerType: offer.offerType,
      tokenId: offer.tokenId,
      exToken: offer.exToken,
      amount: offer.amount.toNumber() / Math.pow(10, 6),
      value: offer.value.toNumber() / Math.pow(10, exTokenDecimals),
      collateral: offer.collateral.toNumber() / Math.pow(10, exTokenDecimals),
      filledAmount: offer.filledAmount.toNumber() / Math.pow(10, 6),
      status: offer.status,
      offeredBy: offer.offeredBy,
      fullMatch: offer.fullMatch,
    };
  }

  /**
   * Get an order by ID
   * @param orderId The ID of the order to retrieve
   * @returns The order data
   */
  public async getOrder(orderId: number): Promise<OrderData> {
    const order = await this.contract.orders(orderId);
    return {
      offerId: order.offerId.toNumber(),
      amount: order.amount.toNumber() / Math.pow(10, 6),
      seller: order.seller,
      buyer: order.buyer,
      status: order.status,
    };
  }

  /**
   * Create a new offer
   * @param params Parameters for creating the offer
   * @returns Transaction of type T
   */
  public async createOffer(
    params: CreateOfferParams
  ): Promise<ethers.PopulatedTransaction> {
    const {
      offerType,
      tokenId,
      amount,
      value,
      exToken = this.ETH_ADDRESS,
      fullMatch = false,
    } = params;

    if (exToken === this.ETH_ADDRESS) {
      return this.buildNewOfferETHTx(
        offerType,
        tokenId,
        amount,
        value,
        fullMatch
      );
    } else {
      return this.buildNewOfferTx(
        offerType,
        tokenId,
        amount,
        value,
        exToken,
        fullMatch
      );
    }
  }

  /**
   * Match multiple offers and create a new offer with the remaining amount
   * @param params Parameters for matching offers
   * @returns Populated transaction
   */
  public async matchOffer(
    params: MatchOfferParams
  ): Promise<ethers.PopulatedTransaction> {
    const {
      offerIds,
      tokenId,
      totalAmount,
      totalValue,
      exToken,
      newOfferFullMatch,
    } = params;
    let offerType = params.offerType;

    // Convert numbers to BigNumber for internal processing
    const offerIdsBN = offerIds.map((id) => ethers.BigNumber.from(id));
    const totalAmountBN = parseTokenAmount(totalAmount, 6);

    // Get token decimals and convert value to BigNumber with token decimals
    let totalValueBN;
    if (exToken.toLowerCase() === this.ETH_ADDRESS.toLowerCase()) {
      totalValueBN = parseTokenAmount(totalValue, 18); // ETH uses 18 decimals
    } else {
      const tokenDecimals = await getTokenDecimals(
        exToken,
        this.contract.provider
      );
      totalValueBN = parseTokenAmount(totalValue, tokenDecimals);
    }

    // Convert offer type to match the contract
    // offerType = 0 -> fill offer buy -> sell
    offerType === 0 ? (offerType = 1) : (offerType = 2);

    let tx: ethers.PopulatedTransaction;
    // Build the transaction
    if (exToken.toLowerCase() === this.ETH_ADDRESS.toLowerCase()) {
      tx = await this.contract.populateTransaction.matchOfferETH(
        offerIdsBN,
        tokenId,
        totalAmountBN,
        offerType,
        newOfferFullMatch
      );
      // For ETH transactions, we need to set the value
      tx.value = totalValueBN;
    } else {
      tx = await this.contract.populateTransaction.matchOffer(
        offerIdsBN,
        tokenId,
        totalAmountBN,
        totalValueBN,
        offerType,
        exToken,
        newOfferFullMatch
      );
    }

    return tx;
  }

  /**
   * Fill an existing offer
   * @param offerId The ID of the offer to fill
   * @param amount The amount to fill
   * @returns Transaction of type T
   */
  public async fillOffer(
    offerId: number,
    amount: number
  ): Promise<ethers.PopulatedTransaction> {
    const offer = await this.getOffer(offerId);

    if (offer.exToken === this.ETH_ADDRESS) {
      return this.buildFillOfferETHTx(offerId, amount);
    } else {
      return this.buildFillOfferTx(offerId, amount);
    }
  }

  /**
   * Cancel an offer
   * @param offerId The ID of the offer to cancel
   * @returns Transaction of type T
   */
  public async cancelOffer(
    offerId: number
  ): Promise<ethers.PopulatedTransaction> {
    return this.buildCancelOfferTx(offerId);
  }

  /**
   * Settle a filled order
   * @param orderId The ID of the order to settle
   * @returns Transaction of type T
   */
  public async settleOrder(
    orderId: number
  ): Promise<ethers.PopulatedTransaction> {
    return this.buildSettleFilledTx(orderId);
  }

  /**
   * Check if a token is accepted for trading
   * @param token The token address
   * @returns Whether the token is accepted
   */
  public async isAcceptedToken(token: string): Promise<boolean> {
    return this.contract.isAcceptedToken(token);
  }

  /**
   * Get configuration data for the PreMarket
   * @returns The configuration data
   */
  public async getConfig(): Promise<MarketConfig> {
    const config = await this.contract.config();
    return {
      pledgeRate: config.pledgeRate.toNumber(),
      feeRefund: config.feeRefund.toNumber(),
      feeSettle: config.feeSettle.toNumber(),
      feeWallet: config.feeWallet,
    };
  }

  /**
   * Builds a raw transaction to create a new offer with tokens
   * @param offerType The type of offer (0 for sell, 1 for buy)
   * @param tokenId The token ID
   * @param amount The amount of tokens
   * @param value The value of the offer
   * @param exToken The exchange token address
   * @param fullMatch Whether the offer requires a full match
   * @returns Populated transaction
   */
  public async buildNewOfferRawTx(
    offerType: number,
    tokenId: string,
    amount: ethers.BigNumberish,
    value: ethers.BigNumberish,
    exToken: string,
    fullMatch: boolean
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.newOffer(
      offerType,
      tokenId,
      amount,
      value,
      exToken,
      fullMatch
    );
  }

  /**
   * Builds a transaction to create a new offer with tokens
   * @param offerType The type of offer (0 for sell, 1 for buy)
   * @param tokenId The token ID
   * @param amount The amount of tokens
   * @param value The value of the offer
   * @param exToken The exchange token address
   * @param fullMatch Whether the offer requires a full match
   * @returns Populated transaction
   */
  public async buildNewOfferTx(
    offerType: number,
    tokenId: string,
    amount: number,
    value: number,
    exToken: string,
    fullMatch: boolean
  ): Promise<ethers.PopulatedTransaction> {
    // Check if exToken is address(0) (0x0000...0000)
    if (exToken.toLowerCase() === this.ETH_ADDRESS.toLowerCase()) {
      // Convert amount to BigNumber with 6 decimals
      const amountBN = parseTokenAmount(amount, 6);
      // Convert value to BigNumber with 18 decimals (ETH)
      const valueBN = parseTokenAmount(value, 18);

      return this.buildNewOfferETHRawTx(
        offerType,
        tokenId,
        amountBN,
        valueBN,
        fullMatch
      );
    }

    // Convert amount to BigNumber with 6 decimals
    const amountBN = parseTokenAmount(amount, 6);

    // Get token decimals and convert value to BigNumber with token decimals
    const tokenDecimals = await getTokenDecimals(
      exToken,
      this.contract.provider
    );
    const valueBN = parseTokenAmount(value, tokenDecimals);

    return this.buildNewOfferRawTx(
      offerType,
      tokenId,
      amountBN,
      valueBN,
      exToken,
      fullMatch
    );
  }

  /**
   * Builds a raw transaction to create a new offer with ETH
   * @param offerType The type of offer (0 for sell, 1 for buy)
   * @param tokenId The token ID
   * @param amount The amount of tokens
   * @param value The value of the offer
   * @param fullMatch Whether the offer requires a full match
   * @returns Populated transaction
   */
  public async buildNewOfferETHRawTx(
    offerType: number,
    tokenId: string,
    amount: ethers.BigNumberish,
    value: ethers.BigNumberish,
    fullMatch: boolean
  ): Promise<ethers.PopulatedTransaction> {
    const tx = await this.contract.populateTransaction.newOfferETH(
      offerType,
      tokenId,
      amount,
      value,
      fullMatch
    );

    // For ETH transactions, we need to set the value
    tx.value = ethers.BigNumber.from(value);

    return tx;
  }

  /**
   * Builds a transaction to create a new offer with ETH
   * @param offerType The type of offer (0 for sell, 1 for buy)
   * @param tokenId The token ID
   * @param amount The amount of tokens
   * @param value The value of the offer
   * @param fullMatch Whether the offer requires a full match
   * @returns Populated transaction
   */
  public async buildNewOfferETHTx(
    offerType: number,
    tokenId: string,
    amount: number,
    value: number,
    fullMatch: boolean
  ): Promise<ethers.PopulatedTransaction> {
    // Convert amount to BigNumber with 6 decimals
    const amountBN = parseTokenAmount(amount, 6);
    // Convert value to BigNumber with 18 decimals (ETH)
    const valueBN = parseTokenAmount(value, 18);

    return this.buildNewOfferETHRawTx(
      offerType,
      tokenId,
      amountBN,
      valueBN,
      fullMatch
    );
  }

  /**
   * Builds a raw transaction to fill an offer with tokens
   * @param offerId The offer ID to fill
   * @param amount The amount to fill
   * @returns Populated transaction
   */
  public async buildFillOfferRawTx(
    offerId: ethers.BigNumberish,
    amount: ethers.BigNumberish
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.fillOffer(offerId, amount);
  }

  /**
   * Builds a transaction to fill an offer with tokens
   * @param offerId The offer ID to fill
   * @param amount The amount to fill
   * @returns Populated transaction
   */
  public async buildFillOfferTx(
    offerId: number,
    amount: number
  ): Promise<ethers.PopulatedTransaction> {
    // Convert number to BigNumber for internal processing
    const offerIdBN = ethers.BigNumber.from(offerId);
    // Convert amount to BigNumber with 6 decimals
    const amountBN = parseTokenAmount(amount, 6);

    // Get offer details to check if it's an ETH offer
    const offer = await this.contract.offers(offerIdBN);

    // If exToken is address(0), use ETH fill function
    if (offer.exToken.toLowerCase() === this.ETH_ADDRESS.toLowerCase()) {
      return this.buildFillOfferETHRawTx(offerIdBN, amountBN);
    }

    return this.buildFillOfferRawTx(offerIdBN, amountBN);
  }

  /**
   * Builds a raw transaction to fill an offer with ETH
   * @param offerId The offer ID to fill
   * @param amount The amount to fill
   * @returns Populated transaction
   */
  public async buildFillOfferETHRawTx(
    offerId: ethers.BigNumberish,
    amount: ethers.BigNumberish
  ): Promise<ethers.PopulatedTransaction> {
    const offerRaw = await this.contract.offers(offerId);
    const valuePerUnit = offerRaw.value.div(offerRaw.amount);
    const fillValue = valuePerUnit.mul(amount);

    const tx = await this.contract.populateTransaction.fillOfferETH(
      offerId,
      amount
    );
    tx.value = fillValue;

    return tx;
  }

  /**
   * Builds a transaction to fill an offer with ETH
   * @param offerId The offer ID to fill
   * @param amount The amount to fill
   * @returns Populated transaction
   */
  public async buildFillOfferETHTx(
    offerId: number,
    amount: number
  ): Promise<ethers.PopulatedTransaction> {
    // Convert offerId to BigNumber
    const offerIdBN = ethers.BigNumber.from(offerId);
    // Convert amount to BigNumber with 6 decimals
    const amountBN = parseTokenAmount(amount, 6);

    return this.buildFillOfferETHRawTx(offerIdBN, amountBN);
  }

  /**
   * Builds a raw transaction to cancel an offer
   * @param offerId The offer ID to cancel
   * @returns Populated transaction
   */
  public async buildCancelOfferRawTx(
    offerId: ethers.BigNumberish
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.cancelOffer(offerId);
  }

  /**
   * Builds a transaction to cancel an offer
   * @param offerId The offer ID to cancel
   * @returns Populated transaction
   */
  public async buildCancelOfferTx(
    offerId: number
  ): Promise<ethers.PopulatedTransaction> {
    // Convert number input to BigNumber
    const offerIdBN = ethers.BigNumber.from(offerId);

    return this.buildCancelOfferRawTx(offerIdBN);
  }

  /**
   * Builds a raw transaction to cancel multiple offers
   * @param offerIds Array of offer IDs to cancel
   * @returns Populated transaction
   */
  public async buildCancelOffersRawTx(
    offerIds: ethers.BigNumberish[]
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.cancelOffers(offerIds);
  }

  /**
   * Builds a transaction to cancel multiple offers
   * @param offerIds Array of offer IDs to cancel
   * @returns Populated transaction
   */
  public async buildCancelOffersTx(
    offerIds: number[]
  ): Promise<ethers.PopulatedTransaction> {
    // Convert number array to BigNumber array
    const offerIdsBN = offerIds.map((id) => ethers.BigNumber.from(id));

    return this.buildCancelOffersRawTx(offerIdsBN);
  }

  /**
   * Builds a raw transaction to settle a filled order
   * @param orderId The order ID to settle
   * @returns Populated transaction
   */
  public async buildSettleFilledRawTx(
    orderId: ethers.BigNumberish
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.settleFilled(orderId);
  }

  /**
   * Builds a transaction to settle a filled order
   * @param orderId The order ID to settle
   * @returns Populated transaction
   */
  public async buildSettleFilledTx(
    orderId: number
  ): Promise<ethers.PopulatedTransaction> {
    // Convert number input to BigNumber
    const orderIdBN = ethers.BigNumber.from(orderId);

    return this.buildSettleFilledRawTx(orderIdBN);
  }

  /**
   * Builds a raw transaction to settle multiple filled orders
   * @param orderIds Array of order IDs to settle
   * @returns Populated transaction
   */
  public async buildSettleFilledsRawTx(
    orderIds: ethers.BigNumberish[]
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.settleFilleds(orderIds);
  }

  /**
   * Builds a transaction to settle multiple filled orders
   * @param orderIds Array of order IDs to settle
   * @returns Populated transaction
   */
  public async buildSettleFilledsTx(
    orderIds: number[]
  ): Promise<ethers.PopulatedTransaction> {
    // Convert number array to BigNumber array
    const orderIdsBN = orderIds.map((id) => ethers.BigNumber.from(id));

    return this.buildSettleFilledsRawTx(orderIdsBN);
  }

  /**
   * Builds a raw transaction to settle a cancelled order
   * @param orderId The order ID to settle
   * @returns Populated transaction
   */
  public async buildSettleCancelledRawTx(
    orderId: ethers.BigNumberish
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.settleCancelled(orderId);
  }

  /**
   * Builds a transaction to settle a cancelled order
   * @param orderId The order ID to settle
   * @returns Populated transaction
   */
  public async buildSettleCancelledTx(
    orderId: number
  ): Promise<ethers.PopulatedTransaction> {
    // Convert number input to BigNumber
    const orderIdBN = ethers.BigNumber.from(orderId);

    return this.buildSettleCancelledRawTx(orderIdBN);
  }

  /**
   * Builds a raw transaction to settle multiple cancelled orders
   * @param orderIds Array of order IDs to settle
   * @returns Populated transaction
   */
  public async buildSettleCancelledsRawTx(
    orderIds: ethers.BigNumberish[]
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.settleCancelleds(orderIds);
  }

  /**
   * Builds a transaction to settle multiple cancelled orders
   * @param orderIds Array of order IDs to settle
   * @returns Populated transaction
   */
  public async buildSettleCancelledsTx(
    orderIds: number[]
  ): Promise<ethers.PopulatedTransaction> {
    // Convert number array to BigNumber array
    const orderIdsBN = orderIds.map((id) => ethers.BigNumber.from(id));

    return this.buildSettleCancelledsRawTx(orderIdsBN);
  }

  /**
   * Builds a raw transaction to create a new token
   * @param tokenId The token ID
   * @param settleDuration The settlement duration
   * @returns Populated transaction
   */
  public async buildCreateTokenRawTx(
    tokenId: string,
    settleDuration: number
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.createToken(
      tokenId,
      settleDuration
    );
  }

  /**
   * Builds a transaction to create a new token
   * @param tokenId The token ID
   * @param settleDuration The settlement duration
   * @returns Populated transaction
   */
  public async buildCreateTokenTx(
    tokenId: string,
    settleDuration: number
  ): Promise<ethers.PopulatedTransaction> {
    return this.buildCreateTokenRawTx(tokenId, settleDuration);
  }

  /**
   * Builds a raw transaction to update the settlement duration for a token
   * @param tokenId The token ID
   * @param newDuration The new settlement duration
   * @returns Populated transaction
   */
  public async buildUpdateSettleDurationRawTx(
    tokenId: string,
    newDuration: number
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.updateSettleDuration(
      tokenId,
      newDuration
    );
  }

  /**
   * Builds a transaction to update the settlement duration for a token
   * @param tokenId The token ID
   * @param newDuration The new settlement duration
   * @returns Populated transaction
   */
  public async buildUpdateSettleDurationTx(
    tokenId: string,
    newDuration: number
  ): Promise<ethers.PopulatedTransaction> {
    return this.buildUpdateSettleDurationRawTx(tokenId, newDuration);
  }

  /**
   * Builds a raw transaction to withdraw liquid ETH from the contract
   * @param amount The amount of ETH to withdraw
   * @returns Populated transaction
   */
  public async buildWithdrawLiquidETHRawTx(
    amount: ethers.BigNumberish
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.withdrawLiquidETH(amount);
  }

  /**
   * Builds a transaction to withdraw liquid ETH from the contract
   * @param amount The amount of ETH to withdraw
   * @returns Populated transaction
   */
  public async buildWithdrawLiquidETHTx(
    amount: number
  ): Promise<ethers.PopulatedTransaction> {
    // Convert amount to BigNumber with 18 decimals (ETH)
    const amountBN = parseTokenAmount(amount, 18);

    return this.buildWithdrawLiquidETHRawTx(amountBN);
  }

  /**
   * Builds a raw transaction to withdraw liquid tokens from the contract
   * @param tokenAddress The token address
   * @param amount The amount of tokens to withdraw
   * @returns Populated transaction
   */
  public async buildWithdrawLiquidTokenRawTx(
    tokenAddress: string,
    amount: ethers.BigNumberish
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.withdrawLiquidToken(
      tokenAddress,
      amount
    );
  }

  /**
   * Builds a transaction to withdraw liquid tokens from the contract
   * @param tokenAddress The token address
   * @param amount The amount of tokens to withdraw
   * @returns Populated transaction
   */
  public async buildWithdrawLiquidTokenTx(
    tokenAddress: string,
    amount: number
  ): Promise<ethers.PopulatedTransaction> {
    // Get token decimals and convert amount to BigNumber with token decimals
    const tokenDecimals = await getTokenDecimals(
      tokenAddress,
      this.contract.provider
    );
    const amountBN = parseTokenAmount(amount, tokenDecimals);

    return this.buildWithdrawLiquidTokenRawTx(tokenAddress, amountBN);
  }

  /**
   * Builds a raw transaction to set accepted tokens
   * @param tokenAddresses Array of token addresses
   * @param isAccepted Whether the tokens are accepted
   * @returns Populated transaction
   */
  public async buildSetAcceptedTokensRawTx(
    tokenAddresses: string[],
    isAccepted: boolean
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.setAcceptedTokens(
      tokenAddresses,
      isAccepted
    );
  }

  /**
   * Builds a transaction to set accepted tokens
   * @param tokenAddresses Array of token addresses
   * @param isAccepted Whether the tokens are accepted
   * @returns Populated transaction
   */
  public async buildSetAcceptedTokensTx(
    tokenAddresses: string[],
    isAccepted: boolean
  ): Promise<ethers.PopulatedTransaction> {
    return this.buildSetAcceptedTokensRawTx(tokenAddresses, isAccepted);
  }

  /**
   * Builds a raw transaction to update the contract configuration
   * @param feeWallet The fee wallet address
   * @param feeSettle The settlement fee
   * @param feeRefund The refund fee
   * @param pledgeRate The pledge rate
   * @returns Populated transaction
   */
  public async buildUpdateConfigRawTx(
    feeWallet: string,
    feeSettle: ethers.BigNumberish,
    feeRefund: ethers.BigNumberish,
    pledgeRate: ethers.BigNumberish
  ): Promise<ethers.PopulatedTransaction> {
    return this.contract.populateTransaction.updateConfig(
      feeWallet,
      feeSettle,
      feeRefund,
      pledgeRate
    );
  }

  /**
   * Builds a transaction to update the contract configuration
   * @param feeWallet The fee wallet address
   * @param feeSettle The settlement fee
   * @param feeRefund The refund fee
   * @param pledgeRate The pledge rate
   * @returns Populated transaction
   */
  public async buildUpdateConfigTx(
    feeWallet: string,
    feeSettle: number,
    feeRefund: number,
    pledgeRate: number
  ): Promise<ethers.PopulatedTransaction> {
    // Convert number inputs to BigNumber with 18 decimals (standard for fees and rates)
    const feeSettleBN = parseTokenAmount(feeSettle, 18);
    const feeRefundBN = parseTokenAmount(feeRefund, 18);
    const pledgeRateBN = parseTokenAmount(pledgeRate, 18);

    return this.buildUpdateConfigRawTx(
      feeWallet,
      feeSettleBN,
      feeRefundBN,
      pledgeRateBN
    );
  }

  /**
   * Get the status of a transaction
   * @param txHash The transaction hash
   * @param maxRetries Maximum number of retries
   * @returns Transaction status
   */
  public async getTransactionStatus(
    txHash: string,
    maxRetries: number = 10
  ): Promise<TransactionStatus> {
    let attempts = 0;
    let waitTime = 1000; // Start with 1 second

    while (attempts < maxRetries) {
      try {
        const receipt = await this.contract.provider.getTransactionReceipt(
          txHash
        );

        if (!receipt) {
          attempts++;
          if (attempts === maxRetries) {
            return {
              status: null,
              confirmations: 0,
              isCompleted: false,
              attempts,
            };
          }
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          waitTime *= 2;
          continue;
        }

        // Get confirmations - in ethers v5 this is a property, not a method
        const confirmations = receipt.confirmations || 0;

        return {
          status: receipt.status === 1,
          confirmations,
          isCompleted: true,
          attempts: attempts + 1,
        };
      } catch (error: any) {
        throw new Error(`Failed to get transaction status: ${error.message}`);
      }
    }

    // This should never be reached due to the return in the if(!receipt) block
    throw new Error("Failed to get transaction status after maximum retries");
  }

  /**
   * Check if an offer is a buy offer
   * @param offerId The offer ID
   * @returns True if the offer is a buy offer
   */
  public async isBuyOffer(offerId: ethers.BigNumberish): Promise<boolean> {
    return this.contract.isBuyOffer(offerId);
  }

  /**
   * Check if an offer is a sell offer
   * @param offerId The offer ID
   * @returns True if the offer is a sell offer
   */
  public async isSellOffer(offerId: ethers.BigNumberish): Promise<boolean> {
    return this.contract.isSellOffer(offerId);
  }

  /**
   * Get the status of an offer
   * @param offerId The offer ID
   * @returns The offer status
   */
  public async getOfferStatus(
    offerId: ethers.BigNumberish
  ): Promise<ethers.BigNumber> {
    return this.contract.offerStatus(offerId);
  }

  /**
   * Get the status of an order
   * @param orderId The order ID
   * @returns The order status
   */
  public async getOrderStatus(
    orderId: ethers.BigNumberish
  ): Promise<ethers.BigNumber> {
    return this.contract.orderStatus(orderId);
  }

  /**
   * Get the amount available for an offer
   * @param offerId The offer ID
   * @returns The available amount
   */
  public async getOfferAmountAvailable(
    offerId: ethers.BigNumberish
  ): Promise<ethers.BigNumber> {
    return this.contract.offerAmountAvailable(offerId);
  }

  /**
   * Get the contract owner
   * @returns The contract owner address
   */
  public async getOwner(): Promise<string> {
    return this.contract.owner();
  }

  /**
   * Check if a token is locked
   * @param tokenId The token ID
   * @returns True if the token is locked
   */
  public async isTokenLocked(tokenId: string): Promise<boolean> {
    return this.contract.isLocked(tokenId);
  }

  /**
   * Get token details
   * @param tokenId The token ID
   * @returns The token details
   */
  public async getToken(tokenId: string): Promise<any> {
    return this.contract.tokens(tokenId);
  }
}
