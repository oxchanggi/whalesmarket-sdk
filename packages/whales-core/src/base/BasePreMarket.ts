/**
 * Abstract base class for PreMarket implementations
 * This class provides common functionality and interfaces for both Solana and EVM implementations
 * @template T The transaction type (Solana web3 Transaction or ethers.PopulatedTransaction)
 * @template S The signer type (Solana Keypair or ethers.Wallet)
 */
export abstract class BasePreMarket<T, S extends string = string> {
  /**
   * The current public key
   * @protected
   */
  protected _pubkey?: S;

  /**
   * Set the public key for this PreMarket instance
   * @param pubkey The public key to use
   */
  setPubkey(pubkey: S): void {
    this._pubkey = pubkey;
  }

  /**
   * Remove the current public key from this PreMarket instance
   */
  removePubkey(): void {
    this._pubkey = undefined;
  }

  /**
   * Get the current public key
   * @returns The current public key or undefined if not set
   */
  getPubkey(): S | undefined {
    return this._pubkey;
  }

  /**
   * Initialize the PreMarket instance
   * @param config Configuration parameters for the PreMarket
   */
  abstract initialize(config: Record<string, unknown>): Promise<void>;

  /**
   * Get the last offer ID
   * @returns The last offer ID
   */
  abstract getLastOfferId(): Promise<number>;

  /**
   * Get the last order ID
   * @returns The last order ID
   */
  abstract getLastOrderId(): Promise<number>;

  /**
   * Get an offer by ID
   * @param offerId The ID of the offer to retrieve
   * @returns The offer data
   */
  abstract getOffer(offerId: number): Promise<OfferData>;

  /**
   * Get an order by ID
   * @param orderId The ID of the order to retrieve
   * @returns The order data
   */
  abstract getOrder(orderId: number): Promise<OrderData>;

  /**
   * Create a new offer
   * @param params Parameters for creating the offer
   * @returns Transaction of type T
   */
  abstract createOffer(params: CreateOfferParams): Promise<T>;

  /**
   * Match multiple offers and create a new offer with the remaining amount
   * @param params Parameters for matching offers
   * @returns Transaction of type T
   */
  abstract matchOffer(params: MatchOfferParams): Promise<T>;

  /**
   * Fill an existing offer
   * @param offerId The ID of the offer to fill
   * @param amount The amount to fill
   * @returns Transaction of type T
   */
  abstract fillOffer(offerId: number, amount: number): Promise<T>;

  /**
   * Cancel an offer
   * @param offerId The ID of the offer to cancel
   * @returns Transaction of type T
   */
  abstract cancelOffer(offerId: number): Promise<T>;

  /**
   * Settle a filled order
   * @param orderId The ID of the order to settle
   * @returns Transaction of type T
   */
  abstract settleOrder(orderId: number): Promise<T>;

  /**
   * Check if a token is accepted for trading
   * @param token The token address or identifier
   * @returns Whether the token is accepted
   */
  abstract isAcceptedToken(token: string): Promise<boolean>;

  /**
   * Get configuration data for the PreMarket
   * @returns The configuration data
   */
  abstract getConfig(): Promise<MarketConfig>;

  /**
   * Get the status of a transaction
   * @param txHash The transaction hash
   * @param maxRetries Maximum number of retries
   * @returns Transaction status
   */
  abstract getTransactionStatus(
    txHash: string,
    maxRetries?: number
  ): Promise<TransactionStatus>;
}

/**
 * Offer data structure
 */
export interface OfferData {
  offerType: number;
  tokenId: string;
  exToken: string;
  amount: number;
  value: number;
  collateral: number;
  filledAmount: number;
  status: number;
  offeredBy: string;
  fullMatch: boolean;
}

/**
 * Order data structure
 */
export interface OrderData {
  offerId: number;
  amount: number;
  seller: string;
  buyer: string;
  status: number;
}

/**
 * Parameters for creating an offer
 */
export interface CreateOfferParams {
  offerType: number;
  tokenId: string;
  amount: number;
  value: number;
  exToken?: string;
  fullMatch?: boolean;
}

/**
 * Parameters for matching offers
 */
export interface MatchOfferParams {
  offerIds: number[];
  tokenId: string;
  totalAmount: number;
  totalValue: number;
  offerType: number;
  exToken: string;
  newOfferFullMatch: boolean;
  signer?: string;
}

/**
 * Market configuration
 */
export interface MarketConfig {
  pledgeRate: number;
  feeRefund: number;
  feeSettle: number;
  feeWallet: string;
}

/**
 * Transaction status
 */
export interface TransactionStatus {
  status: boolean | null;
  confirmations: number;
  isCompleted: boolean;
  attempts: number;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  transaction: {
    hash: string;
  };
  status: TransactionStatus;
}

/**
 * Transaction callbacks
 */
export interface TransactionCallbacks {
  onSubmit?: (txHash: string) => void | Promise<void>;
  onFinally?: (
    status: TransactionStatus & { txHash: string }
  ) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
}

/**
 * Generic signer type
 * This is a placeholder interface that should be extended by specific implementations
 */
export interface SignerType {
  // Common properties that might be shared across different signer types
  publicKey?: string | any;
  // Add other common properties as needed
  // For ethers.Signer compatibility
  connect?: (provider: any) => any;
  // Make sendTransaction optional and accept any parameters
  sendTransaction?: (...args: any[]) => Promise<any>;
  // Add signTransaction for wallet adapters
  signTransaction?: (transaction: any) => Promise<any>;
}
