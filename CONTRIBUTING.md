# Contributing to AhhbitTracker

Thank you for considering contributing to AhhbitTracker!

## How to Contribute

### Reporting Bugs

**Before submitting:**
- Check existing issues
- Test on latest version
- Verify on testnet if applicable

**Include in bug report:**
- Steps to reproduce
- Expected vs actual behavior
- Contract transaction ID (if applicable)
- Environment (OS, browser, wallet)

**Submit via:**
GitHub Issues: https://github.com/Yusufolosun/AhhbitTracker/issues

---

### Suggesting Features

**Good feature requests include:**
- Clear use case
- Expected behavior
- Impact on existing functionality
- Gas cost implications

**Note:** Contract is immutable - new features require new deployment

---

### Code Contributions

#### Prerequisites

- Node.js 18+
- Clarinet CLI
- Git
- TypeScript knowledge
- Clarity basics

#### Setup Development Environment
```bash
# Clone repository
git clone https://github.com/Yusufolosun/AhhbitTracker.git
cd AhhbitTracker

# Install dependencies
npm install

# Run tests
npm test

# Check contract
clarinet check
```

---

### Contribution Workflow

#### 1. Create Issue

Open issue describing your proposed change.

#### 2. Fork Repository
```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/AhhbitTracker.git
cd AhhbitTracker
git remote add upstream https://github.com/Yusufolosun/AhhbitTracker.git
```

#### 3. Create Branch
```bash
# Feature branch
git checkout -b feature/your-feature-name

# Bug fix branch
git checkout -b fix/bug-description

# Documentation branch
git checkout -b docs/doc-improvement
```

**Branch naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `test/` - Test additions
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

#### 4. Make Changes

**Follow conventions:**

**Commit messages:**
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Tests
- `refactor` - Code refactoring
- `chore` - Maintenance

**Examples:**
```bash
git commit -m "feat(frontend): add habit deletion feature"
git commit -m "fix(contract): correct streak calculation edge case"
git commit -m "docs(readme): update installation instructions"
```

#### 5. Test Changes
```bash
# Run all tests
npm test

# Test contract
clarinet check

# Test specific function
clarinet console --testnet
```

**Ensure:**
- All tests pass
- No new warnings
- Code follows style guide
- Documentation updated

#### 6. Push Changes
```bash
# Push to your fork
git push origin feature/your-feature-name
```

#### 7. Create Pull Request

**PR Title:** Clear, descriptive (follows commit convention)

**PR Description should include:**
- What changed and why
- Related issue number
- Testing performed
- Screenshots (if UI changes)
- Breaking changes (if any)

**Example:**
```markdown
## Description
Adds ability to delete habits before check-in starts.

Closes #42

## Changes
- Added `delete-habit` function to contract
- Updated frontend with delete button
- Added tests for deletion flow

## Testing
- Unit tests pass
- Tested on devnet
- No gas cost increase

## Breaking Changes
None
```

---

### Code Style

#### Clarity (Smart Contracts)
```clarity
;; ✅ Good
(define-public (my-function (param uint))
  (let
    (
      (result (some-calculation param))
    )
    (ok result)
  )
)

;; ❌ Bad
(define-public (my-function (param uint))(ok (some-calculation param)))
```

**Guidelines:**
- 2-space indentation
- Descriptive function names
- Comments for complex logic
- Error codes documented

#### TypeScript
```typescript
// ✅ Good
async function createHabit(
  name: string,
  stakeAmount: number
): Promise<string> {
  // Validation
  if (!name || name.length > 50) {
    throw new Error('Invalid name');
  }
  
  // Transaction
  const txId = await submitTransaction(...);
  return txId;
}

// ❌ Bad
async function createHabit(n, s) {
  return await submitTransaction(...);
}
```

**Guidelines:**
- Use TypeScript types
- Handle errors properly
- Document public functions
- Use async/await over promises

#### Markdown
```markdown
✅ Good:
# Heading 1
## Heading 2

- List item
- List item

❌ Bad:
#Heading 1
##Heading 2

-List item
- List item
```

---

### Documentation

**Update when changing:**

- `README.md` - If user-facing changes
- `docs/API_REFERENCE.md` - If contract functions change
- `docs/USER_GUIDE.md` - If UX changes
- Inline code comments - For complex logic

**Documentation standards:**
- Clear and concise
- Examples provided
- No assumptions about reader knowledge
- Proofread for typos

---

### Testing Requirements

**All contributions must include tests:**

**Contract changes:**
```typescript
describe('new-function', () => {
  it('should handle valid input', () => {
    const result = contract.call('new-function', [validInput]);
    expect(result).toBeOk();
  });
  
  it('should reject invalid input', () => {
    const result = contract.call('new-function', [invalidInput]);
    expect(result).toBeErr();
  });
});
```

**Frontend changes:**
```typescript
describe('NewComponent', () => {
  it('renders correctly', () => {
    render(<NewComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

### Performance Considerations

**Gas costs matter:**

Before submitting contract changes:
1. Estimate gas impact
2. Document cost increase/decrease
3. Justify if costs increase

**Optimize where possible:**
- Minimize map operations
- Reduce assertions
- Avoid complex calculations

---

### Review Process

**What to expect:**

1. **Automated checks** - Tests must pass
2. **Code review** - Maintainer reviews code
3. **Discussion** - Questions/suggestions
4. **Approval** - Once satisfied
5. **Merge** - Squash and merge

**Timeline:**
- Initial review: 1-3 days
- Total process: 1-2 weeks

**Be patient and responsive to feedback**

---

### Community Guidelines

**Be respectful:**
- Professional communication
- Constructive criticism
- Help others learn
- No discrimination

**Be collaborative:**
- Open to feedback
- Willing to iterate
- Share knowledge
- Credit others

---

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Thanked in community updates

---

### License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

### Questions?

- **Issues:** https://github.com/Yusufolosun/AhhbitTracker/issues
- **Discussions:** https://github.com/Yusufolosun/AhhbitTracker/discussions

---

## Thank You!

Every contribution, no matter how small, helps make AhhbitTracker better.

We appreciate your time and effort! 🙏
