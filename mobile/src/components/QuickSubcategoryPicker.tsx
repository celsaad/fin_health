import { QuickPicker } from "./ui/QuickPicker";

export interface QuickSubcategoryPickerProps {
  subcategories: string[];
  selectedSubcategory?: string;
  onSubcategorySelect: (subcategory: string) => void;
}

export function QuickSubcategoryPicker({
  subcategories,
  selectedSubcategory,
  onSubcategorySelect,
}: QuickSubcategoryPickerProps) {
  const subcategoriesItems = subcategories.map((subcategory) => subcategory);

  return (
    <QuickPicker
      items={subcategoriesItems}
      selectedItem={selectedSubcategory}
      onItemSelect={onSubcategorySelect}
    />
  );
}
