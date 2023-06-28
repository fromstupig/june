use crate::*;

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
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
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn exec(
    ctx: Context<AddLiquidity>,
    lamports: u64,
    amount: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool_account;

    invariant!(lamports > 0 || amount > 0, JuneTokenErrorCode::ZeroLiquidity);

    if amount > 0 {
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
    }

    if lamports > 0 {
        pool.sol_total_supply += lamports;

        invoke(
            &system_instruction::transfer(
                &ctx.accounts.signer.key(),
                &pool.key(),
                lamports,
            ),
            &[
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.pool_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
    }

    add_liquidity_emit!(AddLiquidityEvent { lamports, amount });

    Ok(())
}

#[event]
pub struct AddLiquidityEvent {
    lamports: u64,
    amount: u64,
}