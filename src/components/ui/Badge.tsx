'use client';

const variants: Record<string, string> = {
  default: 'bg-indigo-100 text-indigo-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  commercial: 'bg-orange-100 text-orange-700',
  transactional: 'bg-green-100 text-green-700',
  informational: 'bg-blue-100 text-blue-700',
};

export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: string;
}) {
  const classes = variants[variant] || variants.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {children}
    </span>
  );
}
