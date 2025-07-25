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
// @ts-ignore
import MatchingOrderAbi from "../abi/MatchingOrderAbi.json";
interface BatchOrderResponse {
  data: {
    list: Array<{
      order_index: number;
    }>;
    total: number;
    offerIndex: number;
    chainId: number;
  };
}

/**
 * Class for interacting with the PreMarket contract
 */
export class PreMarketEVM extends BasePreMarket<ethers.PopulatedTransaction> {
  private contract: PreMarket;
  private matchOfferContract: ethers.Contract;
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
    signerOrProvider: ethers.Signer | ethers.providers.Provider,
    matchOfferContractAddress?: string
  ) {
    super();
    this.contract = PreMarket__factory.connect(
      contractAddress,
      signerOrProvider
    );
    this.tokens = new TokenEVM(signerOrProvider as ethers.providers.Provider);
    if (!matchOfferContractAddress)
      throw new Error("matchOfferContractAddress is required");
    if (!matchOfferContractAddress)
      throw new Error("matchOfferContractAddress cannot be the ETH address");
    this.matchOfferContract = new ethers.Contract(
      matchOfferContractAddress,
      MatchingOrderAbi,
      signerOrProvider
    );
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
    const _params = {
      offerIds: offerIdsBN,
      tokenId: tokenId,
      totalAmount: totalAmountBN,
      totalValue: totalValueBN,
      offerType: offerType,
      exToken:
        exToken.toLowerCase() === this.ETH_ADDRESS.toLowerCase()
          ? ethers.constants.AddressZero
          : exToken,
      newOfferFullMatch: newOfferFullMatch,
    };

    // Gọi với một tham số duy nhất - đối tượng params
    tx = await this.matchOfferContract.populateTransaction.matchOffer(_params);

    // Cho giao dịch ETH, vẫn phải set value
    if (exToken.toLowerCase() === this.ETH_ADDRESS.toLowerCase()) {
      tx.value = totalValueBN;
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
   * Cancel an order
   * @param orderId The ID of the order to cancel
   * @returns Transaction of type T
   */
  public async cancelOrder(
    orderId: number
  ): Promise<ethers.PopulatedTransaction> {
    return this.buildSettleCancelledTx(orderId);
  }

  /**
   * Settle a batch of orders
   * @param offerId The ID of the offer to settle
   * @returns Transaction of type T
   */
  public async settleBatchOrder(
    offerId: number
  ): Promise<ethers.PopulatedTransaction> {
    // get chainId from rpc
    const network = await this.contract.provider.getNetwork();
    const chainId = network.chainId;
    const url = this.isMainnet(chainId)
      ? "https://api.whales.market"
      : "https://api-dev.whales-market.site";

    const seller = this.getPubkey();

    if (!seller) {
      throw new Error("Seller not found");
    }

    const response = await fetch(
      `${url}/v2/orders-by-offer-index?offerIndex=${offerId}&chainId=${chainId}&seller=${seller}&sortType=DESC`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as BatchOrderResponse;
    const orderIds = data.data.list.map((order) => order.order_index);
    return this.buildBatchSettleFilledsTx(orderIds);
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
   * Builds a transaction to settle multiple filled orders
   * @param orderIds Array of order IDs to settle
   * @returns Populated transaction
   */
  public async buildBatchSettleFilledsTx(
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
   * Wait for a transaction to be confirmed
   * @param txHash The transaction hash
   * @param confirmations Number of confirmations to wait for (default: 1)
   * @param timeout Timeout in milliseconds (default: 60000 - 1 minute)
   * @returns Transaction status
   */
  public async waitTransaction(
    txHash: string,
    confirmations: number = 1,
    timeout: number = 60000
  ): Promise<TransactionStatus> {
    // Time to stop waiting
    const timeoutTime = Date.now() + timeout;

    // Initial delay before first check
    await new Promise((resolve) => setTimeout(resolve, 1000));

    while (Date.now() < timeoutTime) {
      try {
        const receipt = await this.contract.provider.getTransactionReceipt(
          txHash
        );

        if (!receipt) {
          // Transaction not yet mined, wait a bit more
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }

        // If we have enough confirmations, return success
        if (receipt.confirmations >= confirmations) {
          return {
            status: receipt.status === 1,
            confirmations: receipt.confirmations,
            isCompleted: true,
            attempts: 1,
          };
        }

        // If we need more confirmations, wait a bit more
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error: any) {
        // Log error but continue trying
        console.error(`Error checking transaction: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Timeout reached without getting enough confirmations
    // Check one last time
    try {
      const receipt = await this.contract.provider.getTransactionReceipt(
        txHash
      );
      if (receipt) {
        return {
          status: receipt.status === 1,
          confirmations: receipt.confirmations,
          isCompleted: receipt.confirmations >= confirmations,
          attempts: 1,
        };
      }
    } catch (error) {
      // Ignore error on last check
    }

    return {
      status: null,
      confirmations: 0,
      isCompleted: false,
      attempts: 1,
    };
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

  /**
   * Check if the current network is mainnet
   * @returns True if it is mainnet, False if it is testnet
   */
  public isMainnet(chainId: number): boolean {
    // Các chainId của mainnet
    const mainnetChainIds = [
      1, // Ethereum Mainnet
      56, // Binance Smart Chain Mainnet
      137, // Polygon Mainnet
      42161, // Arbitrum Mainnet
      10, // Optimism Mainnet
      43114, // Avalanche C-Chain Mainnet
      250, // Fantom Opera Mainnet
      100, // Gnosis Chain
      324, // zkSync Era Mainnet
      8453, // Base Mainnet
    ];

    return mainnetChainIds.includes(chainId);
  }

  /**
   * Check if the current network is testnet
   * @returns True if it is testnet, False if it is mainnet
   */
  public async isTestnet(): Promise<boolean> {
    const network = await this.contract.provider.getNetwork();
    const chainId = network.chainId;

    // Các chainId của testnet
    const testnetChainIds = [
      5, // Goerli Testnet
      11155111, // Sepolia Testnet
      80001, // Polygon Mumbai Testnet
      421613, // Arbitrum Goerli Testnet
      420, // Optimism Goerli Testnet
      43113, // Avalanche Fuji Testnet
      4002, // Fantom Testnet
      1442, // Polygon zkEVM Testnet
      84531, // Base Goerli Testnet
      534351, // Scroll Sepolia Testnet
    ];

    return testnetChainIds.includes(chainId);
  }

  /**
   * Check the allowance of tokens that a spender is allowed to use
   * @param spender The address of the spender
   * @param tokenAddress The address of the token
   * @returns The amount of tokens the spender is allowed to use
   */
  public async checkAllowance(
    spender: string,
    tokenAddress: string
  ): Promise<number> {
    try {
      // For ETH (native token), there's no concept of allowance
      if (tokenAddress.toLowerCase() === this.ETH_ADDRESS.toLowerCase()) {
        return Number.MAX_SAFE_INTEGER; // Unlimited allowance for ETH
      }

      // Get the owner's address
      if (!this._pubkey) {
        throw new Error("No owner public key available");
      }
      const owner = this._pubkey;

      // Use the TokenEVM instance to check allowance
      const allowance = await this.tokens.getAllowance(
        owner,
        tokenAddress,
        spender
      );

      return allowance;
    } catch (error) {
      console.error("Error checking allowance:", error);
      return 0;
    }
  }

  /**
   * Approve a spender to use a specific amount of tokens
   * @param spender The address of the spender
   * @param tokenAddress The address of the token
   * @param amount The amount of tokens to approve
   * @returns A populated transaction for approval
   */
  public async approve(
    spender: string,
    tokenAddress: string,
    amount: number
  ): Promise<ethers.PopulatedTransaction> {
    try {
      // For ETH (native token), there's no concept of approval
      if (tokenAddress.toLowerCase() === this.ETH_ADDRESS.toLowerCase()) {
        throw new Error("Cannot approve native ETH");
      }

      // Use the TokenEVM instance to create the approval transaction
      return this.tokens.approve(tokenAddress, spender, amount);
    } catch (error) {
      console.error("Error approving tokens:", error);
      throw new Error(
        `Failed to approve tokens: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  isAcceptedToken(token: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
