import { useState } from 'react';
import {
  Pencil,
  Trash2,
  Merge,
  Plus,
  Check,
  X,
  Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { MergeDialog } from '@/components/categories/MergeDialog';
import {
  useRenameCategory,
  useDeleteCategory,
  useCreateSubcategory,
  useRenameSubcategory,
  useDeleteSubcategory,
  type Category,
} from '@/hooks/useCategories';

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [mergingCategory, setMergingCategory] = useState<Category | null>(null);
  const [addingSubcategoryFor, setAddingSubcategoryFor] = useState<
    string | null
  >(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [renamingSubcategory, setRenamingSubcategory] = useState<{
    categoryId: string;
    subcategoryId: string;
  } | null>(null);
  const [renameSubValue, setRenameSubValue] = useState('');

  const renameMutation = useRenameCategory();
  const deleteMutation = useDeleteCategory();
  const createSubMutation = useCreateSubcategory();
  const renameSubMutation = useRenameSubcategory();
  const deleteSubMutation = useDeleteSubcategory();

  const startRename = (category: Category) => {
    setRenamingId(category.id);
    setRenameValue(category.name);
  };

  const confirmRename = async () => {
    if (!renamingId || !renameValue.trim()) return;
    await renameMutation.mutateAsync({ id: renamingId, name: renameValue.trim() });
    setRenamingId(null);
    setRenameValue('');
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    await deleteMutation.mutateAsync(deletingCategory.id);
    setDeletingCategory(null);
  };

  const handleAddSubcategory = async (categoryId: string) => {
    if (!newSubcategoryName.trim()) return;
    await createSubMutation.mutateAsync({
      categoryId,
      name: newSubcategoryName.trim(),
    });
    setAddingSubcategoryFor(null);
    setNewSubcategoryName('');
  };

  const startRenameSub = (
    categoryId: string,
    subcategoryId: string,
    currentName: string
  ) => {
    setRenamingSubcategory({ categoryId, subcategoryId });
    setRenameSubValue(currentName);
  };

  const confirmRenameSub = async () => {
    if (!renamingSubcategory || !renameSubValue.trim()) return;
    await renameSubMutation.mutateAsync({
      categoryId: renamingSubcategory.categoryId,
      subcategoryId: renamingSubcategory.subcategoryId,
      name: renameSubValue.trim(),
    });
    setRenamingSubcategory(null);
    setRenameSubValue('');
  };

  const cancelRenameSub = () => {
    setRenamingSubcategory(null);
    setRenameSubValue('');
  };

  const handleDeleteSub = async (
    categoryId: string,
    subcategoryId: string
  ) => {
    await deleteSubMutation.mutateAsync({ categoryId, subcategoryId });
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                {renamingId === category.id ? (
                  <div className="flex flex-1 items-center gap-1">
                    <Input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmRename();
                        if (e.key === 'Escape') cancelRename();
                      }}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={confirmRename}
                      disabled={renameMutation.isPending}
                    >
                      <Check className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={cancelRename}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <CardTitle className="text-base">{category.name}</CardTitle>
                )}
                <div className="flex shrink-0 items-center gap-1">
                  <Badge
                    variant={
                      category.type === 'income' ? 'default' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {category.type}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {category._count.transactions} transaction
                {category._count.transactions !== 1 ? 's' : ''}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Subcategories */}
              {category.subcategories.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Subcategories
                  </p>
                  <div className="space-y-1">
                    {category.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted/50"
                      >
                        {renamingSubcategory?.subcategoryId === sub.id ? (
                          <div className="flex flex-1 items-center gap-1">
                            <Input
                              value={renameSubValue}
                              onChange={(e) =>
                                setRenameSubValue(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmRenameSub();
                                if (e.key === 'Escape') cancelRenameSub();
                              }}
                              className="h-6 text-xs"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={confirmRenameSub}
                              disabled={renameSubMutation.isPending}
                            >
                              <Check className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={cancelRenameSub}
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5">
                              <Tag className="size-3 text-muted-foreground" />
                              <span>{sub.name}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() =>
                                  startRenameSub(
                                    category.id,
                                    sub.id,
                                    sub.name
                                  )
                                }
                                aria-label={`Rename ${sub.name}`}
                              >
                                <Pencil className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() =>
                                  handleDeleteSub(category.id, sub.id)
                                }
                                aria-label={`Delete ${sub.name}`}
                              >
                                <Trash2 className="size-3 text-destructive" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add subcategory */}
              {addingSubcategoryFor === category.id ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')
                        handleAddSubcategory(category.id);
                      if (e.key === 'Escape') {
                        setAddingSubcategoryFor(null);
                        setNewSubcategoryName('');
                      }
                    }}
                    placeholder="Subcategory name"
                    className="h-7 text-sm"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleAddSubcategory(category.id)}
                    disabled={createSubMutation.isPending}
                  >
                    <Check className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setAddingSubcategoryFor(null);
                      setNewSubcategoryName('');
                    }}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => setAddingSubcategoryFor(category.id)}
                >
                  <Plus className="size-3.5" />
                  Add subcategory
                </Button>
              )}

              {/* Category actions */}
              <div className="flex items-center gap-1 border-t pt-3">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => startRename(category)}
                >
                  <Pencil className="size-3" />
                  Rename
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setMergingCategory(category)}
                >
                  <Merge className="size-3" />
                  Merge
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeletingCategory(category)}
                  disabled={category._count.transactions > 0}
                >
                  <Trash2 className="size-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        title="Delete Category"
        description={
          deletingCategory?._count.transactions
            ? `Cannot delete "${deletingCategory.name}" because it has ${deletingCategory._count.transactions} transaction(s). Move or delete the transactions first, or merge this category into another.`
            : `Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`
        }
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel="Delete"
      />

      {mergingCategory && (
        <MergeDialog
          open={!!mergingCategory}
          onOpenChange={(open) => {
            if (!open) setMergingCategory(null);
          }}
          sourceCategory={mergingCategory}
          categories={categories}
        />
      )}
    </>
  );
}
