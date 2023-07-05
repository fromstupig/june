use crate::*;

#[account]
pub struct Pool {
    pub owner: Pubkey,
    pub bump: u8,
    pub june_token: Pubkey,
    pub june_token_account_bump: u8,
    pub june_total_supply: u64,
    pub sol_total_supply: u64,
    pub swap_rate: u64,
}

impl Pool {
    pub const POOL_SIZE: usize = 100;
}
