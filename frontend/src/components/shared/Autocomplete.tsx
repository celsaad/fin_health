import { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface AutocompleteProps {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Autocomplete({
  items,
  value,
  onChange,
  placeholder = 'Type to search...',
  label,
  disabled = false,
  className,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const debouncedInput = useDebounce(inputValue, 200);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredItems = useMemo(() => {
    if (!debouncedInput) return items;
    const lower = debouncedInput.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(lower));
  }, [items, debouncedInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    if (!open) setOpen(true);
  };

  const handleSelect = (item: string) => {
    setInputValue(item);
    onChange(item);
    setOpen(false);
  };

  const handleFocus = () => {
    if (items.length > 0) {
      setOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay close so click on item can register
    setTimeout(() => setOpen(false), 200);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      {label && <Label>{label}</Label>}
      <Popover open={open && filteredItems.length > 0} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-1"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-48 overflow-y-auto">
            {filteredItems.map((item) => (
              <button
                key={item}
                type="button"
                className={cn(
                  'flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground',
                  item === value && 'bg-accent text-accent-foreground'
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
