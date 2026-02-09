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

**Status:** ✅ Deployed Successfully

### Prerequisites Checklist

- [x] Testnet deployment successful
- [x] All testnet tests passed (29/29 tests)
- [x] Mainnet.toml configured with mnemonic
- [x] Mainnet wallet funded
- [x] Final contract review completed

### Deployment Information

**Date:** February 9, 2026  
**Network:** Stacks Mainnet  
**Contract Address:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`  
**Deployer Address:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193`  
**Gas Cost:** ~0.122 STX  

### Explorer Links

- Contract: https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker?chain=mainnet
- Deployer: https://explorer.hiro.so/address/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193?chain=mainnet

### Post-Deployment Verification

- [x] Contract visible on explorer
- [x] Contract address updated in codebase
- [x] Documentation updated
- [x] Verification script created
- [ ] Test transaction executed successfully

### Next Steps

- [ ] Build frontend interface
- [ ] Create user documentation
- [ ] Set up monitoring dashboard
- [ ] Test all contract functions on mainnet

---

## Notes

This file tracks deployment progress for both testnet and mainnet environments.

**Latest Deployment Record:** See [DEPLOYMENT_RECORD.md](DEPLOYMENT_RECORD.md) for comprehensive mainnet deployment details.
