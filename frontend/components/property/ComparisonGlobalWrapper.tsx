"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ComparisonProvider } from "@/lib/comparison-context";
import { PropertyComparisonButton } from "./PropertyComparisonButton";
import { PropertyComparisonModal } from "./PropertyComparisonModal";

export function ComparisonGlobalWrapper({ children }: { children: React.ReactNode }) {
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const pathname = usePathname();

  const isComparePage = pathname === "/compare";

  return (
    <ComparisonProvider>
      {children}

      {!isComparePage && (
        <>
          <PropertyComparisonButton
            onOpenComparison={() => setIsComparisonModalOpen(true)}
          />
          <PropertyComparisonModal
            isOpen={isComparisonModalOpen}
            onClose={() => setIsComparisonModalOpen(false)}
          />
        </>
      )}
    </ComparisonProvider>
  );
}
