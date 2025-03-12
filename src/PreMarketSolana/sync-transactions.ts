import { PROGRAM_ID, WEI6 } from './constants';

const parseCreateOffer = (events: any[]) => {
  return events
    .filter((event) => event?.name == 'CreatedOfferEvent')
    .map((event) => {
      const data = event?.data;
      return {
        tx_hash: event.tx_hash,
        block_number: event.block_number,
        event_name: 'NewOffer',
        contract_address: PROGRAM_ID,
        offer_type: Object.keys(data?.offerType)[0],
        token_id: data?.tokenConfigId,
        offer_index: data?.id?.toNumber(),
        amount: data?.amount?.toNumber() / WEI6,
        price: data?.price?.toNumber(),
        value: data?.value?.toNumber(),
        collateral: data?.collateral?.toNumber(),
        offer_by: data?.offerBy?.toString(),
        ex_token: data?.exToken?.toString(),
        full_match: data?.isFullMatch,
      };
    });
};

const parseCreateOrder = (events: any[]) => {
  return events
    .filter((event) => event?.name == 'CreatedOrderEvent')
    .map((event) => {
      const data = event?.data;
      return {
        tx_hash: event.tx_hash,
        block_number: event.block_number,
        event_name: 'NewOrder',
        contract_address: PROGRAM_ID,
        order_index: data?.id?.toNumber(),
        offer_index: data?.offerId?.toNumber(),
        amount: data?.amount?.toNumber() / WEI6,
        seller: data?.seller?.toString(),
        buyer: data?.buyer?.toString(),
      };
    });
};

const parseSettleOrder = (events: any[]) => {
  return events
    .filter((event) => event?.name == 'SettledOrderEvent')
    .map((event) => {
      const data = event?.data;
      return {
        tx_hash: event.tx_hash,
        block_number: event.block_number,
        event_name: 'SettleOrder',
        contract_address: PROGRAM_ID,
        order_index: data?.orderId?.toNumber(),
        value: data?.value?.toNumber(),
        collateral: data?.collateral?.toNumber(),
      };
    });
};

const parseCancelOrder = (events: any[]) => {
  return events
    .filter((event) => event?.name == 'CancelledOrderEvent')
    .map((event) => {
      const data = event?.data;
      return {
        tx_hash: event.tx_hash,
        block_number: event.block_number,
        event_name: 'CancelOrder',
        contract_address: PROGRAM_ID,
        order_index: data?.orderId?.toNumber(),
        value: data?.value?.toNumber(),
        collateral: data?.collateral?.toNumber(),
        signer: event?.signer?.toString(),
      };
    });
};

const parseUpdateTokenAddress = (events: any[]) => {
  return events
    .filter((event) => event?.name == 'UpdatedTokenSettlePhaseEvent')
    .map((event) => {
      const data = event?.data;
      return {
        tx_hash: event.tx_hash,
        block_number: event.block_number,
        event_name: 'UpdatedTokenSettlePhase',
        contract_address: PROGRAM_ID,
        token_id: data?.id,
        status: Object.keys(data?.status)[0],
        token_address: data?.token?.toString(),
        settle_rate: data?.settleRate?.toNumber(),
      };
    });
};

const parseUpdateTokenStatus = (events: any[]) => {
  return events
    .filter((event) => event?.name == 'UpdatedTokenEvent')
    .map((event) => {
      const data = event?.data;
      return {
        tx_hash: event.tx_hash,
        block_number: event.block_number,
        event_name: 'UpdateTokenStatus',
        contract_address: PROGRAM_ID,
        token_id: data?.id,
        status: Object.keys(data?.status)[0],
      };
    });
};

const parseNewToken = (events: any[]) => {
  return events
    .filter((event) => event?.name == 'CreatedTokenEvent')
    .map((event) => {
      const data = event?.data;
      return {
        tx_hash: event.tx_hash,
        block_number: event.block_number,
        event_name: 'NewToken',
        contract_address: PROGRAM_ID,
        token_id: data?.id,
        settle_duration: data?.settleDuration?.toNumber(),
        pledge_rate: data?.pledgeRate?.toNumber() / WEI6,
      };
    });
};

const parseCloseOffer = (events: any[]) => {
  return events
    .filter((event) => event?.name == 'ClosedOfferEvent')
    .map((event) => {
      const data = event?.data;
      return {
        tx_hash: event.tx_hash,
        block_number: event.block_number,
        event_name: 'CloseOffer',
        contract_address: PROGRAM_ID,
        offer_index: data?.offerId?.toNumber(),
        refund_amount: data?.refundAmount?.toNumber() / WEI6,
      };
    });
};

export {
  parseNewToken,
  parseUpdateTokenAddress,
  parseUpdateTokenStatus,
  parseCreateOffer,
  parseCloseOffer,
  parseCreateOrder,
  parseSettleOrder,
  parseCancelOrder,
};
