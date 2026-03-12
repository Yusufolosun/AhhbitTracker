

const REPO_URL = 'https://github.com/Yusufolosun/AhhbitTracker';
const EXPLORER_CONTRACT_URL =
  'https://explorer.hiro.so/txid/SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2?chain=mainnet';

const RESOURCE_LINKS = [
  { label: 'Documentation', href: `${REPO_URL}#readme` },
  { label: 'User Guide', href: `${REPO_URL}/blob/main/docs/USER_GUIDE.md` },
  { label: 'FAQ', href: `${REPO_URL}/blob/main/docs/FAQ.md` },
];

export function Footer() {
  return (
    <footer className="bg-white dark:bg-surface-950 border-t border-surface-200 dark:border-surface-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logos/icon-only-dark.jpg"
                alt="AhhbitTracker"
                className="h-8 w-8 rounded-lg"
              />
              <span className="text-lg font-bold">
                <span className="text-primary-500">Ahhbit</span>
                <span className="text-surface-900 dark:text-white">Tracker</span>
              </span>
            </div>
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              On-chain habit tracking with accountability.
              Stake STX, build streaks, earn rewards.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-surface-600 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-4 uppercase tracking-wider">Smart Contract</h4>
            <a
              href={EXPLORER_CONTRACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-surface-500 dark:text-surface-400 font-mono break-all hover:text-primary-500 dark:hover:text-primary-400 transition-colors leading-relaxed"
            >
              SP1M46...habit-tracker
            </a>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-2">
              Deployed on Stacks Mainnet
            </p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            &copy; {new Date().getFullYear()} AhhbitTracker. Built on Stacks.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
