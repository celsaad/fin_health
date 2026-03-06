import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ICON_OPTIONS, COLOR_OPTIONS, getCategoryIcon } from '@/lib/categoryIcons';
import { useUpdateCategoryAppearance } from '@/hooks/useCategories';

interface IconPickerProps {
  categoryId: string;
  categoryName: string;
  currentIcon?: string | null;
  currentColor?: string | null;
}

export function IconPicker({
  categoryId,
  categoryName,
  currentIcon,
  currentColor,
}: IconPickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const updateAppearance = useUpdateCategoryAppearance();

  const config = getCategoryIcon(categoryName, currentIcon, currentColor);
  const Icon = config.icon;

  const activeIconName =
    currentIcon ?? ICON_OPTIONS.find((opt) => opt.icon === config.icon)?.name ?? null;
  const activeColorName = currentColor ?? null;

  const handleSelectIcon = (iconName: string) => {
    updateAppearance.mutate({
      id: categoryId,
      icon: iconName,
      color: currentColor ?? undefined,
    });
  };

  const handleSelectColor = (colorName: string) => {
    updateAppearance.mutate({
      id: categoryId,
      icon: currentIcon ?? undefined,
      color: colorName,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.darkBgColor} cursor-pointer transition-shadow hover:ring-2 hover:ring-primary/30`}
          aria-label={t('categories.changeIcon')}
        >
          <Icon className={`size-4 ${config.color}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">{t('categories.icon')}</p>
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {ICON_OPTIONS.map((opt) => {
            const isActive = activeIconName === opt.name;
            return (
              <button
                key={opt.name}
                type="button"
                onClick={() => handleSelectIcon(opt.name)}
                className={`flex size-9 items-center justify-center rounded-lg transition-colors ${
                  isActive ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-muted'
                }`}
                aria-label={opt.name}
              >
                <opt.icon className="size-4 text-foreground" />
              </button>
            );
          })}
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-2">{t('categories.color')}</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((opt) => {
            const isActive = activeColorName === opt.name;
            return (
              <button
                key={opt.name}
                type="button"
                onClick={() => handleSelectColor(opt.name)}
                className={`flex size-7 items-center justify-center rounded-full ${opt.bgColor} ${opt.darkBgColor} transition-shadow ${
                  isActive ? 'ring-2 ring-offset-2 ring-primary' : ''
                }`}
                aria-label={opt.name}
              >
                {isActive && <Check className={`size-3.5 ${opt.color}`} />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
