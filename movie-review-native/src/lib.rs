use solana_program_entrypoint::entrypoint;
use processor::process_instruction;

pub mod instructions;
pub mod processor;
pub mod state;

entrypoint!(process_instruction);

#[cfg(test)]
mod tests {
    use borsh::{ from_slice, to_vec };
    use litesvm::LiteSVM;
    use solana_sdk::{
        instruction::{ AccountMeta, Instruction },
        pubkey::Pubkey,
        signature::Keypair,
        signer::Signer,
        transaction::Transaction,
    };
    use solana_system_interface::program;

    use crate::{
        instructions::AddMovieReviewPayload,
        processor::MovieReviewInstuction,
        state::MovieReview,
    };

    #[test]
    fn run_movie_add_review() {
        let payer = Keypair::new();
        let payer_pubkey = payer.pubkey();
        let mut svm = LiteSVM::new();
        svm.airdrop(&payer_pubkey, 1_000_000_000).unwrap();

        let program_keypair = Keypair::new();
        let program_id = program_keypair.pubkey();
        svm.add_program_from_file(program_id, "target/deploy/movie_review_native.so").unwrap();

        let title = String::from("Inception");
        let rating = 4;
        let description = String::from("Crazy movie");

        let (movie_review_key, _bump_seed) = Pubkey::find_program_address(
            &[payer_pubkey.as_ref(), title.as_bytes()],
            &program_id
        );

        let add_movie_review_instruction = MovieReviewInstuction::AddMovieReview(
            AddMovieReviewPayload {
                title: title.clone(),
                rating: rating.clone(),
                description: description.clone(),
            }
        );

        let instruction = Instruction {
            program_id,
            accounts: vec![
                AccountMeta::new(payer_pubkey, true),
                AccountMeta::new(movie_review_key, false),
                AccountMeta::new_readonly(program::ID, false)
            ],
            data: to_vec(&add_movie_review_instruction).unwrap(),
        };

        let tx = Transaction::new_signed_with_payer(
            &[instruction],
            Some(&payer_pubkey),
            &[payer],
            svm.latest_blockhash()
        );

        svm.send_transaction(tx).unwrap();
        let movie_review_info = svm.get_account(&movie_review_key).unwrap();
        let data = from_slice::<MovieReview>(&movie_review_info.data).unwrap();

        assert_eq!(data.reviewer, payer_pubkey);
        assert_eq!(data.title, title);
        assert_eq!(data.rating, rating);
        assert_eq!(data.description, description);
    }
}
