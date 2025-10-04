use borsh::{ from_slice, BorshDeserialize, BorshSerialize };

use solana_account_info::AccountInfo;
use solana_program_entrypoint::ProgramResult;
use solana_program_error::ProgramError;
use solana_pubkey::Pubkey;

use crate::instructions::*;

#[derive(BorshDeserialize, BorshSerialize)]
pub enum MovieReviewInstuction {
    AddMovieReview(AddMovieReviewPayload),
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8]
) -> ProgramResult {
    let instruction = from_slice::<MovieReviewInstuction>(data).map_err(
        |_| ProgramError::InvalidInstructionData
    )?;
    match instruction {
        MovieReviewInstuction::AddMovieReview(data) =>
            AddMovieReviewPayload::process(program_id, accounts, data),
    }
}
