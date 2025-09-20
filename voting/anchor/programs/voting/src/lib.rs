#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

declare_id!("3L83r9ehAY1YsGGeYjaChFyQufXDvHW9NMrNeV7vopxi");

#[program]
pub mod voting {
    use super::*;

    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        id: u64,
        description: String,
        start_time: u64,
        end_time: u64
    ) -> Result<()> {
        require!(
            description.len() > 0 && description.len() <= MAX_DESCRIPTION_LEN.into(),
            ErrorCode::InvalidDescriptionLength
        );
        require!(
            start_time > 0 && end_time > 0 && start_time < end_time,
            ErrorCode::InvalidPollTimestamp
        );

        let poll = &mut ctx.accounts.poll;
        poll.set_inner(Poll {
            id,
            description,
            start_time,
            end_time,
            total_candidates: 0,
            bump: ctx.bumps.poll,
        });
        Ok(())
    }

    pub fn initialize_candidate(
        ctx: Context<InitializeCandidate>,
        id: u64,
        name: String
    ) -> Result<()> {
        require!(
            name.len() > 0 && name.len() <= MAX_CANDIDATE_NAME_LEN.into(),
            ErrorCode::InvalidCandidateNameLength
        );
        let candidate = &mut ctx.accounts.candidate;
        candidate.set_inner(Candidate { id, name, votes: 0, bump: ctx.bumps.candidate });
        ctx.accounts.poll.total_candidates += 1;
        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>) -> Result<()> {
        let vote = &mut ctx.accounts.vote;
        vote.set_inner(Vote {
            poll_id: ctx.accounts.poll.id,
            candidate_id: ctx.accounts.candidate.id,
            bump: ctx.bumps.vote,
        });
        ctx.accounts.candidate.votes += 1;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct InitializePoll<'info> {
    pub system_program: Program<'info, System>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = Poll::DISCRIMINATOR.len() + Poll::INIT_SPACE,
        seeds = [b"poll", id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct InitializeCandidate<'info> {
    pub system_program: Program<'info, System>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = Candidate::DISCRIMINATOR.len() + Candidate::INIT_SPACE,
        seeds = [b"candidate", poll.id.to_le_bytes().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    #[account(mut, seeds = [b"poll", poll.id.to_le_bytes().as_ref()], bump = poll.bump)]
    pub poll: Account<'info, Poll>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    pub system_program: Program<'info, System>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"candidate", poll.id.to_le_bytes().as_ref(), candidate.id.to_le_bytes().as_ref()],
        bump = candidate.bump
    )]
    pub candidate: Account<'info, Candidate>,

    #[account(mut, seeds = [b"poll", poll.id.to_le_bytes().as_ref()], bump = poll.bump)]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = signer,
        space = Vote::DISCRIMINATOR.len() + Vote::INIT_SPACE,
        seeds = [b"vote", poll.id.to_le_bytes().as_ref(), signer.key().as_ref()],
        bump
    )]
    pub vote: Account<'info, Vote>,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    id: u64,
    #[max_len(MAX_CANDIDATE_NAME_LEN)]
    pub name: String,
    pub votes: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    id: u64,
    #[max_len(MAX_DESCRIPTION_LEN)]
    description: String,
    start_time: u64,
    end_time: u64,
    total_candidates: u64,
    bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Vote {
    candidate_id: u64,
    poll_id: u64,
    bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Timestamp for poll is invalid")]
    InvalidPollTimestamp,

    #[msg("Description should not be empty or more than {MAX_DESCRIPTION_LEN} characters")]
    InvalidDescriptionLength,

    #[msg("Candidate's name should not be empty or more than {MAX_CANDIDATE_NAME_LEN} characters")]
    InvalidCandidateNameLength,
}

#[constant]
pub const MAX_DESCRIPTION_LEN: u16 = 50;
pub const MAX_CANDIDATE_NAME_LEN: u16 = 50;
