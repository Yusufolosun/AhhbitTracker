

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
              <li><a href="#" className="hover:text-primary-500">Documentation</a></li>
              <li><a href="#" className="hover:text-primary-500">User Guide</a></li>
              <li><a href="#" className="hover:text-primary-500">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Contract</h4>
            <p className="text-xs text-gray-600 font-mono break-all">
              SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          © 2026 AhhbitTracker. Built on Stacks.
        </div>
      </div>
    </footer>
  );
}
