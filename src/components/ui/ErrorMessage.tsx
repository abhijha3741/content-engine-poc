'use client';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onReset?: () => void;
}

export function ErrorMessage({ message, onRetry, onReset }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-xl flex-shrink-0">!</span>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-800">Something went wrong</h4>
          <p className="text-sm text-red-700 mt-1">{message}</p>
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Try again"
              >
                Try Again
              </button>
            )}
            {onReset && (
              <button
                onClick={onReset}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Start over"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
