"use client";

import dynamic from "next/dynamic";

const LearnHome = dynamic(() => import("./learn-home"), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
      <div className="h-4 w-80 bg-muted animate-pulse rounded mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  ),
});

export default function ApprenderePage() {
  return <LearnHome />;
}
