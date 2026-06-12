# Security Policy

This document outlines the security model, policies, and responsibilities for AhhbitTracker users and developers.

## Smart Contract Security

### Immutability
The AhhbitTracker smart contracts are immutable once deployed to the Stacks blockchain. 
- **No Admin Roles**: There are no admin functions, owner backdoors, or upgrade keys.
- **Rule Enforcement**: The rules (7-day streak requirements, 10% penalty on missed check-ins) are permanently hardcoded and cannot be modified by any party.
- **Auditing**: The smart contracts enforce access control directly on-chain. Only the owner of a habit can log check-ins, withdraw deposits, or claim bonuses.

### Core Safeguards
- **Reentrancy**: State changes occur before external asset transfers. Clarity's execution environment prevents reentrancy.
- **Overflow Protection**: Clarity has native overflow checking. Any overflow error immediately aborts the transaction.
- **Denial of Service**: All contract functions are designed to operate in constant time with predictable gas costs, eliminating looping and transaction blocking risks.

---

## User Security Guidelines

### Key Protection
Your Stacks private key or 12-word seed phrase is your identity and ownership key.
- **Never share** your seed phrase or private key with anyone, including the development team.
- **Never input** your seed phrase into websites or applications. Use trusted browser extensions like Leather or Xverse.
- Store backups offline, in a physical format, or in a secure, encrypted password manager.

### Transaction Verification
Before signing any transaction in your wallet:
1. **Verify Contract Address**: Ensure the contract is the official deployer address:
   `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v3`
2. **Review Functions & Fees**: Verify the function name, parameters, and gas fee.
3. **Verify STX Amounts**: Double-check the stake deposit amount.

### Privacy Best Practices
All transactions, habit names, and deposit amounts on the Stacks blockchain are public.
- Do not use personal or sensitive information in your habit names.
- Use generic names (e.g., "Daily Exercise" or "Coding Practice").

---

## Developer Security Guidelines

### Secrets Management
- Do not commit `.env`, `.env.local`, or any private key settings to git.
- Use `.env.example` as a template for public configuration references.
- Private keys must only reside in gitignored configuration files (such as `settings/Mainnet.toml`).

### RPC Node Security
- Only use trusted Stacks mainnet RPC nodes, such as Hiro API (`https://api.mainnet.hiro.so`).
- Avoid connecting to unverified public nodes.

---

## Security Vulnerability Disclosure

If you discover a security vulnerability, please report it responsibly:

### Contact
- **GitHub Security Advisories**: Submit a private advisory via [GitHub Security Advisories](https://github.com/Yusufolosun/AhhbitTracker/security/advisories/new).
- **Email**: security@ahhbittracker.com

### Guidelines
1. Do not exploit the vulnerability for personal gain or disclose user data.
2. Provide a clear description, reproduction steps, and potential mitigations.
3. Allow the development team up to 90 days to verify and address the vulnerability before public disclosure.

---

## Resources

- **Stacks Security Documentation**: [Clarity Security Guidelines](https://docs.stacks.co/clarity/security)
- **Stacks Developer Portal**: [Build Secure Apps on Stacks](https://docs.stacks.co/build-apps/guides/security)
- **Leather Wallet Security Guide**: [Leather Security Support](https://leather.io)
