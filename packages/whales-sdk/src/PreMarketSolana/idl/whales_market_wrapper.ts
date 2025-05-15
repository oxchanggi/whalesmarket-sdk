export type MatchingOrder = {
  version: "0.1.0";
  name: "matching_order";
  constants: [
    {
      name: "WEI6";
      type: "u64";
      value: "1000000";
    }
  ];
  instructions: [
    {
      name: "matchOffer";
      accounts: [
        {
          name: "newOffer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "configAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenConfigAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "exTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "userTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "exToken";
          isMut: false;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "authority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "preMarket";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "totalAmount";
          type: "u64";
        },
        {
          name: "matchPrice";
          type: "u64";
        },
        {
          name: "offerType";
          type: {
            defined: "OfferType";
          };
        },
        {
          name: "newOrderIds";
          type: {
            vec: "u64";
          };
        },
        {
          name: "newOfferId";
          type: "u64";
        },
        {
          name: "newOfferFullMatch";
          type: "bool";
        }
      ];
    }
  ];
  types: [
    {
      name: "OfferType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Buy";
          },
          {
            name: "Sell";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "OfferTypeMismatch";
      msg: "Offer Type Mismatch";
    },
    {
      code: 6001;
      name: "PriceTooLow";
      msg: "Price Too Low";
    },
    {
      code: 6002;
      name: "PriceTooHigh";
      msg: "Price Too High";
    },
    {
      code: 6003;
      name: "MintIsNotOwnedByTokenProgram";
      msg: "Mint Is Not Owned By Token Program";
    }
  ];
};

export const IDL: MatchingOrder = {
  version: "0.1.0",
  name: "matching_order",
  constants: [
    {
      name: "WEI6",
      type: "u64",
      value: "1000000",
    },
  ],
  instructions: [
    {
      name: "matchOffer",
      accounts: [
        {
          name: "newOffer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "configAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenConfigAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "exTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "exToken",
          isMut: false,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "preMarket",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "totalAmount",
          type: "u64",
        },
        {
          name: "matchPrice",
          type: "u64",
        },
        {
          name: "offerType",
          type: {
            defined: "OfferType",
          },
        },
        {
          name: "newOrderIds",
          type: {
            vec: "u64",
          },
        },
        {
          name: "newOfferId",
          type: "u64",
        },
        {
          name: "newOfferFullMatch",
          type: "bool",
        },
      ],
    },
  ],
  types: [
    {
      name: "OfferType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Buy",
          },
          {
            name: "Sell",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "OfferTypeMismatch",
      msg: "Offer Type Mismatch",
    },
    {
      code: 6001,
      name: "PriceTooLow",
      msg: "Price Too Low",
    },
    {
      code: 6002,
      name: "PriceTooHigh",
      msg: "Price Too High",
    },
    {
      code: 6003,
      name: "MintIsNotOwnedByTokenProgram",
      msg: "Mint Is Not Owned By Token Program",
    },
  ],
};
