#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

const DISCRIMINATOR_SIZE: usize = 8;
const MAX_TITLE_LEN: usize = 20;
const MAX_DESCRIPTION_LEN: usize = 50;
const MIN_RATING: u8 = 1;
const MAX_RATING: u8 = 5;

declare_id!("CUfeVW69zRTLmNRkMGc5nQj1PGWehghDtvUCXakxhbT7");

#[program]
pub mod movie_review {
    use super::*;
    pub fn add_movie_review(
        ctx: Context<AddMovieReview>,
        title: String,
        rating: u8,
        description: String
    ) -> Result<()> {
        require!(rating >= MIN_RATING && rating <= MAX_RATING, MovieReviewError::InvalidRating);
        require!(title.len() <= MAX_TITLE_LEN, MovieReviewError::TitleTooLong);
        require!(description.len() <= MAX_DESCRIPTION_LEN, MovieReviewError::DescriptionTooLong);

        msg!("Movie Review Account Created");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}", rating);

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.set_inner(MovieReviewAccount {
            reviewer: ctx.accounts.user.key(),
            rating,
            title,
            description,
        });

        Ok(())
    }

    pub fn update_movie_review(
        ctx: Context<UpdateMovieReview>,
        title: String,
        rating: u8,
        description: String
    ) -> Result<()> {
        require!(rating >= MIN_RATING && rating <= MAX_RATING, MovieReviewError::InvalidRating);
        require!(title.len() <= MAX_TITLE_LEN, MovieReviewError::TitleTooLong);
        require!(description.len() <= MAX_DESCRIPTION_LEN, MovieReviewError::DescriptionTooLong);

        msg!("Movie Review Account updated");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}", rating);

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.rating = rating;
        movie_review.description = description;

        Ok(())
    }
    pub fn delete_movie_review(_ctx: Context<DeleteMovieReview>, title: String) -> Result<()> {
        msg!("Movie review for {} deleted", title);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct AddMovieReview<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        init,
        payer = user,
        space = DISCRIMINATOR_SIZE + MovieReviewAccount::INIT_SPACE,
        seeds = [title.as_bytes(), user.key().as_ref()],
        bump
    )]
    pub movie_review: Account<'info, MovieReviewAccount>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateMovieReview<'info> {
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [title.as_bytes(), user.key().as_ref()],
        bump
    )]
    pub movie_review: Account<'info, MovieReviewAccount>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteMovieReview<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), user.key().as_ref()],
        bump,
        close = user
    )]
    pub movie_review: Account<'info, MovieReviewAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct MovieReviewAccount {
    pub reviewer: Pubkey,
    pub rating: u8,
    #[max_len(MAX_TITLE_LEN)]
    pub title: String,
    #[max_len(MAX_DESCRIPTION_LEN)]
    pub description: String,
}

#[error_code]
enum MovieReviewError {
    #[msg("Rating must be between 1 and 5")]
    InvalidRating,
    #[msg("Movie Title too long")]
    TitleTooLong,
    #[msg("Movie Description too long")]
    DescriptionTooLong,
}
