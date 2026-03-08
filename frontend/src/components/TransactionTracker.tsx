import { useTransactions } from '../context/TransactionContext';
import type { TrackedTransaction } from '../context/TransactionContext';

export function TransactionTracker() {
  const { transactions, dismissTransaction, getExplorerUrl } = useTransactions();

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {transactions.map((tx) => (
        <div
          key={tx.txId}
          className={`bg-white dark:bg-surface-800 border rounded-lg shadow-lg p-4 animate-slide-in ${statusBorderClass(tx.status)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <StatusDot status={tx.status} />
                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                  {formatFunctionName(tx.functionName)}
                </p>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 truncate" title={tx.txId}>
                {shortenTxId(tx.txId)}
              </p>
            </div>
            <button
              onClick={() => dismissTransaction(tx.txId)}
              className="ml-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <StatusLabel status={tx.status} />
            <a
              href={getExplorerUrl(tx.txId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              View on Explorer
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusDot({ status }: { status: TrackedTransaction['status'] }) {
  const colorClass =
    status === 'confirmed'
      ? 'bg-emerald-500'
      : status === 'failed'
        ? 'bg-red-500'
        : 'bg-primary-400 animate-pulse';

  return <div className={`w-2 h-2 rounded-full ${colorClass}`} />;
}

function StatusLabel({ status }: { status: TrackedTransaction['status'] }) {
  if (status === 'confirmed') {
    return (
      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        Confirmed
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="text-xs text-red-600 dark:text-red-400 font-medium">
        Failed
      </span>
    );
  }
  return (
    <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
      Submitted — waiting for confirmation
    </span>
  );
}

function statusBorderClass(status: TrackedTransaction['status']): string {
  if (status === 'confirmed') return 'border-emerald-200 dark:border-emerald-800';
  if (status === 'failed') return 'border-red-200 dark:border-red-800';
  return 'border-surface-200 dark:border-surface-700';
}

function shortenTxId(txId: string): string {
  if (!txId) return '';
  const clean = txId.startsWith('0x') ? txId : `0x${txId}`;
  return `${clean.slice(0, 10)}...${clean.slice(-8)}`;
}

function formatFunctionName(name: string): string {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
