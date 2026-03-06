import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
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
  const dirRef = useRef<'left' | 'right'>('right');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);

  const goPrev = () => {
    dirRef.current = 'left';
    const p = getPrevMonth(month, year);
    onChange(p.month, p.year);
  };

  const goNext = () => {
    dirRef.current = 'right';
    const n = getNextMonth(month, year);
    onChange(n.month, n.year);
  };

  const selectMonth = (m: number) => {
    dirRef.current = pickerYear > year || (pickerYear === year && m > month) ? 'right' : 'left';
    setPickerOpen(false);
    onChange(m, pickerYear);
  };

  const label = `${MONTH_NAMES[month - 1]} ${year}`;
  const animClass = dirRef.current === 'right' ? 'animate-slide-left' : 'animate-slide-right';

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" onClick={goPrev} aria-label="Previous month">
        <ChevronLeft className="size-4" />
      </Button>

      <Popover
        open={pickerOpen}
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (open) setPickerYear(year);
        }}
      >
        <PopoverTrigger asChild>
          <button className="w-36 overflow-hidden text-center rounded-md px-2 py-1 hover:bg-muted transition-colors">
            <span
              key={`${month}-${year}`}
              className={`inline-block text-sm font-medium ${animClass}`}
            >
              {label}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="center">
          {/* Year nav */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPickerYear((y) => y - 1)}
              aria-label="Previous year"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-semibold">{pickerYear}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPickerYear((y) => y + 1)}
              aria-label="Next year"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {SHORT_MONTHS.map((name, i) => {
              const m = i + 1;
              const isActive = m === month && pickerYear === year;
              return (
                <button
                  key={name}
                  onClick={() => selectMonth(m)}
                  className={cn(
                    'rounded-md px-2 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-muted text-foreground',
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="ghost" size="icon-sm" onClick={goNext} aria-label="Next month">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

export { MONTH_NAMES };
