import {
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import { June } from "../target/types/june";
import chai from 'chai';
import { expect } from 'chai';
import { IDL } from '../target/types/june'
import {AnchorError, BN, Program} from "@coral-xyz/anchor";
import {createAssociatedTokenAccount, createMint, mintToChecked, TOKEN_PROGRAM_ID} from '@solana/spl-token';
const SWAP_RATE = 10;

describe('june', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const program = anchor.workspace.SwapTokens as Program<June>;
  const payer = (provider.wallet as any).payer;
  const payerAccount = payer.publicKey;

  let juneToken: PublicKey;
  let payerJuneTokenAccount: PublicKey;
  let poolAccount: PublicKey;
  let poolJuneTokenAccount: PublicKey;
  let user: Keypair = anchor.web3.Keypair.generate();
  let userJuneTokenAccount: PublicKey;

  let programInstance;

  it('Is init resources', async () => {
    juneToken = await createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        9
    );

    payerJuneTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        payer,
        juneToken,
        payerAccount
    );

    await mintToChecked(
        provider.connection,
        payer,
        juneToken,
        payerJuneTokenAccount,
        payer,
        1_000_000_000_000_000, // 1M JUNE
        9
    );

    const transferSolToATx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: user.publicKey,
          lamports: LAMPORTS_PER_SOL * 10,
        })
    );
    await sendAndConfirmTransaction(connection, transferSolToATx, [payer]);

    userJuneTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        user,
        juneToken,
        user.publicKey
    );

    await mintToChecked(
        provider.connection,
        payer,
        juneToken,
        userJuneTokenAccount,
        payer,
        1_000_000_000_000, // 1000 JUNE
        9
    );
  });

  it('Failed initialize due to empty SOL', async () => {
    [poolAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), payer.publicKey.toBuffer()],
        program.programId
    );

    let [tokenAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("pool-june"), poolAccount.toBuffer()],
        program.programId
    );
    poolJuneTokenAccount = tokenAccount;

    try {
      await program.methods.initialize(
          new BN(SWAP_RATE),
          new BN(0),
          new BN(1_000_000_000),
      ).accounts({
        signer: payerAccount,
        signerTokenAccount: payerJuneTokenAccount,
        poolAccount,
        poolJuneTokenAccount,
        juneToken,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      }).rpc();

      chai.assert(false, "Program must initialize failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6001);
      expect(err.error.errorCode.code).to.equal("ZeroLiquidity");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Failed initialize due to empty JUNE', async () => {
    [poolAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), payer.publicKey.toBuffer()],
        program.programId
    );

    let [tokenAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("pool-june"), poolAccount.toBuffer()],
        program.programId
    );
    poolJuneTokenAccount = tokenAccount;

    try {
      await program.methods.initialize(
          new BN(SWAP_RATE),
          new BN(1_000_000_000),
          new BN(0),
      ).accounts({
        signer: payerAccount,
        signerTokenAccount: payerJuneTokenAccount,
        poolAccount,
        poolJuneTokenAccount,
        juneToken,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      }).rpc();

      chai.assert(false, "Program must initialize failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6001);
      expect(err.error.errorCode.code).to.equal("ZeroLiquidity");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Failed initialize due to invalid swap rate', async () => {
    [poolAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), payer.publicKey.toBuffer()],
        program.programId
    );

    let [tokenAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("pool-june"), poolAccount.toBuffer()],
        program.programId
    );
    poolJuneTokenAccount = tokenAccount;

    try {
      await program.methods.initialize(
          new BN(0),
          new BN(1_000_000_000),
          new BN(100_000_000_000),
      ).accounts({
        signer: payerAccount,
        signerTokenAccount: payerJuneTokenAccount,
        poolAccount,
        poolJuneTokenAccount,
        juneToken,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      }).rpc();

      chai.assert(false, "Program must initialize failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6003);
      expect(err.error.errorCode.code).to.equal("InvalidSwapRate");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Program must initialize successfully', async () => {
    await program.methods.initialize(
        new BN(SWAP_RATE),
        new BN(1_000_000_000),
        new BN(100_000_000_000),
    ).accounts({
      signer: payerAccount,
      signerTokenAccount: payerJuneTokenAccount,
      poolAccount,
      poolJuneTokenAccount,
      juneToken,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY
    }).rpc();
    programInstance = new Program(
        IDL,
        new PublicKey(program.programId),
        provider
    );
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('1000000000');
    expect(poolAccountInfo.juneTotalSupply.toString()).to.be.equal('100000000000');
  });

  it('Swap rate is updated successfully', async () => {
    await program.methods.setSwapRate(
        new BN(SWAP_RATE)
    ).accounts({
      signer: payerAccount,
      poolAccount
    }).rpc();
  });

  it('Only allow the owner to update swap rate', async () => {
    try {
      await program.methods.setSwapRate(
          new anchor.BN(20)
      ).accounts({
        signer: user.publicKey,
        poolAccount
      }).signers([user]).rpc();

      chai.assert(false, "Call function must be failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6007);
      expect(err.error.errorCode.code).to.equal("MustBePoolOwner");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Zero liquidity is not allowed', async () => {
    try {
      await program.methods.addLiquidity(
          new BN(0),
          new BN(0),
      ).accounts({
        signer: payerAccount,
        signerTokenAccount: payerJuneTokenAccount,
        poolAccount,
        poolJuneTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      chai.assert(false, "Call function must be failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6001);
      expect(err.error.errorCode.code).to.equal("ZeroLiquidity");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Add liquidity successfully', async () => {
    await program.methods.addLiquidity(
        new BN(1_000_000_000),
        new BN(10_000_000_000),
    ).accounts({
      signer: payerAccount,
      signerTokenAccount: payerJuneTokenAccount,
      poolAccount,
      poolJuneTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    let tokenAmount = await connection.getTokenAccountBalance(poolJuneTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('110000000000');
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('2000000000');
    expect(poolAccountInfo.juneTotalSupply.toString()).to.be.equal('110000000000');
  });

  it('Allow others than owner to add liquidity', async () => {
    await program.methods.addLiquidity(
        new BN(1_000_000_000),
        new BN(10_000_000_000),
    ).accounts({
      signer: user.publicKey,
      signerTokenAccount: userJuneTokenAccount,
      poolAccount,
      poolJuneTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([user]).rpc();

    await program.methods.addLiquidity(
        new BN(1_000_000_000),
        new BN(0),
    ).accounts({
      signer: user.publicKey,
      signerTokenAccount: userJuneTokenAccount,
      poolAccount,
      poolJuneTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([user]).rpc();

    let tokenAmount = await connection.getTokenAccountBalance(poolJuneTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('120000000000');
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('3000000000');
    expect(poolAccountInfo.juneTotalSupply.toString()).to.be.equal('120000000000');
  });


  it('Must swap SOL for June successfully', async () => {
    let juneBalanceBeforeSwap = await connection.getTokenAccountBalance(userJuneTokenAccount);
    expect(juneBalanceBeforeSwap.value.amount).to.be.equal('1000000000000');
    await program.methods.swapSolToJune(
        new BN(1_000_000_000),
    ).accounts({
      signer: user.publicKey,
      signerTokenAccount: userJuneTokenAccount,
      poolAccount,
      poolJuneTokenAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([user]).rpc();

    let juneBalanceAfterSwap = await connection.getTokenAccountBalance(userJuneTokenAccount);
    expect(juneBalanceAfterSwap.value.amount).to.be.equal('1010000000000');
    let tokenAmount = await connection.getTokenAccountBalance(poolJuneTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('110000000000');
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('4000000000');
    expect(poolAccountInfo.juneTotalSupply.toString()).to.be.equal('110000000000');
  });

  it('Must swap June for SOL successfully', async () => {
    let juneBalanceBeforeSwap = await connection.getTokenAccountBalance(userJuneTokenAccount);
    expect(juneBalanceBeforeSwap.value.amount).to.be.equal('9990000000000');
    let solBalanceBeforeSwap = await connection.getBalance(user.publicKey);
    expect(solBalanceBeforeSwap.value.amount).to.be.equal('9990000000000');
    await program.methods.swapJuneToSol(
        new BN(10_000_000_000),
    ).accounts({
      signer: user.publicKey,
      signerTokenAccount: userJuneTokenAccount,
      poolAccount,
      poolJuneTokenAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([user]).rpc();
    let solBalanceAfterSwap = await connection.getBalance(user.publicKey);
    expect(solBalanceAfterSwap.value.amount).to.be.equal('9990000000000');
    let juneBalanceAfterSwap = await connection.getTokenAccountBalance(userJuneTokenAccount);
    expect(juneBalanceAfterSwap.value.amount).to.be.equal('9989000000000');
    let tokenAmount = await connection.getTokenAccountBalance(poolJuneTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('111000000000');
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('3900000000');
    expect(poolAccountInfo.juneTotalSupply.toString()).to.be.equal('111000000000');
  });


  it('Swap token failed due to value is zero', async () => {
    try {
      await program.methods.swapSolToJune(
          new BN(0),
      ).accounts({
        signer: payerAccount,
        signerTokenAccount: payerJuneTokenAccount,
        poolAccount,
        poolJuneTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      chai.assert(false, "Swap function must be failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6002);
      expect(err.error.errorCode.code).to.equal("ZeroSwap");
      expect(err.program.equals(program.programId)).is.true;
    }

    try {
      await program.methods.swapJuneToSol(
          new BN(0),
      ).accounts({
        signer: payerAccount,
        signerTokenAccount: payerJuneTokenAccount,
        poolAccount,
        poolJuneTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      chai.assert(false, "Swap function must be failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6002);
      expect(err.error.errorCode.code).to.equal("ZeroSwap");
      expect(err.program.equals(program.programId)).is.true;
    }
  });
});
