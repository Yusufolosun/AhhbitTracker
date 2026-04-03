# Changelog

All notable changes to AhhbitTracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-18

### Changed

- **Mainnet redeployment** to new deployer address `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z`
- Minimum stake reduced from 0.1 STX to 0.02 STX across all contracts
- All 3 contracts deployed: `habit-tracker-v2`, `habit-streak-reward`, `habit-accountability-group`

### Deployment

- **Deployer:** `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z`
- **habit-tracker-v2:** [Explorer](https://explorer.hiro.so/txid/SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2?chain=mainnet)
- **habit-streak-reward:** [Explorer](https://explorer.hiro.so/txid/SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-streak-reward?chain=mainnet)
- **habit-accountability-group:** [Explorer](https://explorer.hiro.so/txid/SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-accountability-group?chain=mainnet)
- **Previous deployment (deprecated):** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker-v2`

---

## [1.0.1] - 2026-02-17

### Added

**Development Infrastructure:**
- `.editorconfig` for consistent coding styles across different editors and IDEs
- `.prettierrc.json` for consistent code formatting
- `.prettierignore` to exclude build artifacts and generated files from formatting
- `.nvmrc` specifying Node.js version (18.20.0) for consistent development environment
- `ROADMAP.md` outlining future development plans and feature priorities
- `.github/CODEOWNERS` for automated code review assignments
**Package Metadata:**
- Enhanced root `package.json` with repository URL, keywords, bugs URL, and homepage
- Enhanced frontend `package.json` with complete metadata and project information
- Added Node.js and npm engine requirements for better compatibility

**Documentation:**
- Comprehensive roadmap for versions 1.1.0, 1.2.0, and 2.0.0
- Clear contribution guidelines in CODEOWNERS

### Improved

**Code Quality:**
- Consistent code formatting standards across the project
- Better repository discoverability through keywords
- Development environment consistency with .nvmrc

**Developer Experience:**
- Clearer project structure with proper editor configurations
- Automated code review assignments for pull requests
### Technical Details

- Node.js: >=18.0.0
- npm: >=9.0.0
- Prettier: Configured with 100 char line width, single quotes, 2-space tabs
- EditorConfig: UTF-8, LF line endings, 2-space indentation
---

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

### Contract Details (Previous Deployment — Deprecated)

- **Address:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker-v2`
- **Deployment Cost:** ~0.12 STX
- **Network:** Stacks Mainnet
- **Language:** Clarity v2
- **Epoch:** 2.5

> **Note:** This deployment has been superseded by `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z` — see [1.1.0].

### Security

- Immutable contract (no upgrade mechanism)
- No admin privileges
- Comprehensive input validation
- Protected against common vulnerabilities

### Known Limitations

- Minimum stake: 0.02 STX
- Check-in window: 144 blocks (~24 hours)
- Minimum withdrawal streak: 7 days
- Maximum habits per user: 100
- Habit name max length: 50 characters

---

## [Unreleased]

### Added

- SECURITY.md for GitHub security tab
- FUNDING.yml for GitHub Sponsors
- CONTRIBUTORS.md to recognize project contributors
- .nvmrc for Node.js version management
- Error code type and helper function in frontend constants
- Actual API verification in deployment script

### Changed

- GitHub Actions workflows updated to use checkout@v4 and setup-node@v4
- CodeQL workflow updated to use codeql-action@v3
- Added WebSocket endpoint to CSP connect-src for real-time updates
- Font loading optimized with non-blocking strategy
- Multiple accessibility improvements for screen readers
- Scripts now use environment variables instead of hardcoded values
- Improved bug report and feature request issue templates
- Enhanced pull request template with more sections

### Fixed

- Incorrect check-in wait time in user guide (was 14+ blocks, corrected to 120+ blocks)
- Removed non-existent ERR-TRANSFER-FAILED (u110) from API reference
- Fixed broken deployment guide link in contracts README
- Fixed escaped backtick syntax in FAQ
- Added missing project metadata in Clarinet.toml

---

## Version History

- **1.1.0** - Mainnet redeployment with reduced minimum stake (2026-02-18)
- **1.0.1** - Development infrastructure improvements (2026-02-17)
- **1.0.0** - Initial mainnet release (2026-02-08)
