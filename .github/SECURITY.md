# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it by emailing the maintainer directly. You should receive a response within 48 hours.

Please include the following information:
- Type of vulnerability
- Full paths of source files related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Best Practices

### For Users

1. **Never share your private keys or seed phrases**
2. **Always verify the contract address before transacting:**
   - `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2`
3. **Use hardware wallets when possible**
4. **Verify transaction parameters before signing**

### For Developers

1. **Never commit sensitive data** (keys, mnemonics, secrets)
2. **Use environment variables** for configuration
3. **Follow the `.gitignore` patterns** in this repository
4. **Review all dependencies** before adding them

## Contract Security

The AhhbitTracker smart contracts are:

- **Immutable** - Cannot be modified after deployment
- **Non-upgradeable** - No proxy patterns or admin functions
- **Self-contained** - No external contract dependencies for core logic

## Scope

The following are in scope for security reports:

- Smart contracts in `/contracts`
- Frontend application in `/frontend`
- SDK packages in `/packages`
- Deployment scripts in `/scripts`

## Out of Scope

- Third-party dependencies
- Theoretical vulnerabilities without proof of concept
- Issues already reported
- Issues in deprecated contract versions
