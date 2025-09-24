/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/vesting.json`.
 */
export type Vesting = {
  "address": "5wQXgugM9ch9r6VFUDEsZHC5gajURZye8x2mAAW9kaE1",
  "metadata": {
    "name": "vesting",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimTokens",
      "discriminator": [
        108,
        216,
        210,
        231,
        0,
        212,
        42,
        64
      ],
      "accounts": [
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "beneficiary",
          "writable": true,
          "signer": true,
          "relations": [
            "employeeAccount"
          ]
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "mint",
          "relations": [
            "vestingAccount"
          ]
        },
        {
          "name": "beneficiaryTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "beneficiary"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vestingAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  115,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "companyId"
              }
            ]
          },
          "relations": [
            "employeeAccount"
          ]
        },
        {
          "name": "employeeAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  109,
                  112,
                  108,
                  111,
                  121,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "vestingAccount"
              },
              {
                "kind": "account",
                "path": "beneficiary"
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vestingAccount"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          },
          "relations": [
            "vestingAccount"
          ]
        },
        {
          "name": "employeeTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "beneficiary"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        }
      ],
      "args": [
        {
          "name": "companyId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createEmployee",
      "discriminator": [
        87,
        175,
        18,
        124,
        24,
        81,
        207,
        40
      ],
      "accounts": [
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "beneficiary"
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "vestingAccount"
          ]
        },
        {
          "name": "vestingAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  115,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "vesting_account.company_id",
                "account": "vesting"
              }
            ]
          }
        },
        {
          "name": "employeeAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  109,
                  112,
                  108,
                  111,
                  121,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "vestingAccount"
              },
              {
                "kind": "account",
                "path": "beneficiary"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "cliffTime",
          "type": "i64"
        },
        {
          "name": "totalAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createVesting",
      "discriminator": [
        135,
        184,
        171,
        156,
        197,
        162,
        246,
        44
      ],
      "accounts": [
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "vestingAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  115,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "companyId"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vestingAccount"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        }
      ],
      "args": [
        {
          "name": "companyId",
          "type": "u64"
        },
        {
          "name": "companyName",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "employee",
      "discriminator": [
        98,
        238,
        61,
        252,
        130,
        77,
        105,
        67
      ]
    },
    {
      "name": "vesting",
      "discriminator": [
        100,
        149,
        66,
        138,
        95,
        200,
        128,
        241
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "claimNotAvailableYet",
      "msg": "Cannot claim tokens now"
    },
    {
      "code": 6001,
      "name": "invalidVestingPeriod",
      "msg": "Vesting start timestamp should be less than end timestamp"
    },
    {
      "code": 6002,
      "name": "invalidCliffTimestamp",
      "msg": "Cliff timestamp should be less than or equal to start timestamp"
    },
    {
      "code": 6003,
      "name": "calculationOverflow",
      "msg": "Overflow during calculation"
    },
    {
      "code": 6004,
      "name": "nothingToClaim",
      "msg": "Nothing to be claimed"
    }
  ],
  "types": [
    {
      "name": "employee",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "beneficiary",
            "type": "pubkey"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "cliffTime",
            "type": "i64"
          },
          {
            "name": "vestingAccount",
            "type": "pubkey"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "totalWithdrawn",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "vesting",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "companyId",
            "type": "u64"
          },
          {
            "name": "companyName",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "treasuryTokenAccount",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "vestingAccountSeed",
      "type": "string",
      "value": "\"vesting\""
    }
  ]
};
