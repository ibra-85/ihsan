"use client";

import dynamic from "next/dynamic";
import { use } from "react";

const CategoryContent = dynamic(() => import("./category-content"), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
      <div className="h-4 w-80 bg-muted animate-pulse rounded mb-8" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  ),
});

export default function AzkarCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = use(params);
  return <CategoryContent categoryId={categoryId} />;
}
