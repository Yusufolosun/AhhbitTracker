import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../utils/constants';
import { contractExplorerUrl } from '../utils/explorer';

const REPO_URL = 'https://github.com/Yusufolosun/AhhbitTracker';
const EXPLORER_CONTRACT_URL = contractExplorerUrl(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);

const RESOURCE_LINKS = [
  { label: 'Documentation',  href: `${REPO_URL}#readme` },
  { label: 'User Guide',     href: `${REPO_URL}/blob/main/docs/USER_GUIDE.md` },
  { label: 'FAQ',            href: `${REPO_URL}/blob/main/docs/FAQ.md` },
  { label: 'Changelog',      href: `${REPO_URL}/blob/main/CHANGELOG.md` },
];

const COMMUNITY_LINKS = [
  { label: 'GitHub',          href: REPO_URL },
  { label: 'Stacks Explorer', href: EXPLORER_CONTRACT_URL },
  { label: 'Code of Conduct', href: `${REPO_URL}/blob/main/CODE_OF_CONDUCT.md` },
  { label: 'Contributing',    href: `${REPO_URL}/blob/main/CONTRIBUTING.md` },
];

export function Footer() {
  return (
    <footer className="bg-white dark:bg-surface-950 border-t border-surface-200 dark:border-surface-700/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/logos/icon-only-dark.jpg"
                alt="AhhbitTracker"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg"
              />
              <span className="text-lg font-extrabold tracking-tight">
                <span className="text-primary-500">Ahhbit</span>
                <span className="text-surface-900 dark:text-white">Tracker</span>
              </span>
            </div>
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-5">
              On-chain habit tracking with real accountability. Stake STX, build streaks, earn rewards.
            </p>
            {/* Bitcoin-Secured badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-xs font-semibold text-surface-600 dark:text-surface-400">
              <span className="text-amber-500">₿</span>
              Bitcoin-Secured via Stacks
            </div>
          </div>

          {/* Resources column */}
          <div>
            <h4 className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-4">
              Resources
            </h4>
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

          {/* Community column */}
          <div>
            <h4 className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-4">
              Community
            </h4>
            <ul className="space-y-2.5">
              {COMMUNITY_LINKS.map((link) => (
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

          {/* Smart Contract column */}
          <div>
            <h4 className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-4">
              Smart Contract
            </h4>
            <a
              href={EXPLORER_CONTRACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-mono text-xs text-surface-500 dark:text-surface-400 break-all hover:text-primary-500 dark:hover:text-primary-400 transition-colors leading-relaxed mb-2"
            >
              {CONTRACT_ADDRESS.slice(0, 12)}…{CONTRACT_NAME}
            </a>
            <p className="text-xxs text-surface-400 dark:text-surface-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
              Verified Stacks Mainnet Contract
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            © {new Date().getFullYear()} AhhbitTracker — Built on{' '}
            <a
              href="https://stacks.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              Stacks
            </a>{' '}
            ·{' '}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-500 transition-colors"
            >
              Open Source
            </a>
          </p>
          <div className="flex items-center gap-3 text-xxs text-surface-400 dark:text-surface-500">
            <span>No admin key</span>
            <span>·</span>
            <span>Decentralized</span>
            <span>·</span>
            <span>Non-custodial</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
