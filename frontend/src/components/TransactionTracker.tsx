import { useTransactions } from '../context/TransactionContext';

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
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-fade-in"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {formatFunctionName(tx.functionName)}
                </p>
              </div>
              <p className="text-xs text-gray-500 truncate" title={tx.txId}>
                {shortenTxId(tx.txId)}
              </p>
            </div>
            <button
              onClick={() => dismissTransaction(tx.txId)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-yellow-600 font-medium">
              Submitted — waiting for confirmation
            </span>
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
