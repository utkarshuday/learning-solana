use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Cannot claim tokens now")]
    ClaimNotAvailableYet,

    #[msg("Vesting start timestamp should be less than end timestamp")]
    InvalidVestingPeriod,

    #[msg("Cliff timestamp should be less than or equal to start timestamp")]
    InvalidCliffTimestamp,

    #[msg("Overflow during calculation")]
    CalculationOverflow,

    #[msg("Nothing to be claimed")]
    NothingToClaim,
}
