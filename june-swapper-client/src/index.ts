import { airdropSolIfNeeded, initializeKeypair } from "./initializeKeypair"
import * as web3 from "@solana/web3.js"
import {
    createAssociatedTokenAccount,
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintToChecked
} from "@solana/spl-token";
import {PublicKey} from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import {AnchorProvider, BN, Program} from "@coral-xyz/anchor";
import {IDL} from "./idl";
import {JunePoolProxy} from "./junePoolProxy";
import * as fs from "fs";

const PROGRAM_ID = process.env.PROGRAM_ID || '';

async function createJuneMint(connection: web3.Connection, payer: web3.Keypair) {
    const juneMint = await createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        9
    );
    console.log(`The JUNE mint account address is ${juneMint}`);
    return juneMint;
}

async function createJuneTokenAccount(
    connection: web3.Connection,
    payer: web3.Keypair,
    mint: web3.PublicKey,
    owner: web3.PublicKey
) {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        owner
    )

    console.log(
        `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=testnet`
    )

    return tokenAccount
}

async function initializePool(proxy: JunePoolProxy, juneToken: web3.PublicKey) {
    const sentSignature = await proxy.initializePool({
        juneToken,
        swapRate: new BN(10),
        solAmount: new BN(1_000_000_000),
        juneAmount: new BN(1_000_000_000_000),
    });

    const [poolAccount] = await proxy.getPoolAccount();
    const [poolJuneTokenAccount] = await proxy.getPoolJuneTokenAccount(poolAccount);

    const rv = {
        initializePoolSignature: sentSignature,
        poolAccount: poolAccount.toBase58(),
        poolJuneTokenAccount: poolJuneTokenAccount.toBase58()
    }
    console.log(rv);
    return rv;
}

async function addLiquidity(proxy: JunePoolProxy, juneToken: web3.PublicKey) {
    const sentSignature = await proxy.addLiquidity({
        juneToken,
        solAmount: new BN(1_000_000_000),
        juneAmount: new BN(1_000_000_000_000),
    });

    const [poolAccount] = await proxy.getPoolAccount();
    const [poolJuneTokenAccount] = await proxy.getPoolJuneTokenAccount(poolAccount);

    const rv = {
        addLiquiditySignature: sentSignature,
        poolAccount: poolAccount.toBase58(),
        poolJuneTokenAccount: poolJuneTokenAccount.toBase58()
    }

    console.log(rv);
    fs.appendFileSync('.env',`POOL_ACCOUNT=${poolAccount.toBase58()}`)
    return rv;
}


async function setup(connection: web3.Connection, payer: web3.Keypair) {
    // Mint JUNE
    const juneTokenMint = await createJuneMint(connection, payer);
    const juneTokenAccount = await createJuneTokenAccount(connection, payer, juneTokenMint, payer.publicKey);
    await mintToChecked(
        connection,
        payer,
        juneTokenMint,
        juneTokenAccount.address,
        payer,
        1_000_000_000_000_000,
        9
    );
    fs.appendFileSync('.env',`TOKEN_MINT=${juneTokenMint.toBase58()}`)

    const authorityWallet = new NodeWallet(payer);
    const provider_ = new AnchorProvider(connection, authorityWallet, {
        preflightCommitment: "processed",
        commitment: "processed"
    });

    const program = new Program(IDL, new PublicKey(PROGRAM_ID), provider_);
    const proxy = new JunePoolProxy(program, authorityWallet);

    // Initialize Pool
    const tokenMint = new PublicKey(process.env.TOKEN_MINT || '');
    await initializePool(proxy, tokenMint);

    // Add Liquidity
    await addLiquidity(proxy, tokenMint)
}

async function main() {
    const connection = new web3.Connection(web3.clusterApiUrl("testnet"));

    // enable this to setup new pool
    const payer = await initializeKeypair(connection);
    await setup(connection, payer);

    // Simulate swap function
    const user = web3.Keypair.generate()
    await airdropSolIfNeeded(user, connection)
    await airdropSolIfNeeded(user, connection)
    const tokenMint = new PublicKey(process.env.TOKEN_MINT || '');
    await createAssociatedTokenAccount(
        connection,
        user,
        tokenMint,
        user.publicKey
    );

    const userWallet = new NodeWallet(user);
    const provider_ = new AnchorProvider(connection, userWallet, {
        preflightCommitment: "processed",
        commitment: "processed"
    });

    const program = new Program(IDL, new PublicKey(PROGRAM_ID), provider_);
    const proxy = new JunePoolProxy(program, userWallet);

    // Swap SOL to JUNE
    const swapSolSignature = await proxy.swapSolToJune({
        lamports: new BN(100_000_000),
    });
    console.log(`Tx for swap from SOL to JUNE: ${swapSolSignature}`)

    // Swap JUNE to SOL
    const swapJuneSignature = await proxy.swapJuneToSol({
        amount: new BN(1_000_000_000),
    });
    console.log(`Tx for swap from JUNE to SOL: ${swapJuneSignature}`)
}

main()
    .then(() => {
        console.log("Finished successfully")
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
