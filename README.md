# JUNE Token
This project is a simple smart contract which create a token (named JUNE) on Solana testnet. The main features are:
- Provide liquidity for both JUNE and SOL tokens.
- Swap between JUNE and SOL at a constant price of 10. (1 SOL = 10 JUNEs).

Program ID: `Es39nWkqB3pFEAaPFjq2UoiHpmQ2SqXjpxANrgvZzK7r` [Testnet](https://explorer.solana.com/address/Es39nWkqB3pFEAaPFjq2UoiHpmQ2SqXjpxANrgvZzK7r?cluster=testnet).
Token Mint Address: `CG26EFdBr7DuBv91b39vm7vdBxdGhMjutT8wcm2BTaU`

## Prerequisite
Rust v1.62.0
Anchor v0.24.0
Solana v1.14.18

Note: Due to [unexpected issue](https://github.com/solana-labs/solana/issues/31960) related to test on Solana current latest version (1.16.1), this project has to be downgraded to Solana v1.14.18.

## Demonstration
This is a script which generated a new account on Solana testnet, and use this account to execute swap between SOL and JUNE. The result will display at console.

```
cd june-swapper-client
EXPORT TOKEN_MINT=CG26EFdBr7DuBv91b39vm7vdBxdGhMjutT8wcm2BTaU
npm install
npm start
```