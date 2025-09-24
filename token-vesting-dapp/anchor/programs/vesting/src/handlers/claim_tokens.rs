use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{ Mint, TokenAccount, TokenInterface },
};
use crate::{
    constant::{ EMPLOYEE_ACCOUNT_SEED, VESTING_ACCOUNT_SEED },
    error::ErrorCode,
    handlers::transfer_tokens,
    state::{ Employee, Vesting },
};

#[derive(Accounts)]
#[instruction(company_id: u64)]
pub struct ClaimTokens<'info> {
    pub system_program: Program<'info, System>,

    #[account(mut)]
    pub beneficiary: Signer<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub token_program: Interface<'info, TokenInterface>,

    #[account(mint::token_program = token_program)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = beneficiary,
        associated_token::mint = mint,
        associated_token::authority = beneficiary,
        associated_token::token_program = token_program
    )]
    pub beneficiary_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        has_one = treasury_token_account,
        has_one = mint,
        seeds = [VESTING_ACCOUNT_SEED.as_bytes(), company_id.to_le_bytes().as_ref()],
        bump = vesting_account.bump
    )]
    pub vesting_account: Account<'info, Vesting>,

    #[account(
      mut,
      has_one = beneficiary,
      has_one = vesting_account,
      seeds = [EMPLOYEE_ACCOUNT_SEED.as_bytes(),  vesting_account.key().as_ref(), beneficiary.key().as_ref()],
      bump = employee_account.bump
    )]
    pub employee_account: Account<'info, Employee>,

    #[account(mut, associated_token::mint = mint, associated_token::authority = vesting_account, associated_token::token_program = token_program)]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = beneficiary,
        associated_token::mint = mint,
        associated_token::authority = beneficiary,
        associated_token::token_program = token_program
    )]
    pub employee_token_account: InterfaceAccount<'info, TokenAccount>,
}

pub fn claim_tokens(ctx: Context<ClaimTokens>, _company_id: u64) -> Result<()> {
    let current_time = Clock::get()?.unix_timestamp;
    let employee_account = &mut ctx.accounts.employee_account;

    require_gt!(current_time, employee_account.cliff_time, ErrorCode::ClaimNotAvailableYet);

    let vested_amount = if current_time >= employee_account.end_time {
        employee_account.total_amount
    } else {
        let total_vesting_time = employee_account.end_time.saturating_sub(
            employee_account.start_time
        );
        let time_from_start = current_time.saturating_sub(employee_account.start_time);
        (time_from_start as u128)
            .checked_mul(employee_account.total_amount as u128)
            .and_then(|numerator| numerator.checked_div(total_vesting_time as u128))
            .and_then(|ans_as_u128| ans_as_u128.try_into().ok())
            .ok_or_else(|| ErrorCode::CalculationOverflow)?
    };

    let claimable_amount = vested_amount.saturating_sub(employee_account.total_withdrawn);
    require!(claimable_amount > 0, ErrorCode::NothingToClaim);

    let company_id = ctx.accounts.vesting_account.company_id.to_le_bytes();
    let seeds: &[&[&[u8]]] = &[
        &[
            VESTING_ACCOUNT_SEED.as_bytes(),
            company_id.as_ref(),
            &[ctx.accounts.vesting_account.bump],
        ],
    ];

    transfer_tokens(
        &ctx.accounts.treasury_token_account,
        &ctx.accounts.beneficiary_token_account,
        &ctx.accounts.vesting_account.to_account_info(),
        &ctx.accounts.mint,
        &ctx.accounts.token_program,
        claimable_amount,
        Some(seeds)
    )?;

    employee_account.total_withdrawn = employee_account.total_withdrawn
        .checked_add(claimable_amount)
        .ok_or_else(|| ErrorCode::CalculationOverflow)?;

    Ok(())
}
