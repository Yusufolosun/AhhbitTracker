# Changelog

All notable changes to AhhbitTracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-08

### Added

**Smart Contract:**
- Initial contract deployment to Stacks mainnet
- `create-habit` function for habit creation with staking
- `check-in` function for daily habit tracking
- `withdraw-stake` function for successful completion
- `claim-bonus` function for forfeited pool distribution
- Read-only functions: `get-habit`, `get-user-habits`, `get-habit-streak`, `get-forfeited-pool-balance`, `get-user-stats`
- Event emissions for all public functions
- Comprehensive error handling (10 error codes)

**Testing:**
- Complete test suite with 29 test cases
- Unit tests for all functions
- Edge case coverage
- Integration test scenarios

**Documentation:**
- User guide with step-by-step instructions
- API reference with all functions documented
- Integration guide for developers
- FAQ with common questions
- Tutorial for first-time users
- Security best practices
- Gas optimization guide
- Monitoring guide

**Scripts:**
- Deployment scripts for mainnet
- Transaction automation utilities
- Contract statistics utility
- Batch query utility
- Gas estimation tool
- Verification utilities

**Infrastructure:**
- Clarinet project configuration
- TypeScript testing framework
- Environment templates
- Git workflow and contribution guidelines

### Contract Details

- **Address:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`
- **Deployment Cost:** ~0.12 STX
- **Network:** Stacks Mainnet
- **Language:** Clarity v2
- **Epoch:** 2.5

### Security

- Immutable contract (no upgrade mechanism)
- No admin privileges
- Comprehensive input validation
- Protected against common vulnerabilities

### Known Limitations

- Minimum stake: 0.1 STX
- Check-in window: 144 blocks (~24 hours)
- Minimum withdrawal streak: 7 days
- Maximum habits per user: 100
- Habit name max length: 50 characters

---

## [Unreleased]

### Planned

- Frontend web interface
- Mobile wallet integration
- Analytics dashboard
- Additional read-only query functions
- Batch operations support

---

## Version History

- **1.0.0** - Initial mainnet release (2026-02-08)
