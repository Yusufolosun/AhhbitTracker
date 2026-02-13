# Quick Reference

## Common Commands

### Check Balance
```bash
npm run dev:balance SP...
```

### Get Nonce
```bash
npm run dev:nonce SP...
```

### Track Transaction
```bash
npm run dev:track 0x...
```

### Test Function
```bash
npm run dev:test get-habit 1
```

## Contract Info

**Address:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`
**Network:** Mainnet
**API:** https://api.mainnet.hiro.so

## Function Reference

| Function | Type | Args |
|----------|------|------|
| create-habit | write | name, stake-amount |
| check-in | write | habit-id |
| withdraw-stake | write | habit-id |
| claim-bonus | write | habit-id |
| get-habit | read | habit-id |
| get-user-habits | read | user |
| get-habit-streak | read | habit-id |
| get-forfeited-pool-balance | read | none |
| get-user-stats | read | user |
