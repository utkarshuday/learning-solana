use borsh::{ BorshDeserialize, BorshSerialize };
use solana_pubkey::Pubkey;

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct MovieReview {
    pub reviewer: Pubkey,
    pub title: String,
    pub rating: u8,
    pub description: String,
}
