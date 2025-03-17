export type PreMarketType = {
  "version": "0.1.0",
  "name": "pre_market",
  "constants": [
    {
      "name": "CONFIG_PDA_SEED",
      "type": "bytes",
      "value": "[99, 111, 110, 102, 105, 103, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "TOKEN_PDA_SEED",
      "type": "bytes",
      "value": "[116, 111, 107, 101, 110, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "VAULT_TOKEN_PDA_SEED",
      "type": "bytes",
      "value": "[118, 97, 117, 108, 116, 95, 116, 111, 107, 101, 110, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "EX_TOKEN_PDA_SEED",
      "type": "bytes",
      "value": "[101, 120, 95, 116, 111, 107, 101, 110, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "OFFER_PDA_SEED",
      "type": "bytes",
      "value": "[111, 102, 102, 101, 114, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "ORDER_PDA_SEED",
      "type": "bytes",
      "value": "[111, 114, 100, 101, 114, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "ROLE_PDA_SEED",
      "type": "bytes",
      "value": "[114, 111, 108, 101, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "WEI6",
      "type": "u64",
      "value": "1_000_000"
    }
  ],
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setRole",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "role",
          "type": {
            "defined": "Role"
          }
        }
      ]
    },
    {
      "name": "updateConfig",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "feeRefund",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "feeSettle",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "feeWallet",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "createToken",
      "accounts": [
        {
          "name": "tokenConfigAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u16"
        },
        {
          "name": "settleDuration",
          "type": "i64"
        },
        {
          "name": "pledgeRate",
          "type": "u64"
        },
        {
          "name": "category",
          "type": {
            "defined": "TokenCategory"
          }
        }
      ]
    },
    {
      "name": "updateTokenConfig",
      "accounts": [
        {
          "name": "tokenConfigAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "status",
          "type": {
            "option": {
              "defined": "TokenStatus"
            }
          }
        },
        {
          "name": "settleDuration",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "pledgeRate",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "settleRate",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "feeRefund",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "feeSettle",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "updateTokenAddress",
      "accounts": [
        {
          "name": "tokenConfigAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setExToken",
      "accounts": [
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "isAccepted",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createOffer",
      "accounts": [
        {
          "name": "offerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "offerType",
          "type": {
            "defined": "OfferType"
          }
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "isFullMatch",
          "type": "bool"
        },
        {
          "name": "id",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fillOffer",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "id",
          "type": "u64"
        }
      ]
    },
    {
      "name": "settleOrder",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sellerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "RECOMMEND CHECK AND INIT ASSOCIATED TOKEN"
          ]
        },
        {
          "name": "feeTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "RECOMMEND CHECK AND INIT ASSOCIATED TOKEN"
          ]
        },
        {
          "name": "token",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "settleOrderWithDiscount",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sellerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "RECOMMEND CHECK AND INIT ASSOCIATED TOKEN"
          ]
        },
        {
          "name": "feeTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "RECOMMEND CHECK AND INIT ASSOCIATED TOKEN"
          ]
        },
        {
          "name": "token",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "buyerFeeDiscount",
          "type": "u64"
        },
        {
          "name": "sellerFeeDiscount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "settleTwoStepOrder",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeUnFullFilledOffer",
      "accounts": [
        {
          "name": "offerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "cancelUnFilledOrder",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "cancelUnFilledOrderWithDiscount",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "buyerFeeDiscount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelOrder",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sellerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "offerAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "reallocTokenConfig",
      "accounts": [
        {
          "name": "tokenConfigAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "tokenToSettlePhase",
      "accounts": [
        {
          "name": "tokenConfigAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "settleRate",
          "type": {
            "option": "u64"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "configAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "feeRefund",
            "type": "u64"
          },
          {
            "name": "feeSettle",
            "type": "u64"
          },
          {
            "name": "feeWallet",
            "type": "publicKey"
          },
          {
            "name": "lastOfferId",
            "type": "u64"
          },
          {
            "name": "lastOrderId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "exTokenAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "isAccepted",
            "type": "bool"
          },
          {
            "name": "token",
            "type": "publicKey"
          },
          {
            "name": "config",
            "type": "publicKey"
          },
          {
            "name": "vaultToken",
            "type": "publicKey"
          },
          {
            "name": "vaultTokenBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "offerAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "offerType",
            "type": {
              "defined": "OfferType"
            }
          },
          {
            "name": "tokenConfig",
            "type": "publicKey"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "exToken",
            "type": "publicKey"
          },
          {
            "name": "collateral",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "OfferStatus"
            }
          },
          {
            "name": "filledAmount",
            "type": "u64"
          },
          {
            "name": "isFullMatch",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "orderAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "config",
            "type": "publicKey"
          },
          {
            "name": "offer",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "seller",
            "type": "publicKey"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": {
              "defined": "OrderStatus"
            }
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "roleAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "configAccount",
            "type": "publicKey"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "role",
            "type": {
              "defined": "Role"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tokenConfigAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "id",
            "type": "u16"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "settleTime",
            "type": "i64"
          },
          {
            "name": "settleDuration",
            "type": "i64"
          },
          {
            "name": "pledgeRate",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "TokenStatus"
            }
          },
          {
            "name": "token",
            "type": "publicKey"
          },
          {
            "name": "config",
            "type": "publicKey"
          },
          {
            "name": "vaultToken",
            "type": "publicKey"
          },
          {
            "name": "vaultTokenBump",
            "type": "u8"
          },
          {
            "name": "settleRate",
            "type": "u64"
          },
          {
            "name": "category",
            "type": {
              "defined": "TokenCategory"
            }
          },
          {
            "name": "feeRefund",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "feeSettle",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OfferType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Buy"
          },
          {
            "name": "Sell"
          }
        ]
      }
    },
    {
      "name": "OfferStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "Closed"
          }
        ]
      }
    },
    {
      "name": "OrderStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "Closed"
          },
          {
            "name": "Cancelled"
          }
        ]
      }
    },
    {
      "name": "Role",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Operator"
          },
          {
            "name": "Admin"
          },
          {
            "name": "SettleVerifier"
          },
          {
            "name": "CancelOrder"
          }
        ]
      }
    },
    {
      "name": "TokenStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Settle"
          },
          {
            "name": "Inactive"
          }
        ]
      }
    },
    {
      "name": "TokenCategory",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Point"
          },
          {
            "name": "PreMarket"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "InitializedEvent",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "feeWallet",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "feeRefund",
          "type": "u64",
          "index": false
        },
        {
          "name": "feeSettle",
          "type": "u64",
          "index": false
        },
        {
          "name": "version",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "CreatedOfferEvent",
      "fields": [
        {
          "name": "id",
          "type": "u64",
          "index": false
        },
        {
          "name": "offerType",
          "type": {
            "defined": "OfferType"
          },
          "index": false
        },
        {
          "name": "tokenConfig",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tokenConfigId",
          "type": "u16",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "price",
          "type": "u64",
          "index": false
        },
        {
          "name": "exToken",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "value",
          "type": "u64",
          "index": false
        },
        {
          "name": "collateral",
          "type": "u64",
          "index": false
        },
        {
          "name": "isFullMatch",
          "type": "bool",
          "index": false
        },
        {
          "name": "offerBy",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "version",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "CreatedOrderEvent",
      "fields": [
        {
          "name": "id",
          "type": "u64",
          "index": false
        },
        {
          "name": "offer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offerId",
          "type": "u64",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "seller",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "buyer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "version",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "CreatedTokenEvent",
      "fields": [
        {
          "name": "id",
          "type": "u16",
          "index": false
        },
        {
          "name": "tokenConfig",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "settleDuration",
          "type": "i64",
          "index": false
        },
        {
          "name": "pledgeRate",
          "type": "u64",
          "index": false
        },
        {
          "name": "version",
          "type": "u8",
          "index": false
        },
        {
          "name": "category",
          "type": {
            "defined": "TokenCategory"
          },
          "index": false
        }
      ]
    },
    {
      "name": "UpdatedTokenEvent",
      "fields": [
        {
          "name": "id",
          "type": "u16",
          "index": false
        },
        {
          "name": "tokenConfig",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "settleDuration",
          "type": "i64",
          "index": false
        },
        {
          "name": "pledgeRate",
          "type": "u64",
          "index": false
        },
        {
          "name": "status",
          "type": {
            "defined": "TokenStatus"
          },
          "index": false
        }
      ]
    },
    {
      "name": "UpdatedTokenAddressEvent",
      "fields": [
        {
          "name": "id",
          "type": "u16",
          "index": false
        },
        {
          "name": "tokenConfig",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "token",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateAcceptedTokenEvent",
      "fields": [
        {
          "name": "exToken",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "isAccepted",
          "type": "bool",
          "index": false
        },
        {
          "name": "version",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "SettledOrderEvent",
      "fields": [
        {
          "name": "orderId",
          "type": "u64",
          "index": false
        },
        {
          "name": "order",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offerId",
          "type": "u64",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "collateral",
          "type": "u64",
          "index": false
        },
        {
          "name": "value",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "SettledTwoStepOrderEvent",
      "fields": [
        {
          "name": "orderId",
          "type": "u64",
          "index": false
        },
        {
          "name": "order",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offerId",
          "type": "u64",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "collateral",
          "type": "u64",
          "index": false
        },
        {
          "name": "value",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "CancelledOrderEvent",
      "fields": [
        {
          "name": "orderId",
          "type": "u64",
          "index": false
        },
        {
          "name": "order",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offerId",
          "type": "u64",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "collateral",
          "type": "u64",
          "index": false
        },
        {
          "name": "value",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ClosedOfferEvent",
      "fields": [
        {
          "name": "offerId",
          "type": "u64",
          "index": false
        },
        {
          "name": "offer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "refundAmount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "SetRoleEvent",
      "fields": [
        {
          "name": "configAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "role",
          "type": {
            "defined": "Role"
          },
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "FeeRefundTooHigh",
      "msg": "Fee Refund <= 10%"
    },
    {
      "code": 6001,
      "name": "FeeSettleTooHigh",
      "msg": "Settle Fee <= 10%"
    },
    {
      "code": 6002,
      "name": "SettleDurationTooShort",
      "msg": "Minimum 24h for settling"
    },
    {
      "code": 6003,
      "name": "TokenAddressNotSet",
      "msg": "Token Address Not Set"
    },
    {
      "code": 6004,
      "name": "TokenStatusInvalid",
      "msg": "Token Status Invalid"
    },
    {
      "code": 6005,
      "name": "EXTokenNotAccepted",
      "msg": "Exchange Token Not Accepted"
    },
    {
      "code": 6006,
      "name": "InsufficientFunds",
      "msg": "Insufficient Funds"
    },
    {
      "code": 6007,
      "name": "PriceInvalid",
      "msg": "Price Invalid"
    },
    {
      "code": 6008,
      "name": "InsufficientAllocations",
      "msg": "Insufficient Allocations"
    },
    {
      "code": 6009,
      "name": "FullMatchRequired",
      "msg": "FullMatch required"
    },
    {
      "code": 6010,
      "name": "EXTokenMismatch",
      "msg": "Invalid Offer Token"
    },
    {
      "code": 6011,
      "name": "OfferStatusInvalid",
      "msg": "Offer Status Invalid"
    },
    {
      "code": 6012,
      "name": "SettlingTimeNotStarted",
      "msg": "Settling Time Not Started"
    },
    {
      "code": 6013,
      "name": "SellerOnly",
      "msg": "Seller Only"
    },
    {
      "code": 6014,
      "name": "TokenMismatch",
      "msg": "Token Invalid"
    },
    {
      "code": 6015,
      "name": "OfferMismatch",
      "msg": "Offer Mismatch"
    },
    {
      "code": 6016,
      "name": "TokenConfigMismatch",
      "msg": "Token Config Mismatch"
    },
    {
      "code": 6017,
      "name": "ConfigMismatch",
      "msg": "Config Mismatch"
    },
    {
      "code": 6018,
      "name": "SellerInvalid",
      "msg": "Seller Invalid"
    },
    {
      "code": 6019,
      "name": "BuyerInvalid",
      "msg": "Buyer Invalid"
    },
    {
      "code": 6020,
      "name": "OrderStatusInvalid",
      "msg": "Order Status Invalid"
    },
    {
      "code": 6021,
      "name": "FeeWalletMismatch",
      "msg": "Fee Wallet Mismatch"
    },
    {
      "code": 6022,
      "name": "AuthorityInvalid",
      "msg": "Authority Invalid"
    },
    {
      "code": 6023,
      "name": "OfferAlreadyFilled",
      "msg": "Offer Already Filled"
    },
    {
      "code": 6024,
      "name": "SettlingTimeNotEndedYet",
      "msg": "Settling Time Not Ended Yet"
    },
    {
      "code": 6025,
      "name": "InvalidAmount",
      "msg": "Invalid Amount"
    },
    {
      "code": 6026,
      "name": "MintIsNotOwnedByTokenProgram",
      "msg": "Mint is not owned by token program"
    },
    {
      "code": 6027,
      "name": "OrderAuthorityInvalid",
      "msg": "Order Authority Invalid"
    },
    {
      "code": 6028,
      "name": "SettleRateInvalid",
      "msg": "Settle Rate Invalid"
    },
    {
      "code": 6029,
      "name": "TokenCategoryInvalid",
      "msg": "Token Category Invalid"
    },
    {
      "code": 6030,
      "name": "InvalidRole",
      "msg": "Invalid role"
    },
    {
      "code": 6031,
      "name": "InvalidMintAddress",
      "msg": "Invalid mint address"
    },
    {
      "code": 6032,
      "name": "InvalidDiscount",
      "msg": "Discount rate must between 0% and 100%"
    }
  ]
};

export const IDL: PreMarketType = {
  "version": "0.1.0",
  "name": "pre_market",
  "constants": [
    {
      "name": "CONFIG_PDA_SEED",
      "type": "bytes",
      "value": "[99, 111, 110, 102, 105, 103, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "TOKEN_PDA_SEED",
      "type": "bytes",
      "value": "[116, 111, 107, 101, 110, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "VAULT_TOKEN_PDA_SEED",
      "type": "bytes",
      "value": "[118, 97, 117, 108, 116, 95, 116, 111, 107, 101, 110, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "EX_TOKEN_PDA_SEED",
      "type": "bytes",
      "value": "[101, 120, 95, 116, 111, 107, 101, 110, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "OFFER_PDA_SEED",
      "type": "bytes",
      "value": "[111, 102, 102, 101, 114, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "ORDER_PDA_SEED",
      "type": "bytes",
      "value": "[111, 114, 100, 101, 114, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "ROLE_PDA_SEED",
      "type": "bytes",
      "value": "[114, 111, 108, 101, 95, 112, 100, 97, 95, 115, 101, 101, 100]"
    },
    {
      "name": "WEI6",
      "type": "u64",
      "value": "1_000_000"
    }
  ],
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setRole",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "role",
          "type": {
            "defined": "Role"
          }
        }
      ]
    },
    {
      "name": "updateConfig",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "feeRefund",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "feeSettle",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "feeWallet",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "createToken",
      "accounts": [
        {
          "name": "tokenConfigAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u16"
        },
        {
          "name": "settleDuration",
          "type": "i64"
        },
        {
          "name": "pledgeRate",
          "type": "u64"
        },
        {
          "name": "category",
          "type": {
            "defined": "TokenCategory"
          }
        }
      ]
    },
    {
      "name": "updateTokenConfig",
      "accounts": [
        {
          "name": "tokenConfigAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "status",
          "type": {
            "option": {
              "defined": "TokenStatus"
            }
          }
        },
        {
          "name": "settleDuration",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "pledgeRate",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "settleRate",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "feeRefund",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "feeSettle",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "updateTokenAddress",
      "accounts": [
        {
          "name": "tokenConfigAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setExToken",
      "accounts": [
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "isAccepted",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createOffer",
      "accounts": [
        {
          "name": "offerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "offerType",
          "type": {
            "defined": "OfferType"
          }
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "isFullMatch",
          "type": "bool"
        },
        {
          "name": "id",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fillOffer",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "id",
          "type": "u64"
        }
      ]
    },
    {
      "name": "settleOrder",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sellerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "RECOMMEND CHECK AND INIT ASSOCIATED TOKEN"
          ]
        },
        {
          "name": "feeTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "RECOMMEND CHECK AND INIT ASSOCIATED TOKEN"
          ]
        },
        {
          "name": "token",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "settleOrderWithDiscount",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sellerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "RECOMMEND CHECK AND INIT ASSOCIATED TOKEN"
          ]
        },
        {
          "name": "feeTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "RECOMMEND CHECK AND INIT ASSOCIATED TOKEN"
          ]
        },
        {
          "name": "token",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "buyerFeeDiscount",
          "type": "u64"
        },
        {
          "name": "sellerFeeDiscount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "settleTwoStepOrder",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeUnFullFilledOffer",
      "accounts": [
        {
          "name": "offerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "cancelUnFilledOrder",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "cancelUnFilledOrderWithDiscount",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "buyerFeeDiscount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelOrder",
      "accounts": [
        {
          "name": "orderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenConfigAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sellerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "offerAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "reallocTokenConfig",
      "accounts": [
        {
          "name": "tokenConfigAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "tokenToSettlePhase",
      "accounts": [
        {
          "name": "tokenConfigAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "configAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "settleRate",
          "type": {
            "option": "u64"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "configAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "feeRefund",
            "type": "u64"
          },
          {
            "name": "feeSettle",
            "type": "u64"
          },
          {
            "name": "feeWallet",
            "type": "publicKey"
          },
          {
            "name": "lastOfferId",
            "type": "u64"
          },
          {
            "name": "lastOrderId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "exTokenAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "isAccepted",
            "type": "bool"
          },
          {
            "name": "token",
            "type": "publicKey"
          },
          {
            "name": "config",
            "type": "publicKey"
          },
          {
            "name": "vaultToken",
            "type": "publicKey"
          },
          {
            "name": "vaultTokenBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "offerAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "offerType",
            "type": {
              "defined": "OfferType"
            }
          },
          {
            "name": "tokenConfig",
            "type": "publicKey"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "exToken",
            "type": "publicKey"
          },
          {
            "name": "collateral",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "OfferStatus"
            }
          },
          {
            "name": "filledAmount",
            "type": "u64"
          },
          {
            "name": "isFullMatch",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "orderAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "config",
            "type": "publicKey"
          },
          {
            "name": "offer",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "seller",
            "type": "publicKey"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": {
              "defined": "OrderStatus"
            }
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "roleAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "configAccount",
            "type": "publicKey"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "role",
            "type": {
              "defined": "Role"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tokenConfigAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "id",
            "type": "u16"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "settleTime",
            "type": "i64"
          },
          {
            "name": "settleDuration",
            "type": "i64"
          },
          {
            "name": "pledgeRate",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "TokenStatus"
            }
          },
          {
            "name": "token",
            "type": "publicKey"
          },
          {
            "name": "config",
            "type": "publicKey"
          },
          {
            "name": "vaultToken",
            "type": "publicKey"
          },
          {
            "name": "vaultTokenBump",
            "type": "u8"
          },
          {
            "name": "settleRate",
            "type": "u64"
          },
          {
            "name": "category",
            "type": {
              "defined": "TokenCategory"
            }
          },
          {
            "name": "feeRefund",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "feeSettle",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OfferType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Buy"
          },
          {
            "name": "Sell"
          }
        ]
      }
    },
    {
      "name": "OfferStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "Closed"
          }
        ]
      }
    },
    {
      "name": "OrderStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "Closed"
          },
          {
            "name": "Cancelled"
          }
        ]
      }
    },
    {
      "name": "Role",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Operator"
          },
          {
            "name": "Admin"
          },
          {
            "name": "SettleVerifier"
          },
          {
            "name": "CancelOrder"
          }
        ]
      }
    },
    {
      "name": "TokenStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Settle"
          },
          {
            "name": "Inactive"
          }
        ]
      }
    },
    {
      "name": "TokenCategory",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Point"
          },
          {
            "name": "PreMarket"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "InitializedEvent",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "feeWallet",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "feeRefund",
          "type": "u64",
          "index": false
        },
        {
          "name": "feeSettle",
          "type": "u64",
          "index": false
        },
        {
          "name": "version",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "CreatedOfferEvent",
      "fields": [
        {
          "name": "id",
          "type": "u64",
          "index": false
        },
        {
          "name": "offerType",
          "type": {
            "defined": "OfferType"
          },
          "index": false
        },
        {
          "name": "tokenConfig",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tokenConfigId",
          "type": "u16",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "price",
          "type": "u64",
          "index": false
        },
        {
          "name": "exToken",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "value",
          "type": "u64",
          "index": false
        },
        {
          "name": "collateral",
          "type": "u64",
          "index": false
        },
        {
          "name": "isFullMatch",
          "type": "bool",
          "index": false
        },
        {
          "name": "offerBy",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "version",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "CreatedOrderEvent",
      "fields": [
        {
          "name": "id",
          "type": "u64",
          "index": false
        },
        {
          "name": "offer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offerId",
          "type": "u64",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "seller",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "buyer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "version",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "CreatedTokenEvent",
      "fields": [
        {
          "name": "id",
          "type": "u16",
          "index": false
        },
        {
          "name": "tokenConfig",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "settleDuration",
          "type": "i64",
          "index": false
        },
        {
          "name": "pledgeRate",
          "type": "u64",
          "index": false
        },
        {
          "name": "version",
          "type": "u8",
          "index": false
        },
        {
          "name": "category",
          "type": {
            "defined": "TokenCategory"
          },
          "index": false
        }
      ]
    },
    {
      "name": "UpdatedTokenEvent",
      "fields": [
        {
          "name": "id",
          "type": "u16",
          "index": false
        },
        {
          "name": "tokenConfig",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "settleDuration",
          "type": "i64",
          "index": false
        },
        {
          "name": "pledgeRate",
          "type": "u64",
          "index": false
        },
        {
          "name": "status",
          "type": {
            "defined": "TokenStatus"
          },
          "index": false
        }
      ]
    },
    {
      "name": "UpdatedTokenAddressEvent",
      "fields": [
        {
          "name": "id",
          "type": "u16",
          "index": false
        },
        {
          "name": "tokenConfig",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "token",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateAcceptedTokenEvent",
      "fields": [
        {
          "name": "exToken",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "isAccepted",
          "type": "bool",
          "index": false
        },
        {
          "name": "version",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "SettledOrderEvent",
      "fields": [
        {
          "name": "orderId",
          "type": "u64",
          "index": false
        },
        {
          "name": "order",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offerId",
          "type": "u64",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "collateral",
          "type": "u64",
          "index": false
        },
        {
          "name": "value",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "SettledTwoStepOrderEvent",
      "fields": [
        {
          "name": "orderId",
          "type": "u64",
          "index": false
        },
        {
          "name": "order",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offerId",
          "type": "u64",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "collateral",
          "type": "u64",
          "index": false
        },
        {
          "name": "value",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "CancelledOrderEvent",
      "fields": [
        {
          "name": "orderId",
          "type": "u64",
          "index": false
        },
        {
          "name": "order",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "offerId",
          "type": "u64",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "collateral",
          "type": "u64",
          "index": false
        },
        {
          "name": "value",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ClosedOfferEvent",
      "fields": [
        {
          "name": "offerId",
          "type": "u64",
          "index": false
        },
        {
          "name": "offer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "refundAmount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "SetRoleEvent",
      "fields": [
        {
          "name": "configAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "role",
          "type": {
            "defined": "Role"
          },
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "FeeRefundTooHigh",
      "msg": "Fee Refund <= 10%"
    },
    {
      "code": 6001,
      "name": "FeeSettleTooHigh",
      "msg": "Settle Fee <= 10%"
    },
    {
      "code": 6002,
      "name": "SettleDurationTooShort",
      "msg": "Minimum 24h for settling"
    },
    {
      "code": 6003,
      "name": "TokenAddressNotSet",
      "msg": "Token Address Not Set"
    },
    {
      "code": 6004,
      "name": "TokenStatusInvalid",
      "msg": "Token Status Invalid"
    },
    {
      "code": 6005,
      "name": "EXTokenNotAccepted",
      "msg": "Exchange Token Not Accepted"
    },
    {
      "code": 6006,
      "name": "InsufficientFunds",
      "msg": "Insufficient Funds"
    },
    {
      "code": 6007,
      "name": "PriceInvalid",
      "msg": "Price Invalid"
    },
    {
      "code": 6008,
      "name": "InsufficientAllocations",
      "msg": "Insufficient Allocations"
    },
    {
      "code": 6009,
      "name": "FullMatchRequired",
      "msg": "FullMatch required"
    },
    {
      "code": 6010,
      "name": "EXTokenMismatch",
      "msg": "Invalid Offer Token"
    },
    {
      "code": 6011,
      "name": "OfferStatusInvalid",
      "msg": "Offer Status Invalid"
    },
    {
      "code": 6012,
      "name": "SettlingTimeNotStarted",
      "msg": "Settling Time Not Started"
    },
    {
      "code": 6013,
      "name": "SellerOnly",
      "msg": "Seller Only"
    },
    {
      "code": 6014,
      "name": "TokenMismatch",
      "msg": "Token Invalid"
    },
    {
      "code": 6015,
      "name": "OfferMismatch",
      "msg": "Offer Mismatch"
    },
    {
      "code": 6016,
      "name": "TokenConfigMismatch",
      "msg": "Token Config Mismatch"
    },
    {
      "code": 6017,
      "name": "ConfigMismatch",
      "msg": "Config Mismatch"
    },
    {
      "code": 6018,
      "name": "SellerInvalid",
      "msg": "Seller Invalid"
    },
    {
      "code": 6019,
      "name": "BuyerInvalid",
      "msg": "Buyer Invalid"
    },
    {
      "code": 6020,
      "name": "OrderStatusInvalid",
      "msg": "Order Status Invalid"
    },
    {
      "code": 6021,
      "name": "FeeWalletMismatch",
      "msg": "Fee Wallet Mismatch"
    },
    {
      "code": 6022,
      "name": "AuthorityInvalid",
      "msg": "Authority Invalid"
    },
    {
      "code": 6023,
      "name": "OfferAlreadyFilled",
      "msg": "Offer Already Filled"
    },
    {
      "code": 6024,
      "name": "SettlingTimeNotEndedYet",
      "msg": "Settling Time Not Ended Yet"
    },
    {
      "code": 6025,
      "name": "InvalidAmount",
      "msg": "Invalid Amount"
    },
    {
      "code": 6026,
      "name": "MintIsNotOwnedByTokenProgram",
      "msg": "Mint is not owned by token program"
    },
    {
      "code": 6027,
      "name": "OrderAuthorityInvalid",
      "msg": "Order Authority Invalid"
    },
    {
      "code": 6028,
      "name": "SettleRateInvalid",
      "msg": "Settle Rate Invalid"
    },
    {
      "code": 6029,
      "name": "TokenCategoryInvalid",
      "msg": "Token Category Invalid"
    },
    {
      "code": 6030,
      "name": "InvalidRole",
      "msg": "Invalid role"
    },
    {
      "code": 6031,
      "name": "InvalidMintAddress",
      "msg": "Invalid mint address"
    },
    {
      "code": 6032,
      "name": "InvalidDiscount",
      "msg": "Discount rate must between 0% and 100%"
    }
  ]
};
