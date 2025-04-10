import { PublicKey, Transaction } from "@solana/web3.js";
import { AnchorAdapter } from "./AnchorAdapter";
import axios from "axios";
import { MatchOfferParams } from "@whalesmarket/core";

/**
 * Implementation of AnchorAdapter using API calls
 */
export class ApiAnchorAdapter implements AnchorAdapter {
  private apiBaseUrl: string;
  private rpc: string;
  private programId: string;
  private configAccount: string | null = null;
  private pubkey: string | null = null;

  constructor(apiBaseUrl: string, rpc: string, programId: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.rpc = rpc;
    this.programId = programId;
  }

  initialize(configAccount: string) {
    this.configAccount = configAccount;
  }

  setPubkey(pubkey: string) {
    this.pubkey = pubkey;
  }

  /**
   * Get common headers for all API requests
   */
  private getCommonHeaders() {
    if (!this.configAccount) {
      throw new Error("Config account not initialized");
    }
    return {
      "x-rpc": this.rpc,
      "x-program-id": this.programId,
      "x-config-account": this.configAccount,
    };
  }

  /**
   * Get headers for POST requests that need a signer
   */
  private getPostHeaders() {
    const signer = this.pubkey;
    if (!signer) {
      throw new Error("Signer not initialized");
    }
    const headers = this.getCommonHeaders();
    if (signer) {
      return {
        ...headers,
        "x-signer": signer,
      };
    }
    return headers;
  }

  /**
   * Create a BN-like object with the same interface
   */
  createBN(value: number): any {
    // Implement a simple BN-like object that has the same interface
    return {
      toNumber: () => value,
      toString: () => value.toString(),
      // Add other methods as needed
    };
  }

