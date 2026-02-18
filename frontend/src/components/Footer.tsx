

const REPO_URL = 'https://github.com/Yusufolosun/AhhbitTracker';
const EXPLORER_CONTRACT_URL =
  'https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker?chain=mainnet';

const RESOURCE_LINKS = [
  { label: 'Documentation', href: `${REPO_URL}#readme` },
  { label: 'User Guide', href: `${REPO_URL}/blob/main/docs/USER_GUIDE.md` },
  { label: 'FAQ', href: `${REPO_URL}/blob/main/docs/FAQ.md` },
  { label: 'API Reference', href: `${REPO_URL}/blob/main/docs/API_REFERENCE.md` },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-primary-500 mb-4">AhhbitTracker</h3>
            <p className="text-sm text-gray-600">
              Build better habits with blockchain accountability.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Contract</h4>
            <a
              href={EXPLORER_CONTRACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 font-mono break-all hover:text-primary-500 transition-colors"
            >
              SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} AhhbitTracker. Built on Stacks.</p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-gray-400 hover:text-primary-500 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
