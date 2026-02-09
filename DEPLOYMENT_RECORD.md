# Deployment Record

## Mainnet Deployment

**Deployment Date:** February 9, 2026

**Contract Address:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`

**Deployer Address:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193`

**Network:** Stacks Mainnet

**Deployment Cost:** ~122,090 microSTX (~0.122 STX)

**Clarinet Version:** Latest

**Clarity Version:** 2.0

## Contract Configuration

**Constants:**
- Minimum stake: 100,000 microSTX (0.1 STX)
- Maximum habit name length: 50 characters
- Check-in window: 144 blocks (~24 hours)
- Minimum withdrawal streak: 7 days

**Error Codes:**
- 100: Not authorized
- 101: Invalid stake amount
- 102: Invalid habit name
- 103: Habit not found
- 104: Not habit owner
- 105: Already checked in
- 106: Check-in window expired
- 107: Insufficient streak
- 108: Habit already completed
- 109: Pool insufficient balance
- 110: Transfer failed

## Explorer Links

**Contract:** https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker?chain=mainnet

**Deployer:** https://explorer.hiro.so/address/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193?chain=mainnet

## Deployment Verification

- [x] Contract deployed successfully
- [x] Transaction confirmed on-chain
- [x] Contract visible on Explorer
- [x] Medium-cost deployment strategy used
- [x] Contract address updated in codebase
- [x] All 29 tests passing before deployment

## Post-Deployment Status

**Initial State:**
- Forfeited pool balance: 0 STX
- Total habits created: 0
- Active users: 0
- Contract owner: SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193

## Contract Functions

### Public Functions
- `create-habit(name, stake-amount)` - Create new habit with STX stake
- `check-in(habit-id)` - Daily check-in to maintain streak
- `withdraw-stake(habit-id)` - Withdraw stake after 7-day completion
- `claim-bonus(habit-id)` - Claim bonus from forfeited pool
- `slash-habit(habit-id)` - Forfeit expired habit (callable by anyone)

### Read-Only Functions
- `get-habit(habit-id)` - Retrieve habit details
- `get-user-habits(user)` - Get user's habit list
- `get-habit-streak(habit-id)` - Get current streak count
- `get-pool-balance()` - Get forfeited pool balance
- `get-total-habits()` - Get total habits created
- `get-user-stats(user)` - Get user statistics

## Next Steps

- [ ] Test habit creation transaction on mainnet
- [ ] Verify all read-only functions via Explorer
- [ ] Monitor first user interactions
- [ ] Track forfeited pool growth
- [ ] Build frontend interface
- [ ] Create user documentation
- [ ] Set up analytics dashboard

## Testnet Deployment Reference

**Testnet Address:** `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.habit-tracker`

**Testnet Deployment Date:** February 8, 2026

**Testnet Cost:** 0.122090 STX

## Notes

- Contract successfully passed all 29 automated tests
- Encoding issues resolved (BOM removed, LF line endings)
- Gas estimation performed before deployment
- Contract uses Clarity 2.0 for enhanced features
- Deployment performed using Clarinet deployments apply
