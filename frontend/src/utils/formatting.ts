/**
 * Format microSTX to STX
 */
export function formatSTX(microSTX: number): string {
  return (microSTX / 1000000).toFixed(2);
}

/**
 * Format STX to microSTX
 */
export function toMicroSTX(stx: number): number {
  return Math.floor(stx * 1000000);
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format block height to estimated time
 */
export function blocksToTime(blocks: number): string {
  const hours = Math.floor(blocks / 6); // ~10 min per block
  if (hours < 1) return `${blocks * 10} minutes`;
  if (hours < 24) return `${hours} hours`;
  return `${Math.floor(hours / 24)} days`;
}

/**
 * Format date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get time ago string
 */
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
