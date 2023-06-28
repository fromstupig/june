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
import {AnchorError, AnchorProvider, BN, Program, setProvider, web3, workspace} from "@coral-xyz/anchor";
import {createAssociatedTokenAccount, createMint, mintToChecked, TOKEN_PROGRAM_ID} from '@solana/spl-token';
const SWAP_RATE = 10;

async function generateUser(authority_: web3.Keypair, tokenMint: web3.PublicKey,
                            connection_: web3.Connection) {
  let user: Keypair = web3.Keypair.generate();
  let userJuneTokenAccount: PublicKey;

  const transferSolToUserTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: authority_.publicKey,
        toPubkey: user.publicKey,
        lamports: LAMPORTS_PER_SOL * 10,
      })
  );
  await sendAndConfirmTransaction(connection_, transferSolToUserTx, [authority_]);

  userJuneTokenAccount = await createAssociatedTokenAccount(
      connection_,
      user,
      tokenMint,
      user.publicKey
  );

  await mintToChecked(
      connection_,
      authority_,
      tokenMint,
      userJuneTokenAccount,
      authority_,
      1_000_000_000_000, // 1000 JUNE
      9
  );

  return [user, userJuneTokenAccount];
}
describe('june', () => {
  const provider = AnchorProvider.env();
  setProvider(provider)
  const connection = provider.connection;
  const program = workspace.June as Program<June>;
  const payer = (provider.wallet as any).payer;
  const payerAccount = payer.publicKey;

  let juneToken: PublicKey;
  let payerJuneTokenAccount: PublicKey;
  let poolAccount: PublicKey;
  let poolJuneTokenAccount: PublicKey;

  let programInstance;

  it('Initialize test suite successfully', async () => {
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
  });

  it('Failed initialize due to empty SOL', async () => {
    [poolAccount] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), payer.publicKey.toBuffer()],
        program.programId
    );

    let [tokenAccount] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("pool-june"), poolAccount.toBuffer()],
        program.programId
    );
    poolJuneTokenAccount = tokenAccount;
    try {
      await program.methods.initialize(
          new BN(10),
          new BN(0),
          new BN(1_000_000_000),
      ).accounts({
        signer: payerAccount,
        signerTokenAccount: payerJuneTokenAccount,
        poolAccount,
        poolJuneTokenAccount,
        juneToken,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY
      }).rpc();

      chai.assert(false, "Program must initialize failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6003);
      expect(err.error.errorCode.code).to.equal("ZeroLiquidity");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Failed initialize due to empty JUNE', async () => {
    [poolAccount] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), payer.publicKey.toBuffer()],
        program.programId
    );

    let [tokenAccount] = web3.PublicKey.findProgramAddressSync(
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
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY
      }).rpc();

      chai.assert(false, "Program must initialize failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6003);
      expect(err.error.errorCode.code).to.equal("ZeroLiquidity");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Failed initialize due to invalid swap rate', async () => {
    [poolAccount] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), payer.publicKey.toBuffer()],
        program.programId
    );

    let [tokenAccount] = web3.PublicKey.findProgramAddressSync(
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
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY
      }).rpc();

      chai.assert(false, "Program must initialize failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6005);
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
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: web3.SYSVAR_RENT_PUBKEY
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
    let [user, _] = await generateUser(
        payer, juneToken, connection
    )

    try {
      await program.methods.setSwapRate(
          new BN(20)
      ).accounts({
        signer: user.publicKey,
        poolAccount
      }).signers([user]).rpc();

      chai.assert(false, "Call function must be failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6002);
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
        systemProgram: web3.SystemProgram.programId,
      }).rpc();

      chai.assert(false, "Call function must be failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6003);
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
      systemProgram: web3.SystemProgram.programId,
    }).rpc();
    let tokenAmount = await connection.getTokenAccountBalance(poolJuneTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('110000000000');
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('2000000000');
    expect(poolAccountInfo.juneTotalSupply.toString()).to.be.equal('110000000000');
  });

  it('Allow others than owner to add liquidity', async () => {
    let [user, userJuneTokenAccount] = await generateUser(
        payer, juneToken, connection
    )

    await program.methods.addLiquidity(
        new BN(1_000_000_000),
        new BN(10_000_000_000),
    ).accounts({
      signer: user.publicKey,
      signerTokenAccount: userJuneTokenAccount,
      poolAccount,
      poolJuneTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
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
      systemProgram: web3.SystemProgram.programId,
    }).signers([user]).rpc();

    let tokenAmount = await connection.getTokenAccountBalance(poolJuneTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('120000000000');
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('4000000000');
    expect(poolAccountInfo.juneTotalSupply.toString()).to.be.equal('120000000000');
  });


  it('Must swap SOL for June successfully', async () => {
    let [user, userJuneTokenAccount] = await generateUser(
        payer, juneToken, connection
    )

    let juneBalanceBeforeSwap = await connection.getTokenAccountBalance(userJuneTokenAccount);
    expect(juneBalanceBeforeSwap.value.amount).to.be.equal('1000000000000');
    await program.methods.swapSolToJune(
        new BN(1_000_000_000),
    ).accounts({
      signer: user.publicKey,
      signerTokenAccount: userJuneTokenAccount,
      poolAccount,
      poolJuneTokenAccount,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([user]).rpc();

    let juneBalanceAfterSwap = await connection.getTokenAccountBalance(userJuneTokenAccount);
    expect(juneBalanceAfterSwap.value.amount).to.be.equal('1010000000000');
    let tokenAmount = await connection.getTokenAccountBalance(poolJuneTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('110000000000');
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('5000000000');
    expect(poolAccountInfo.juneTotalSupply.toString()).to.be.equal('110000000000');
  });

  it('Must swap June for SOL successfully', async () => {
    let [user, userJuneTokenAccount] = await generateUser(
        payer, juneToken, connection
    )

    let juneBalanceBeforeSwap = await connection.getTokenAccountBalance(userJuneTokenAccount);
    expect(juneBalanceBeforeSwap.value.amount).to.be.equal('1000000000000');
    await program.methods.swapJuneToSol(
        new BN(10_000_000_000),
    ).accounts({
      signer: user.publicKey,
      signerTokenAccount: userJuneTokenAccount,
      poolAccount,
      poolJuneTokenAccount,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([user]).rpc();
    let juneBalanceAfterSwap = await connection.getTokenAccountBalance(userJuneTokenAccount);
    expect(juneBalanceAfterSwap.value.amount).to.be.equal('990000000000');
    let tokenAmount = await connection.getTokenAccountBalance(poolJuneTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('120000000000');
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('4000000000');
    expect(poolAccountInfo.juneTotalSupply.toString()).to.be.equal('120000000000');
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
        systemProgram: web3.SystemProgram.programId,
      }).rpc();

      chai.assert(false, "Swap function must be failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6004);
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
        systemProgram: web3.SystemProgram.programId,
      }).rpc();

      chai.assert(false, "Swap function must be failed");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6004);
      expect(err.error.errorCode.code).to.equal("ZeroSwap");
      expect(err.program.equals(program.programId)).is.true;
    }
  });
});
