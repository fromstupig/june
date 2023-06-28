use anchor_lang::prelude::*;

declare_id!("Es39nWkqB3pFEAaPFjq2UoiHpmQ2SqXjpxANrgvZzK7r");

#[program]
pub mod june {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
