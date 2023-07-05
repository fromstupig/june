import {getAssociatedTokenAddress, TOKEN_PROGRAM_ID} from '@solana/spl-token';
import {BN, Idl, Program, Provider, Wallet, web3} from "@coral-xyz/anchor";
import {PublicKey} from "@solana/web3.js";

export class JunePoolProxy {
    private readonly connection: web3.Connection;
    private readonly provider: Provider;

    public static POOL_SEED = Buffer.from("pool");
    public static POOL_JUNE_SEED = Buffer.from("pool-june");

    constructor(
        public readonly program: Program<Idl>,
        private readonly wallet: Wallet
    ) {
        this.connection = this.program.provider.connection;
        this.provider = this.program.provider;
    }

    public async getPoolAccount() {
        return web3.PublicKey.findProgramAddressSync(
            [JunePoolProxy.POOL_SEED, (new PublicKey(process.env.OWNER || '')).toBuffer()],
            this.program.programId
        )
    }

    public async getPoolJuneTokenAccount(poolAccount: web3.PublicKey) {
        return web3.PublicKey.findProgramAddressSync(
            [JunePoolProxy.POOL_JUNE_SEED, poolAccount.toBuffer()],
            this.program.programId
        )
    }

    public async initializePool(params: {
        juneToken: web3.PublicKey,
        swapRate: BN,
        solAmount: BN,
        juneAmount: BN,
    }) {
        const [poolAccount] = await this.getPoolAccount();
        const [poolJuneTokenAccount] = await this.getPoolJuneTokenAccount(
            poolAccount
        );

        const signerTokenAccount = await getAssociatedTokenAddress(
            params.juneToken,
            this.wallet.publicKey
        );

        return await this.program.methods.initialize(
            params.swapRate,
            params.solAmount,
            params.juneAmount
        ).accounts({
            signer: this.wallet.publicKey,
            signerTokenAccount,
            poolAccount,
            poolJuneTokenAccount,
            juneToken: params.juneToken,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: web3.SYSVAR_RENT_PUBKEY
        }).rpc();
    }

    public async addLiquidity(params: {
        juneToken: web3.PublicKey,
        solAmount: BN,
        juneAmount: BN,
    }) {
        const [poolAccount] = await this.getPoolAccount();
        const [poolJuneTokenAccount] = await this.getPoolJuneTokenAccount(
            poolAccount
        );

        const poolAccountInfo =
            await this.program.account["pool"].fetch(poolAccount.toBase58());

        const signerTokenAccount = await getAssociatedTokenAddress(
            poolAccountInfo.juneToken as PublicKey,
            this.wallet.publicKey
        );

        return await this.program.methods.addLiquidity(
            params.solAmount,
            params.juneAmount
        ).accounts({
            signer: this.wallet.publicKey,
            signerTokenAccount,
            poolAccount,
            poolJuneTokenAccount,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).rpc();
    }

    public async swapSolToJune(params: {
        lamports: BN,
    }) {
        const [poolAccount] = await this.getPoolAccount();
        const [poolJuneTokenAccount] = await this.getPoolJuneTokenAccount(
            poolAccount
        );

        const poolAccountInfo =
            await this.program.account["pool"].fetch(process.env.POOL_ACCOUNT || '');

        const signerTokenAccount = await getAssociatedTokenAddress(
            poolAccountInfo.juneToken as PublicKey,
            this.wallet.publicKey
        );

        return await this.program.methods.swapSolToJune(
            params.lamports,
        ).accounts({
            signer: this.wallet.publicKey,
            signerTokenAccount,
            poolAccount,
            poolJuneTokenAccount,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).rpc();
    }

    public async swapJuneToSol(params: {
        amount: BN,
    }) {
        const [poolAccount] = await this.getPoolAccount();
        const [poolJuneTokenAccount] = await this.getPoolJuneTokenAccount(
            poolAccount
        );

        const poolAccountInfo =
            await this.program.account["pool"].fetch(process.env.POOL_ACCOUNT || '');

        const signerTokenAccount = await getAssociatedTokenAddress(
            poolAccountInfo.juneToken as PublicKey,
            this.wallet.publicKey
        );

        return await this.program.methods.swapJuneToSol(
            params.amount,
        ).accounts({
            signer: this.wallet.publicKey,
            signerTokenAccount,
            poolAccount,
            poolJuneTokenAccount,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).rpc();
    }
}
