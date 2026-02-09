# Deployment Records

## Testnet Deployment

**Status:** ✅ Deployed Successfully

### Prerequisites Checklist

- [x] Testnet.toml configured with mnemonic
- [x] Testnet STX obtained from faucet
- [x] Contract syntax verified (`clarinet check`)
- [x] All tests passing (`npm test` - 29/29 tests)

### Deployment Information

**Date:** February 8, 2026  
**Network:** Stacks Testnet  
**Contract Address:** `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.habit-tracker`  
**Deployer Address:** `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0`  
**Gas Cost:** 0.122090 STX  

### Explorer Links

- Contract: https://explorer.hiro.so/address/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.habit-tracker?chain=testnet
- Deployer: https://explorer.hiro.so/address/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0?chain=testnet

### Testing Results

- [ ] create-habit tested
- [ ] check-in tested
- [ ] withdraw-stake tested
- [ ] claim-bonus tested
- [ ] slash-habit tested
- [ ] Read-only functions verified

### Issues Found

None yet

---

## Mainnet Deployment

**Status:** Pending testnet verification

### Prerequisites Checklist

- [ ] Testnet deployment successful
- [ ] All testnet tests passed
- [ ] Mainnet.toml configured with mnemonic
- [ ] Mainnet wallet funded (need ~2 STX)
- [ ] Final contract review completed

### Deployment Information

**Date:** TBD  
**Network:** Stacks Mainnet  
**Transaction ID:** TBD  
**Contract Address:** TBD  
**Block Height:** TBD  
**Deployer Address:** TBD  
**Gas Cost:** TBD  

### Explorer Links

- Contract: TBD
- Deployment TX: TBD

### Post-Deployment Verification

- [ ] Contract visible on explorer
- [ ] Source code verified
- [ ] Functions accessible
- [ ] Test transaction executed successfully

---

## Notes

This file tracks deployment progress for both testnet and mainnet environments.
