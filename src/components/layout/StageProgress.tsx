'use client';

const stages = [
  { num: 1, label: 'Research' },
  { num: 2, label: 'Brief' },
  { num: 3, label: 'Draft' },
  { num: 4, label: 'EEAT' },
  { num: 5, label: 'Humanize' },
  { num: 6, label: 'Export' },
];

interface StageProgressProps {
  currentStage: number;
  error?: boolean;
}

export function StageProgress({ currentStage, error }: StageProgressProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {stages.map((stage, idx) => {
            const isCompleted = stage.num < currentStage;
            const isActive = stage.num === currentStage;
            const isError = isActive && error;

            return (
              <div key={stage.num} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      isError
                        ? 'bg-red-500 text-white'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                            ? 'bg-indigo-500 text-white ring-4 ring-indigo-100'
                            : 'bg-gray-200 text-gray-500'
                    }`}
                    title={stage.label}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isError ? (
                      '!'
                    ) : (
                      stage.num
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500 mt-1 hidden sm:block">
                    {stage.label}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 sm:mx-2 ${
                      stage.num < currentStage ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
