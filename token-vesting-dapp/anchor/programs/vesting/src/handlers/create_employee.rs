use anchor_lang::prelude::*;
use crate::{
    constant::{ EMPLOYEE_ACCOUNT_SEED, VESTING_ACCOUNT_SEED },
    error::ErrorCode,
    state::{ Employee, Vesting },
};

#[derive(Accounts)]
pub struct CreateEmployee<'info> {
    pub system_program: Program<'info, System>,

    pub beneficiary: SystemAccount<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        has_one = owner,
        seeds = [
            VESTING_ACCOUNT_SEED.as_bytes(),
            vesting_account.company_id.to_le_bytes().as_ref(),
        ],
        bump = vesting_account.bump
    )]
    pub vesting_account: Account<'info, Vesting>,

    #[account(
        init,
        payer = owner,
        space = Employee::DISCRIMINATOR.len() + Employee::INIT_SPACE,
        seeds = [
            EMPLOYEE_ACCOUNT_SEED.as_bytes(),
            vesting_account.key().as_ref(),
            beneficiary.key().as_ref(),
        ],
        bump
    )]
    pub employee_account: Account<'info, Employee>,
}

pub fn create_employee(
    ctx: Context<CreateEmployee>,
    start_time: i64,
    end_time: i64,
    cliff_time: i64,
    total_amount: u64
) -> Result<()> {
    require_gt!(end_time, start_time, ErrorCode::InvalidVestingPeriod);
    require_gte!(cliff_time, start_time, ErrorCode::InvalidCliffTimestamp);

    let employee = &mut ctx.accounts.employee_account;
    employee.set_inner(Employee {
        beneficiary: ctx.accounts.beneficiary.key(),
        start_time,
        end_time,
        cliff_time,
        vesting_account: ctx.accounts.vesting_account.key(),
        total_amount,
        total_withdrawn: 0,
        bump: ctx.bumps.employee_account,
    });
    Ok(())
}
