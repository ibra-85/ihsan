"use client";

import dynamic from "next/dynamic";

const LessonContent = dynamic(() => import("./lesson-content"), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
      <div className="h-64 bg-muted animate-pulse rounded-2xl" />
    </div>
  ),
});

export default function LessonPage() {
  return <LessonContent />;
}
