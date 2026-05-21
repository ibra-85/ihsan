"use client";

import dynamic from "next/dynamic";

const UnitContent = dynamic(() => import("./unit-content"), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 bg-muted animate-pulse rounded-xl mb-3" />
      ))}
    </div>
  ),
});

export default function UnitPage() {
  return <UnitContent />;
}
