# Post-Deployment Operations

## Immediate Actions

### 1. Record Contract Address

Update the following files with deployed contract address:
- `scripts/interact.ts`
- Frontend configuration
- Documentation

### 2. Verify Deployment

```bash
npm run deploy:verify [CONTRACT_ADDRESS]
```

### 3. Test Contract Functions

Execute test transactions for each public function:

```bash
clarinet console --mainnet
```

### 4. Update Documentation

- Add contract address to README
- Update deployment status
- Record deployment transaction ID

## Monitoring

### Track Usage

Monitor contract at:
```
https://explorer.hiro.so/address/[CONTRACT_ADDRESS]?chain=mainnet
```

### Key Metrics

- Total habits created
- Active check-ins
- Total fees generated
- Forfeited pool balance

## Maintenance

### Contract State

Regularly check:
- Pool balance growth
- User activity levels
- Transaction success rates

### Community Updates

Announce deployment:
- GitHub release
- Social media
- Stacks community forums