  /**
   * Fetch offer account data from API
   */
  async fetchOfferAccount(offerId: number): Promise<any> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/offers/${offerId}`, {
        headers: this.getCommonHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching offer account ${offerId}:`, error);
      throw new Error(`Failed to fetch offer account: ${error}`);
    }
  }

  /**
   * Fetch order account data from API
   */
  async fetchOrderAccount(orderId: number): Promise<any> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/orders/${orderId}`, {
        headers: this.getCommonHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching order account ${orderId}:`, error);
      throw new Error(`Failed to fetch order account: ${error}`);
    }
  }

  /**
   * Fetch config account data from API
   */
  async fetchConfigAccount(configAccountPubKey: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/config/${configAccountPubKey}`,
        { headers: this.getCommonHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching config account ${configAccountPubKey}:`,
        error
      );
      throw new Error(`Failed to fetch config account: ${error}`);
    }
  }

  /**
   * Fetch token config account data from API
   */
  async fetchTokenConfigAccount(tokenId: number): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/tokens/${tokenId}/config`,
        { headers: this.getCommonHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching token config account ${tokenId}:`, error);
      throw new Error(`Failed to fetch token config account: ${error}`);
    }
  }

  /**
   * Fetch ex-token account data from API
   */
  async fetchExTokenAccount(tokenPubKey: PublicKey): Promise<any> {
    try {
      const tokenAddress = tokenPubKey.toString();
      const response = await axios.get(
        `${this.apiBaseUrl}/ex-tokens/${tokenAddress}`,
        { headers: this.getCommonHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching ex-token account ${tokenPubKey.toString()}:`,
        error
      );
      throw new Error(`Failed to fetch ex-token account: ${error}`);
    }
  }

  /**
   * Bootstrap the PreMarket
   */
  async bootstrap(configAccountPubKey: string): Promise<void> {
    // try {
    //   await axios.post(
    //     `${this.apiBaseUrl}/bootstrap`,
    //     { configAccountPubKey },
    //     { headers: this.getPostHeaders() }
    //   );
    // } catch (error) {
    //   console.error(
    //     `Error bootstrapping with config ${configAccountPubKey}:`,
    //     error
    //   );
    //   throw new Error(`Failed to bootstrap: ${error}`);
    // }
  }

  /**
   * Find the last offer ID
   */
  async findIdOffer(): Promise<number> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/offers/last-id`, {
        headers: this.getCommonHeaders(),
      });
      return response.data.id;
    } catch (error) {
      console.error("Error finding last offer ID:", error);
      throw new Error(`Failed to find last offer ID: ${error}`);
    }
  }

  /**
   * Find the last order ID
   */
  async findIdOrder(): Promise<number> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/orders/last-id`, {
        headers: this.getCommonHeaders(),
      });
      return response.data.id;
    } catch (error) {
      console.error("Error finding last order ID:", error);
      throw new Error(`Failed to find last order ID: ${error}`);
    }
  }

  /**
   * Create an offer
   */
  async createOffer(
    tokenId: number,
    type: string,
    exToken: PublicKey,
    amount: number,
    value: number,
    fullMatch: boolean,
    signerPublicKey: PublicKey
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/offers/create`,
        {
          tokenId,
          type,
          exToken,
          amount,
          value,
          fullMatch,
          signerPublicKey: signerPublicKey.toString(),
        },
        {
          headers: this.getPostHeaders(),
        }
      );

      // Convert the serialized transaction back to a Transaction object
      const serializedTx = response.data.transaction;
      const transaction = Transaction.from(Buffer.from(serializedTx, "base64"));
      return transaction;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw new Error(`Failed to create offer: ${error}`);
    }
  }

  /**
   * Match multiple offers and create a new offer with the remaining amount
   */
  async matchOffer(params: MatchOfferParams): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/offers/match`,
        {
          offerIds: params.offerIds,
          tokenId: params.tokenId,
          totalAmount: params.totalAmount,
          totalValue: params.totalValue,
          offerType: params.offerType,
          exToken: params.exToken,
          newOfferFullMatch: params.newOfferFullMatch,
        },
        { headers: this.getPostHeaders() }
      );

      // Convert the serialized transaction back to a Transaction object
      const serializedTx = response.data.transaction;
      const transaction = Transaction.from(Buffer.from(serializedTx, "base64"));
      return transaction;
    } catch (error: any) {
      console.error("Error matching offers:", error?.response?.data);
      throw new Error(`Failed to match offers: ${error}`);
    }
  }

  /**
   * Fill an offer
   */
  async fillOffer(
    offerId: number,
    amount: number,
    userPublicKey: PublicKey
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/offers/${offerId}/fill`,
        {
          amount,
          userPublicKey: userPublicKey.toString(),
        },
        {
          headers: this.getPostHeaders(),
        }
      );

      // Convert the serialized transaction back to a Transaction object
      const serializedTx = response.data.transaction;
      const transaction = Transaction.from(Buffer.from(serializedTx, "base64"));
      return transaction;
    } catch (error) {
      console.error(`Error filling offer ${offerId}:`, error);
      throw new Error(`Failed to fill offer: ${error}`);
    }
  }

  /**
   * Close an unfilled offer
   */
  async closeUnFullFilledOffer(offerId: number): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/offers/${offerId}/close`,
        {},
        {
          headers: this.getPostHeaders(),
        }
      );

      // Convert the serialized transaction back to a Transaction object
      const serializedTx = response.data.transaction;
      const transaction = Transaction.from(Buffer.from(serializedTx, "base64"));
      return transaction;
    } catch (error) {
      console.error(`Error closing offer ${offerId}:`, error);
      throw new Error(`Failed to close offer: ${error}`);
    }
  }

  /**
   * Settle an order
   */
  async settleOrder(orderId: number): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/orders/${orderId}/settle`,
        {},
        {
          headers: this.getPostHeaders(),
        }
      );

      // Convert the serialized transaction back to a Transaction object
      const serializedTx = response.data.transaction;
      const transaction = Transaction.from(Buffer.from(serializedTx, "base64"));
      return transaction;
    } catch (error) {
      console.error(`Error settling order ${orderId}:`, error);
      throw new Error(`Failed to settle order: ${error}`);
    }
  }

  /**
   * Settle a batch of orders for an offer
   */
  async settleBatchOrder(offerId: number): Promise<Transaction[]> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/orders/batch-settle`,
        {
          offerId,
        },
        {
          headers: this.getPostHeaders(),
        }
      );
      // Convert the serialized transactions back to a Transaction object
      const serializedTxs = response.data.transactions;
      const transactions: Transaction[] = serializedTxs.map((tx: any) =>
        Transaction.from(Buffer.from(tx, "base64"))
      );
      return transactions;
    } catch (error) {
      console.error(`Error settling batch order ${offerId}:`, error);
      throw new Error(`Failed to settle batch order: ${error}`);
    }
  }

  /**
   * Set ex-token acceptance
   */
  async setExToken(
    tokenPubKey: PublicKey,
    isAccepted: boolean
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/ex-tokens/set-acceptance`,
        {
          tokenPubKey: tokenPubKey.toString(),
          isAccepted,
        },
        {
          headers: this.getPostHeaders(),
        }
      );

      // Convert the serialized transaction back to a Transaction object
      const serializedTx = response.data.transaction;
      const transaction = Transaction.from(Buffer.from(serializedTx, "base64"));
      return transaction;
    } catch (error) {
      console.error(
        `Error setting ex-token acceptance for ${tokenPubKey.toString()}:`,
        error
      );
      throw new Error(`Failed to set ex-token acceptance: ${error}`);
    }
  }

  /**
   * Settle an order with discount
   */
  async settleOrderWithDiscount(
    orderId: number,
    settleVerifier: PublicKey,
    buyerFeeDiscount: any,
    sellerFeeDiscount: any
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/orders/${orderId}/settle-with-discount`,
        {
          settleVerifier: settleVerifier.toString(),
          buyerFeeDiscount:
            typeof buyerFeeDiscount === "object"
              ? buyerFeeDiscount.toString()
              : buyerFeeDiscount,
          sellerFeeDiscount:
            typeof sellerFeeDiscount === "object"
              ? sellerFeeDiscount.toString()
              : sellerFeeDiscount,
        },
        {
          headers: this.getPostHeaders(),
        }
      );

      // Convert the serialized transaction back to a Transaction object
      const serializedTx = response.data.transaction;
      const transaction = Transaction.from(Buffer.from(serializedTx, "base64"));
      return transaction;
    } catch (error) {
      console.error(`Error settling order ${orderId} with discount:`, error);
      throw new Error(`Failed to settle order with discount: ${error}`);
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(
    orderId: number,
    userPublicKey: PublicKey
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/orders/${orderId}/cancel`,
        {
          userPublicKey: userPublicKey.toString(),
        },
        {
          headers: this.getPostHeaders(),
        }
      );

      // Convert the serialized transaction back to a Transaction object
      const serializedTx = response.data.transaction;
      const transaction = Transaction.from(Buffer.from(serializedTx, "base64"));
      return transaction;
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw new Error(`Failed to cancel order: ${error}`);
    }
  }
}
