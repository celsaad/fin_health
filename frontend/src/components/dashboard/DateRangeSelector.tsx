const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface DateRangeSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

function getPrevMonth(m: number, y: number) {
  return m === 1 ? { month: 12, year: y - 1 } : { month: m - 1, year: y };
}

function getNextMonth(m: number, y: number) {
  return m === 12 ? { month: 1, year: y + 1 } : { month: m + 1, year: y };
}

export function DateRangeSelector({ month, year, onChange }: DateRangeSelectorProps) {
  const prev = getPrevMonth(month, year);
  const next = getNextMonth(month, year);

  const months = [
    { m: prev.month, y: prev.year, active: false },
    { m: month, y: year, active: true },
    { m: next.month, y: next.year, active: false },
  ];

  return (
    <div className="flex items-center gap-2">
      {months.map(({ m, y, active }) => (
        <button
          key={`${m}-${y}`}
          onClick={() => onChange(m, y)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active
              ? 'bg-primary text-primary-foreground'
              : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {SHORT_MONTHS[m - 1]}{y !== year || !active ? ` ${y}` : ` ${y}`}
        </button>
      ))}
    </div>
  );
}

export { MONTH_NAMES };
