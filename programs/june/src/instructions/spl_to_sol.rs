use crate::*;

#[derive(Accounts)]
pub struct SplToSOL<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,
  #[account(mut)]
  pub signer_token_account: Box<Account<'info, TokenAccount>>,
  #[account(
    mut,
    seeds = [POOL_SEED, pool_account.owner.as_ref()],
    bump = pool_account.bump,
  )]
  pub pool_account: Account<'info, Pool>,
  #[account(
    mut,
    seeds = [POOL_JUNE_SEED, pool_account.key().as_ref()],
    bump = pool_account.june_token_account_bump,
  )]
  pub pool_june_token_account: Box<Account<'info, TokenAccount>>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
}

pub fn exec(
  ctx: Context<SplToSOL>,
  amount: u64,
) -> Result<()> {
  let pool = &mut ctx.accounts.pool_account;

  invariant!(amount > 0, JuneTokenErrorCode::ZeroSwap);

  let sol_amount = amount / pool.swap_rate;

  invariant!(pool.sol_total_supply >= sol_amount, JuneTokenErrorCode::InsufficientSOLBalance);

  pool.sol_total_supply -= sol_amount;
  pool.june_total_supply += amount;

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

  **ctx.accounts.pool_account.to_account_info().try_borrow_mut_lamports()? -= sol_amount;
  **ctx.accounts.signer.try_borrow_mut_lamports()? += sol_amount;

  spl_to_sol_emit!(SplToSOLEvent { amount, sol_amount });

  Ok(())
}

#[event]
pub struct SplToSOLEvent {
  amount: u64,
  sol_amount: u64,
}