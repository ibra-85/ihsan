"use client";

import dynamic from "next/dynamic";

const LibraryContent = dynamic(() => import("./library-content"), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  ),
});

export default function Page() {
  return <LibraryContent />;
}
