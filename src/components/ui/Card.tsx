'use client';

interface CardProps {
  title: string;
  stageNumber: number;
  status?: 'completed' | 'active' | 'error';
  badge?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function Card({ title, stageNumber, status, badge, children, action }: CardProps) {
  const dotColor =
    status === 'completed'
      ? 'bg-green-500'
      : status === 'error'
        ? 'bg-red-500'
        : status === 'active'
          ? 'bg-indigo-500 animate-pulse'
          : 'bg-gray-300';

  return (
    <div
      role="region"
      aria-label={`Stage ${stageNumber} output`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in"
    >
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${dotColor}`} />
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex-1">
          Stage {stageNumber}: {title}
        </h3>
        {badge}
      </div>
      <div className="px-4 py-4 sm:px-6">{children}</div>
      {action && (
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-100 bg-gray-50">{action}</div>
      )}
    </div>
  );
}
