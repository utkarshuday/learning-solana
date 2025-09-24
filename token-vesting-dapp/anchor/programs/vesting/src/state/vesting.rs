use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Vesting {
    pub company_id: u64,
    #[max_len(50)]
    pub company_name: String,
    pub owner: Pubkey,
    pub mint: Pubkey, // It adds a direct rule about what the "correct" mint is.
    pub treasury_token_account: Pubkey, // TODO: Is it written for verification? Or for querying? Or any other reasons?
    pub bump: u8,
}
