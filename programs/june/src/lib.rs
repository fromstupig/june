use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use vipers::invariant;

declare_id!("Es39nWkqB3pFEAaPFjq2UoiHpmQ2SqXjpxANrgvZzK7r");

pub mod instructions;

pub use instructions::*;

pub mod events;

pub use events::*;

pub mod errors;

pub use errors::*;

#[program]
pub mod june {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        swap_rate: u64,
        lamports: u64,
        amount: u64,
    ) -> Result<()> {
        let pool_bump = *ctx.bumps.get("pool_account").unwrap();
        let pool_june_bump = *ctx.bumps.get("pool_june_token_account").unwrap();

        initialize::exec(
            ctx,
            pool_bump,
            pool_june_bump,
            swap_rate,
            lamports,
            amount,
        )
    }

    #[access_control(ctx.accounts.pool_account.when_not_paused())]
    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        lamports: u64,
        amount: u64,
    ) -> Result<()> {
        add_liquidity::exec(ctx, lamports, amount)
    }

    #[access_control(ctx.accounts.pool_account.when_not_paused())]
    pub fn swap_sol_to_june(
        ctx: Context<SOLToSpl>,
        lamports: u64,
    ) -> Result<()> {
        sol_to_spl::exec(ctx, lamports)
    }


    #[access_control(ctx.accounts.pool_account.when_not_paused())]
    pub fn swap_june_to_sol(
        ctx: Context<SplToSOL>,
        amount: u64,
    ) -> Result<()> {
        spl_to_sol::exec(ctx, amount)
    }

    pub fn set_swap_rate(
        ctx: Context<SetSwapRate>,
        rate: u64,
    ) -> Result<()> {
        set_swap_rate::exec(ctx, rate)
    }

    pub fn set_paused(
        ctx: Context<SetPaused>,
        paused: bool,
    ) -> Result<()> {
        set_paused::exec(ctx, paused)
    }
}
