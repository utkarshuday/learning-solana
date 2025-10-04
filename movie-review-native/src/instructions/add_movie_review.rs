use borsh::{ to_vec, BorshDeserialize, BorshSerialize };
use solana_pubkey::Pubkey;
use solana_program::sysvar::{ rent::Rent, Sysvar };
use solana_cpi::invoke_signed;
use solana_account_info::{ next_account_info, AccountInfo };
use solana_program_error::{ ProgramResult, ProgramError };
use solana_system_interface::instruction;

use crate::state::MovieReview;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct AddMovieReviewPayload {
    pub title: String,
    pub rating: u8,
    pub description: String,
}

impl AddMovieReviewPayload {
    pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], data: Self) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let initializer = next_account_info(accounts_iter)?;
        let movie_review_info = next_account_info(accounts_iter)?;
        let system_program = next_account_info(accounts_iter)?;

        if !initializer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let (movie_review_key, bump_seed) = Pubkey::find_program_address(
            &[initializer.key.as_ref(), data.title.as_bytes()],
            program_id
        );

        if *movie_review_info.key != movie_review_key {
            return Err(ProgramError::InvalidSeeds);
        }

        let movie_review = MovieReview {
            reviewer: *initializer.key,
            title: data.title,
            rating: data.rating,
            description: data.description,
        };

        let size = to_vec(&movie_review)?.len();

        let rent_lamports = Rent::get()?.minimum_balance(size);

        invoke_signed(
            &instruction::create_account(
                initializer.key,
                movie_review_info.key,
                rent_lamports,
                size as u64,
                program_id
            ),
            &[initializer.clone(), movie_review_info.clone(), system_program.clone()],
            &[&[initializer.key.as_ref(), movie_review.title.as_bytes(), &[bump_seed]]]
        )?;

        movie_review.serialize(&mut &mut movie_review_info.data.borrow_mut()[..])?;

        Ok(())
    }
}
