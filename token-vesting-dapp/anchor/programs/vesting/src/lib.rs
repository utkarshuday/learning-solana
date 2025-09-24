#![allow(unexpected_cfgs)]

pub mod handlers;
pub mod state;
pub mod error;
pub mod constant;

use handlers::*;
use anchor_lang::prelude::*;

declare_id!("5wQXgugM9ch9r6VFUDEsZHC5gajURZye8x2mAAW9kaE1");

#[program]
pub mod vesting {
    use super::*;

    pub fn create_vesting(
        ctx: Context<CreateVesting>,
        company_id: u64,
        company_name: String
    ) -> Result<()> {
        handlers::create_vesting(ctx, company_id, company_name)
    }

    pub fn create_employee(
        ctx: Context<CreateEmployee>,
        start_time: i64,
        end_time: i64,
        cliff_time: i64,
        total_amount: u64
    ) -> Result<()> {
        handlers::create_employee(ctx, start_time, end_time, cliff_time, total_amount)
    }

    pub fn claim_tokens(ctx: Context<ClaimTokens>, company_id: u64) -> Result<()> {
        handlers::claim_tokens(ctx, company_id)
    }
}
