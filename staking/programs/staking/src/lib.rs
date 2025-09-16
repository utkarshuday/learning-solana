#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod handlers;
pub mod state;

pub use constants::*;
pub use handlers::*;
// pub use state::*;

declare_id!("3vtpaGR9RyXS8QCpkGB9AvtDCmhEAUFZsH7joVSA2mjx");

#[program]
pub mod staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }
}
