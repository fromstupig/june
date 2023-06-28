import {Idl} from "@coral-xyz/anchor";

export type June = {
    "version": "0.1.0",
    "name": "june",
    "instructions": [
        {
            "name": "initialize",
            "accounts": [
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "signerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolJuneTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "juneToken",
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
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "swapRate",
                    "type": "u64"
                },
                {
                    "name": "lamports",
                    "type": "u64"
                },
                {
                    "name": "amount",
                    "type": "u64"
                }
            ],
            "returns": null
        },
        {
            "name": "addLiquidity",
            "accounts": [
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "signerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolJuneTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "lamports",
                    "type": "u64"
                },
                {
                    "name": "amount",
                    "type": "u64"
                }
            ],
            "returns": null
        },
        {
            "name": "swapSolToJune",
            "accounts": [
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "signerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolJuneTokenAccount",
                    "isMut": true,
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
                    "name": "lamports",
                    "type": "u64"
                }
            ],
            "returns": null
        },
        {
            "name": "swapJuneToSol",
            "accounts": [
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "signerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolJuneTokenAccount",
                    "isMut": true,
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
                }
            ],
            "returns": null
        },
        {
            "name": "setSwapRate",
            "accounts": [
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "poolAccount",
                    "isMut": true,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "rate",
                    "type": "u64"
                }
            ],
            "returns": null
        }
    ],
    "accounts": [
        {
            "name": "pool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "owner",
                        "type": "publicKey"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "juneToken",
                        "type": "publicKey"
                    },
                    {
                        "name": "juneTokenAccountBump",
                        "type": "u8"
                    },
                    {
                        "name": "juneTotalSupply",
                        "type": "u64"
                    },
                    {
                        "name": "solTotalSupply",
                        "type": "u64"
                    },
                    {
                        "name": "swapRate",
                        "type": "u64"
                    },
                    {
                        "name": "paused",
                        "type": "bool"
                    }
                ]
            }
        }
    ],
    "events": [
        {
            "name": "AddLiquidityEvent",
            "fields": [
                {
                    "name": "lamports",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "amount",
                    "type": "u64",
                    "index": false
                }
            ]
        },
        {
            "name": "SetSwapRateEvent",
            "fields": [
                {
                    "name": "rate",
                    "type": "u64",
                    "index": false
                }
            ]
        },
        {
            "name": "SOLToSplEvent",
            "fields": [
                {
                    "name": "lamports",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "amount",
                    "type": "u64",
                    "index": false
                }
            ]
        },
        {
            "name": "SplToSOLEvent",
            "fields": [
                {
                    "name": "amount",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "solAmount",
                    "type": "u64",
                    "index": false
                }
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "InsufficientSOLBalance",
            "msg": "Insufficient SOL balance"
        },
        {
            "code": 6001,
            "name": "InsufficientJUNEBalance",
            "msg": "Insufficient JUNE balance"
        },
        {
            "code": 6002,
            "name": "MustBePoolOwner",
            "msg": "Must be pool owner"
        },
        {
            "code": 6003,
            "name": "ZeroLiquidity",
            "msg": "Liquidity must greater than 0"
        },
        {
            "code": 6004,
            "name": "ZeroSwap",
            "msg": "Swap value must greater than 0"
        },
        {
            "code": 6005,
            "name": "InvalidSwapRate",
            "msg": "Invalid swap rate"
        }
    ]
};

export const IDL: Idl = {
    "version": "0.1.0",
    "name": "june",
    "instructions": [
        {
            "name": "initialize",
            "accounts": [
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "signerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolJuneTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "juneToken",
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
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "swapRate",
                    "type": "u64"
                },
                {
                    "name": "lamports",
                    "type": "u64"
                },
                {
                    "name": "amount",
                    "type": "u64"
                }
            ],
            "returns": undefined
        },
        {
            "name": "addLiquidity",
            "accounts": [
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "signerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolJuneTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "lamports",
                    "type": "u64"
                },
                {
                    "name": "amount",
                    "type": "u64"
                }
            ],
            "returns": undefined
        },
        {
            "name": "swapSolToJune",
            "accounts": [
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "signerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolJuneTokenAccount",
                    "isMut": true,
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
                    "name": "lamports",
                    "type": "u64"
                }
            ],
            "returns": undefined
        },
        {
            "name": "swapJuneToSol",
            "accounts": [
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "signerTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolJuneTokenAccount",
                    "isMut": true,
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
                }
            ],
            "returns": undefined
        },
        {
            "name": "setSwapRate",
            "accounts": [
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "poolAccount",
                    "isMut": true,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "rate",
                    "type": "u64"
                }
            ],
            "returns": undefined
        }
    ],
    "accounts": [
        {
            "name": "pool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "owner",
                        "type": "publicKey"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "juneToken",
                        "type": "publicKey"
                    },
                    {
                        "name": "juneTokenAccountBump",
                        "type": "u8"
                    },
                    {
                        "name": "juneTotalSupply",
                        "type": "u64"
                    },
                    {
                        "name": "solTotalSupply",
                        "type": "u64"
                    },
                    {
                        "name": "swapRate",
                        "type": "u64"
                    },
                    {
                        "name": "paused",
                        "type": "bool"
                    }
                ]
            }
        }
    ],
    "events": [
        {
            "name": "AddLiquidityEvent",
            "fields": [
                {
                    "name": "lamports",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "amount",
                    "type": "u64",
                    "index": false
                }
            ]
        },
        {
            "name": "SetSwapRateEvent",
            "fields": [
                {
                    "name": "rate",
                    "type": "u64",
                    "index": false
                }
            ]
        },
        {
            "name": "SOLToSplEvent",
            "fields": [
                {
                    "name": "lamports",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "amount",
                    "type": "u64",
                    "index": false
                }
            ]
        },
        {
            "name": "SplToSOLEvent",
            "fields": [
                {
                    "name": "amount",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "solAmount",
                    "type": "u64",
                    "index": false
                }
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "InsufficientSOLBalance",
            "msg": "Insufficient SOL balance"
        },
        {
            "code": 6001,
            "name": "InsufficientJUNEBalance",
            "msg": "Insufficient JUNE balance"
        },
        {
            "code": 6002,
            "name": "MustBePoolOwner",
            "msg": "Must be pool owner"
        },
        {
            "code": 6003,
            "name": "ZeroLiquidity",
            "msg": "Liquidity must greater than 0"
        },
        {
            "code": 6004,
            "name": "ZeroSwap",
            "msg": "Swap value must greater than 0"
        },
        {
            "code": 6005,
            "name": "InvalidSwapRate",
            "msg": "Invalid swap rate"
        }
    ]
};
