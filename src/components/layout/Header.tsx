'use client';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-14 sm:h-16 flex items-center">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Content Engine POC</h1>
          <p className="text-xs text-gray-500 hidden sm:block">AI-Powered Content Workflow</p>
        </div>
      </div>
    </header>
  );
}
