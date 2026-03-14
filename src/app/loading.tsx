import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="h-[400px] rounded-[48px]" />
          <Skeleton className="h-[400px] rounded-[48px]" />
        </div>

        <div className="mt-12 space-y-6">
          <Skeleton className="h-24 w-full rounded-[40px]" />
          
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4 rounded-[40px] border border-slate-200 bg-white p-6 shadow-sm">
                <Skeleton className="h-40 w-full rounded-[32px]" />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-1/5 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-1/3" />
                  <div className="flex gap-2 pt-4">
                    <Skeleton className="h-10 flex-1 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
