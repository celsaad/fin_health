/**
 * Progress bar component
 */

interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
}

export function ProgressBar({ current, total, showPercentage = true }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const isOverBudget = current > total;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isOverBudget ? 'bg-red-600' : 'bg-green-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <span
          className={`text-sm font-semibold min-w-[3rem] text-right ${
            isOverBudget ? 'text-red-600' : 'text-gray-700'
          }`}
        >
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
