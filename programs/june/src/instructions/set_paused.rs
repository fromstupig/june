use crate::*;

#[derive(Accounts)]
pub struct SetPaused<'info> {
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
  ctx: Context<SetPaused>,
  paused: bool,
) -> Result<()> {
  let pool = &mut ctx.accounts.pool_account;

  invariant!(pool.paused != paused, JuneTokenErrorCode::AlreadyPausedOrUnpaused);
  require_keys_eq!(
    pool.owner,
    ctx.accounts.signer.key(),
    JuneTokenErrorCode::MustBePoolOwner,
  );

  pool.paused = paused;

  set_paused_emit!(SetPausedEvent { paused });

  Ok(())
}

#[event]
pub struct SetPausedEvent {
  paused: bool,
}