import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface DateRangeSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export function DateRangeSelector({ month, year, onChange }: DateRangeSelectorProps) {
  const handlePrev = () => {
    if (month === 1) {
      onChange(12, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onChange(1, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Previous month">
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[160px] text-center text-lg font-semibold">
        {MONTH_NAMES[month - 1]} {year}
      </span>
      <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next month">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
