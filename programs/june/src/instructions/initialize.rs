use crate::*;

pub const POOL_SEED: &[u8] = b"pool";
pub const POOL_JUNE_SEED: &[u8] = b"pool-june";

#[derive(Accounts)]
pub struct Initialize<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,
  #[account(mut)]
  pub signer_token_account: Box<Account<'info, TokenAccount>>,
  #[account(
    init,
    seeds = [POOL_SEED, signer.key().as_ref()],
    bump,
    payer = signer,
    space = Pool::POOL_SIZE,
  )]
  pub pool_account: Account<'info, Pool>,
  #[account(
    init,
    token::mint = june_token,
    token::authority = pool_account,
    seeds = [POOL_JUNE_SEED, pool_account.key().as_ref()],
    bump,
    payer = signer,
  )]
  pub pool_june_token_account: Box<Account<'info, TokenAccount>>,
  pub june_token: Box<Account<'info, Mint>>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn exec(
  ctx: Context<Initialize>,
  pool_bump: u8,
  pool_june_bump: u8,
  swap_rate: u64,
  lamports: u64,
  amount: u64,
) -> Result<()> {
  let pool = &mut ctx.accounts.pool_account;

  invariant!(swap_rate > 0, JuneTokenErrorCode::InvalidSwapRate);
  invariant!(lamports > 0, JuneTokenErrorCode::ZeroLiquidity);
  invariant!(amount > 0, JuneTokenErrorCode::ZeroLiquidity);

  pool.owner = ctx.accounts.signer.key();
  pool.bump = pool_bump;
  pool.june_token = ctx.accounts.june_token.key();
  pool.june_token_account_bump = pool_june_bump;
  pool.swap_rate = swap_rate;
  pool.sol_total_supply = lamports;
  pool.june_total_supply = amount;
  pool.paused = false;

  invoke(
    &system_instruction::transfer(
      &ctx.accounts.signer.key(),
      &ctx.accounts.pool_account.key(),
      lamports,
    ),
    &[
      ctx.accounts.signer.to_account_info(),
      ctx.accounts.pool_account.to_account_info(),
      ctx.accounts.system_program.to_account_info(),
    ],
  )?;

  token::transfer(
    CpiContext::new(
      ctx.accounts.token_program.to_account_info(),
      Transfer {
        from: ctx.accounts.signer_token_account.to_account_info(),
        to: ctx.accounts.pool_june_token_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
      },
    ),
    amount,
  )?;

  Ok(())
}