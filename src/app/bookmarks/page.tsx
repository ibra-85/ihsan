"use client";

import dynamic from "next/dynamic";

const BookmarksContent = dynamic(() => import("./bookmarks-content"), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-8" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  ),
});

export default function BookmarksPage() {
  return <BookmarksContent />;
}
