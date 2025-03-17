import { PublicKey, Transaction } from "@solana/web3.js";
import { AnchorAdapter } from "./AnchorAdapter";
import axios from "axios";

/**
 * Implementation of AnchorAdapter using API calls
 */
export class ApiAnchorAdapter implements AnchorAdapter {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
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
      const response = await axios.get(`${this.apiBaseUrl}/offers/${offerId}`);
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
      const response = await axios.get(`${this.apiBaseUrl}/orders/${orderId}`);
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
        `${this.apiBaseUrl}/config/${configAccountPubKey}`
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
        `${this.apiBaseUrl}/tokens/${tokenId}/config`
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
        `${this.apiBaseUrl}/ex-tokens/${tokenAddress}`
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
    try {
      await axios.post(`${this.apiBaseUrl}/bootstrap`, { configAccountPubKey });
    } catch (error) {
      console.error(
        `Error bootstrapping with config ${configAccountPubKey}:`,
        error
      );
      throw new Error(`Failed to bootstrap: ${error}`);
    }
  }

  /**
   * Find the last offer ID
   */
  async findIdOffer(): Promise<number> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/offers/last-id`);
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
      const response = await axios.get(`${this.apiBaseUrl}/orders/last-id`);
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
    tokenPublicKey: PublicKey,
    amount: number,
    value: number,
    fullMatch: boolean,
    signerPublicKey: PublicKey
  ): Promise<Transaction> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/offers/create`, {
        tokenId,
        type,
        tokenPublicKey: tokenPublicKey.toString(),
        amount,
        value,
        fullMatch,
        signerPublicKey: signerPublicKey.toString(),
      });

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
        `${this.apiBaseUrl}/offers/${offerId}/close`
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
        `${this.apiBaseUrl}/orders/${orderId}/settle`
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
