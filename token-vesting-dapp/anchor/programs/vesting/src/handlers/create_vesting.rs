use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{ Mint, TokenAccount, TokenInterface },
};
use crate::{ constant::VESTING_ACCOUNT_SEED, state::Vesting };

#[derive(Accounts)]
#[instruction(company_id: u64)]
pub struct CreateVesting<'info> {
    pub system_program: Program<'info, System>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = Vesting::DISCRIMINATOR.len() + Vesting::INIT_SPACE,
        seeds = [VESTING_ACCOUNT_SEED.as_bytes(), company_id.to_le_bytes().as_ref()],
        bump
    )]
    pub vesting_account: Account<'info, Vesting>,

    #[account(mint::token_program = token_program)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = vesting_account,
        associated_token::token_program = token_program
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,
}

pub fn create_vesting(
    ctx: Context<CreateVesting>,
    company_id: u64,
    company_name: String
) -> Result<()> {
    let vesting_account = &mut ctx.accounts.vesting_account;
    vesting_account.set_inner(Vesting {
        company_id,
        company_name,
        mint: ctx.accounts.mint.key(),
        owner: ctx.accounts.signer.key(),
        treasury_token_account: ctx.accounts.treasury_token_account.key(),
        bump: ctx.bumps.vesting_account,
    });
    Ok(())
}
