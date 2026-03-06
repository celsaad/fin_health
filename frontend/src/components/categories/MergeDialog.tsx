import { useState } from 'react';
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

export function MergeDialog({
  open,
  onOpenChange,
  sourceCategory,
  categories,
}: MergeDialogProps) {
  const [targetId, setTargetId] = useState('');
  const mergeMutation = useMergeCategory();

  const eligibleTargets = categories.filter(
    (c) => c.id !== sourceCategory.id && c.type === sourceCategory.type
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
          <DialogTitle>Merge Category</DialogTitle>
          <DialogDescription>
            Merge "{sourceCategory.name}" into another category. All{' '}
            {sourceCategory._count.transactions} transaction
            {sourceCategory._count.transactions !== 1 ? 's' : ''} will be
            reassigned to the target category.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Target Category</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select target category" />
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
              <p className="font-medium">Warning</p>
              <p className="mt-1">
                This will move all transactions from "
                {sourceCategory.name}" to "{targetCategory?.name}" and delete "
                {sourceCategory.name}". This action cannot be undone.
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
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleMerge}
            disabled={!targetId || mergeMutation.isPending}
          >
            {mergeMutation.isPending ? 'Merging...' : 'Merge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
