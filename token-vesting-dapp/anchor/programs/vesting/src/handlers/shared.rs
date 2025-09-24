use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    Mint,
    TokenAccount,
    TokenInterface,
    TransferChecked,
    transfer_checked,
};

pub fn transfer_tokens<'info>(
    from: &InterfaceAccount<'info, TokenAccount>,
    to: &InterfaceAccount<'info, TokenAccount>,
    authority: &AccountInfo<'info>,
    mint: &InterfaceAccount<'info, Mint>,
    token_program: &Interface<'info, TokenInterface>,
    amount: u64,
    seeds: Option<&[&[&[u8]]]>
) -> Result<()> {
    let cpi_accounts = TransferChecked {
        from: from.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
        mint: mint.to_account_info(),
    };

    let cpi_program = token_program.to_account_info();
    let mut cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    if let Some(signer_seeds) = seeds {
        cpi_ctx = cpi_ctx.with_signer(signer_seeds);
    }
    transfer_checked(cpi_ctx, amount, mint.decimals)
}
