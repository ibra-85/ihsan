"use client";

import dynamic from "next/dynamic";

const SettingsContent = dynamic(() => import("./settings-content"), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="h-8 w-36 bg-muted animate-pulse rounded mb-8" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  ),
});

export default function SettingsPage() {
  return <SettingsContent />;
}
