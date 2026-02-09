# Contract Monitoring Guide

Guide for monitoring contract usage, health, and metrics.

## Overview

Monitor AhhbitTracker contract for:
- User activity and growth
- Forfeited pool accumulation
- Transaction patterns
- Gas costs and optimization opportunities

---

## Monitoring Tools

### 1. Stacks Explorer

**URL:** https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker?chain=mainnet

**What to monitor:**
- Total transactions
- Recent activity
- Contract balance
- Function call distribution

### 2. Contract Stats Script

```bash
npm run stats
```

**Provides:**
- Forfeited pool balance
- Total contract balance
- Active stakes calculation

### 3. Batch Query Tool

```bash
npm run query 1 2 3 4 5
```

**Provides:**
- Multi-habit data retrieval
- Aggregate statistics
- Status distribution

---

## Key Metrics

### User Metrics

**Total Users**
- Query unique principals who created habits
- Track growth over time

**Active Users**
- Count users with active habits
- Monitor daily/weekly active users

**Completion Rate**
- Completed habits / Total habits
- Success rate trends

### Financial Metrics

**Total Value Locked (TVL)**
- Sum of all active habit stakes
- Monitor TVL growth

**Forfeited Pool**
- Track pool accumulation rate
- Monitor bonus claim patterns

**Average Stake Size**
- Total staked / Number of habits
- Identify stake trends

### Engagement Metrics

**Check-in Frequency**
- Daily check-ins over time
- Peak usage hours

**Streak Distribution**
- How many users reach 7+ days
- Average streak length

**Forfeiture Rate**
- Forfeited habits / Total habits
- Identify drop-off patterns

---

## Monitoring Queries

### Get Pool Balance

```bash
clarinet console --mainnet
```

```clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  get-forfeited-pool-balance)
```

### Get Habit Status

```clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  get-habit 
  u1)
```

### Get User Activity

```clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  get-user-stats 
  '[USER-ADDRESS])
```

---

## Alerts and Thresholds

### Critical Alerts

**Pool Imbalance**
- Alert if: Pool balance > Total locked stakes
- Action: Investigate potential exploit

**Zero Activity**
- Alert if: No transactions for 24 hours
- Action: Check network status

**High Failure Rate**
- Alert if: Transaction failure rate > 10%
- Action: Review gas estimates

### Warning Alerts

**Low Engagement**
- Alert if: Daily check-ins < 5
- Action: Marketing/outreach needed

**High Forfeiture**
- Alert if: Forfeiture rate > 50%
- Action: Review user experience

---

## Analytics Dashboard (Conceptual)

### Recommended Metrics Display

```
┌─────────────────────────────────────────┐
│ AHHBITTRACKER ANALYTICS                 │
├─────────────────────────────────────────┤
│ Total Users:              [###]         │
│ Active Habits:            [###]         │
│ Total Value Locked:       [###] STX     │
│ Forfeited Pool:           [###] STX     │
│                                         │
│ Today's Check-ins:        [###]         │
│ 7-Day Completion Rate:    [##]%         │
│ Average Streak:           [#.#] days    │
└─────────────────────────────────────────┘
```

---

## Data Export

### Export Transaction History

```bash
curl "https://api.mainnet.hiro.so/extended/v1/address/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker/transactions" \
  > transaction_history.json
```

### Parse Events

```typescript
const events = transactions
  .filter(tx => tx.tx_status === 'success')
  .flatMap(tx => tx.events)
  .filter(event => event.event_type === 'smart_contract_log');
```

---

## Performance Monitoring

### Transaction Costs

Monitor average costs:
- create-habit: ~0.12 STX
- check-in: ~0.05 STX
- withdraw-stake: ~0.07 STX

**Alert if:** Costs exceed 2x baseline

### Confirmation Times

Track time from submission to confirmation:
- Target: < 30 minutes
- Alert if: > 2 hours

---

## Health Checks

### Daily Checklist

- [ ] Check pool balance growth
- [ ] Review transaction success rate
- [ ] Monitor active user count
- [ ] Verify contract balance integrity

### Weekly Review

- [ ] Analyze completion rate trends
- [ ] Review forfeiture patterns
- [ ] Check for unusual activity
- [ ] Update documentation if needed

---

## Incident Response

### Contract Issues

**Problem:** Transactions failing  
**Steps:**
1. Check Stacks network status
2. Review recent contract changes
3. Test transactions on devnet
4. Alert users if widespread

**Problem:** Pool balance anomaly  
**Steps:**
1. Query all recent transactions
2. Verify math adds up
3. Check for edge cases
4. Document findings

---

## Future Enhancements

Potential monitoring improvements:
- Real-time dashboard
- Email/SMS alerts
- Historical data charts
- Predictive analytics
- User cohort analysis

---

## Tools and Resources

- **Hiro Platform:** https://platform.hiro.so
- **Stacks API:** https://docs.hiro.so/api
- **Explorer:** https://explorer.hiro.so
- **Status:** https://status.hiro.so
