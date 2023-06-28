use crate::*;

#[derive(Accounts)]
pub struct SetSwapRate<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,
  #[account(
    mut,
    seeds = [POOL_SEED, pool_account.owner.as_ref()],
    bump = pool_account.bump,
  )]
  pub pool_account: Account<'info, Pool>,
}

pub fn exec(
  ctx: Context<SetSwapRate>,
  rate: u64,
) -> Result<()> {
  let pool = &mut ctx.accounts.pool_account;

  invariant!(rate > 0, JuneTokenErrorCode::InvalidSwapRate);
  require_keys_eq!(
    pool.owner,
    ctx.accounts.signer.key(),
    JuneTokenErrorCode::MustBePoolOwner,
  );

  pool.swap_rate = rate;

  set_swap_rate_emit!(SetSwapRateEvent { rate });

  Ok(())
}

#[event]
pub struct SetSwapRateEvent {
  rate: u64,
}