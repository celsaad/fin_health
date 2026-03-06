import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMergeCategory, type Category } from '@/hooks/useCategories';

interface MergeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceCategory: Category;
  categories: Category[];
}

export function MergeDialog({ open, onOpenChange, sourceCategory, categories }: MergeDialogProps) {
  const { t } = useTranslation();
  const [targetId, setTargetId] = useState('');
  const mergeMutation = useMergeCategory();

  const eligibleTargets = categories.filter(
    (c) => c.id !== sourceCategory.id && c.type === sourceCategory.type,
  );

  const handleMerge = async () => {
    if (!targetId) return;
    await mergeMutation.mutateAsync({
      sourceId: sourceCategory.id,
      targetCategoryId: targetId,
    });
    onOpenChange(false);
    setTargetId('');
  };

  const targetCategory = categories.find((c) => c.id === targetId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('categories.mergeCategory')}</DialogTitle>
          <DialogDescription>
            {t('categories.mergeCategoryDesc', {
              source: sourceCategory.name,
              count: sourceCategory._count.transactions,
              plural: sourceCategory._count.transactions !== 1 ? 's' : '',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>{t('categories.targetCategory')}</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('categories.selectTarget')} />
              </SelectTrigger>
              <SelectContent>
                {eligibleTargets.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category._count.transactions} transactions)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {targetId && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              <p className="font-medium">{t('common.warning')}</p>
              <p className="mt-1">
                {t('categories.mergeWarning', {
                  source: sourceCategory.name,
                  target: targetCategory?.name,
                })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setTargetId('');
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleMerge}
            disabled={!targetId || mergeMutation.isPending}
          >
            {mergeMutation.isPending ? t('categories.merging') : t('categories.mergeButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
