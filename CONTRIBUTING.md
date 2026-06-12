# Contributing to AhhbitTracker

Thank you for considering contributing to AhhbitTracker! This document outlines the process for proposing changes and setting up your local environment.

## How to Contribute

### Reporting Bugs
Before submitting an issue:
1. Check the existing issue tracker to see if the bug has already been reported.
2. Verify you are testing on the latest version of the main branch.
3. If applicable, test using devnet/testnet before reporting mainnet transaction failures.

When submitting:
- Provide clear steps to reproduce the issue.
- Describe the expected vs. actual behavior.
- Include a transaction ID or error code if relevant.
- List your environment details (browser, wallet extension, OS).

Submit bug reports via [GitHub Issues](https://github.com/Yusufolosun/AhhbitTracker/issues).

---

### Suggesting Features
Smart contracts on Stacks are immutable once deployed. Feature requests that require smart contract changes will require a new contract deployment.
- Outline a clear use case for your feature.
- Detail the expected behavior.
- Describe the impact on existing UI components and contract states.

---

### Code Contributions

#### Prerequisites
- Node.js 18+ (verified with `.nvmrc`)
- Clarinet CLI (for Clarity contract checks)
- Git

#### Local Environment Setup
```bash
# Clone the repository
git clone https://github.com/Yusufolosun/AhhbitTracker.git
cd AhhbitTracker

# Install project dependencies
npm install

# Run frontend tests
npm test

# Verify Clarity contracts
clarinet check
```

---

### Contribution Workflow

1. **Create an Issue**: Open an issue describing your proposed change to discuss it with the maintainers.
2. **Fork & Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b fix/bug-description
   ```
3. **Commit Messages**: Follow standard semantic commit messages:
   `type(scope): description` (e.g., `feat(frontend): add validator to habit form`, `fix(contract): check-in range boundaries`).
4. **Testing**:
   - Ensure all existing tests pass (`npm test`).
   - Run `clarinet check` to verify Clarity contract syntax.
   - Verify code formatting with Prettier.
5. **Create a Pull Request**: Include a summary of your changes, links to the resolved issue, and any manual verification steps performed.

---

### Code Style Guidelines

#### Smart Contracts (Clarity)
- Use standard 2-space indentation.
- Document public functions, map structures, and custom error codes.
- Prioritize gas efficiency by minimizing map accesses and using standard arithmetic safeguards.

#### Frontend (TypeScript & React)
- Follow TypeScript conventions: provide explicit types for function signatures and exports.
- Use React hooks (`useMemo`, `useCallback`) appropriately to optimize rendering performance of key list items.
- Ensure components follow the defined design system.

---

### Security Disclosures
If you discover a security vulnerability, please do **not** open a public issue. Refer to [SECURITY.md](docs/SECURITY.md) for instructions on submitting a private disclosure.

---

### Licensing
By contributing, you agree that your code will be licensed under the project's [MIT License](LICENSE).
