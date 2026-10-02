"use client";

import { useState } from "react";
import { CategoryModal } from "./CategoryModal";
import type { Category } from "@/lib/domain";

interface QuickAddCategoryButtonProps {
  onCategoryCreated: (category: Category) => void;
  className?: string;
}

export function QuickAddCategoryButton({ onCategoryCreated, className = "" }: QuickAddCategoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:text-amber-900 transition-colors ${className}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        New category
      </button>

      <CategoryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={(category) => {
          onCategoryCreated(category);
        }}
      />
    </>
  );
}
