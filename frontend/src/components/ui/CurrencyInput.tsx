import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// Max representable amount: 999,999.99 (in cents: 99_999_999)
const MAX_CENTS = 99_999_999;

interface CurrencyInputProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'type' | 'inputMode'
> {
  value: number;
  onChange: (value: number) => void;
}

export function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  const { i18n } = useTranslation();
  const [cents, setCents] = React.useState(() => Math.round((value || 0) * 100));
  const prevValueRef = React.useRef(value);

  // Sync when form resets the value externally
  React.useEffect(() => {
    if (value !== prevValueRef.current) {
      setCents(Math.round((value || 0) * 100));
      prevValueRef.current = value;
    }
  }, [value]);

  const displayValue = (cents / 100).toLocaleString(i18n.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const newCents = Math.min(cents * 10 + parseInt(e.key, 10), MAX_CENTS);
      setCents(newCents);
      onChange(newCents / 100);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      const newCents = Math.floor(cents / 10);
      setCents(newCents);
      onChange(newCents / 100);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      setCents(0);
      onChange(0);
    }
    // Tab, Enter, Escape, arrow keys pass through for normal navigation
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!digits) return;
    const newCents = Math.min(parseInt(digits, 10), MAX_CENTS);
    setCents(newCents);
    onChange(newCents / 100);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      data-slot="input"
      value={displayValue}
      onChange={() => {}} // fully controlled — digit entry via onKeyDown, paste via onPaste
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={cn(
        'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}
