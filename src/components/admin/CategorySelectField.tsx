"use client";

import { useState } from "react";
import { QuickAddCategoryButton } from "@/components/admin/categories/QuickAddCategoryButton";
import type { Category } from "@/lib/domain";

interface CategorySelectFieldProps {
  categories: Category[];
  selectedId?: string | null;
  onChange?: (id: string | null) => void;
  name?: string;
  required?: boolean;
  allowNone?: boolean;
  label?: string;
}

export function CategorySelectField({
  categories: initialCategories,
  selectedId = "",
  onChange,
  name = "category_id",
  required = false,
  allowNone = true,
  label = "Category",
}: CategorySelectFieldProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [currentId, setCurrentId] = useState<string>(selectedId ?? "");

  function handleCategoryCreated(newCat: Category) {
    setCategories((prev) => {
      if (prev.some((c) => c.id === newCat.id)) return prev;
      return [...prev, newCat];
    });
    setCurrentId(newCat.id);
    onChange?.(newCat.id);
  }

  function handleChange(val: string) {
    setCurrentId(val);
    onChange?.(val ? val : null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <QuickAddCategoryButton onCategoryCreated={handleCategoryCreated} />
      </div>
      <select
        id={name}
        name={name}
        required={required}
        value={currentId}
        onChange={(e) => handleChange(e.target.value)}
        className="input mt-1.5"
      >
        {allowNone && <option value="">Select a category (optional)</option>}
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
