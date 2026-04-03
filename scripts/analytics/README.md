# Analytics Suite

Utilities for monitoring contract usage and metrics on the AhhbitTracker contract.

## Prerequisites

```bash
# Ensure you have the required dependencies
npm install
```

## Available Tools

### Streak Analyzer

Analyze user streak patterns and completion rates.

```bash
npm run analytics:streaks
```

### Pool Tracker

Track forfeited pool balance over time.

```bash
npm run analytics:pool
```

### User Activity

Monitor user engagement and activity metrics.

```bash
npm run analytics:activity
```

### Full Dashboard

Comprehensive overview of all metrics.

```bash
npm run analytics:dashboard
```

## Environment Variables

The analytics scripts use these environment variables (with defaults):

| Variable | Default | Description |
|----------|---------|-------------|
| `CONTRACT_ADDRESS` | `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z` | Contract deployer address |
| `CONTRACT_NAME` | `habit-tracker-v2` | Contract name |
| `STACKS_API_URL` | `https://api.mainnet.hiro.so` | Stacks API endpoint |

## Data Files

- `pool-history.json` - Historical pool balance snapshots (gitignored)
- Generated automatically when running pool tracker

## Usage

Run regularly to monitor:

- Contract growth
- User engagement
- Pool accumulation
- Streak patterns

## Automation

See `cron-example.sh` for automated data collection.
