import { useState, useRef, useEffect, useMemo, useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debouncedInput = useDebounce(inputValue, 200);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredItems = useMemo(() => {
    if (!debouncedInput) return items;
    const lower = debouncedInput.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(lower));
  }, [items, debouncedInput]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredItems]);

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
    setHighlightedIndex(-1);
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

  const isListOpen = open && filteredItems.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isListOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
          handleSelect(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const activeDescendant =
    highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined;

  return (
    <div className={cn('grid gap-2', className)}>
      {label && <Label>{label}</Label>}
      <Popover open={isListOpen} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            role="combobox"
            aria-expanded={isListOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeDescendant}
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-1"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div id={listboxId} role="listbox" className="max-h-48 overflow-y-auto">
            {filteredItems.map((item, index) => (
              <button
                key={item}
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={item === value}
                className={cn(
                  'flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground',
                  item === value && 'bg-accent text-accent-foreground',
                  index === highlightedIndex && 'bg-accent text-accent-foreground',
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
