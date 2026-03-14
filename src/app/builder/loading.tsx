import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50">
      {/* Top Sidebar / Toolbar Skeleton */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 shrink-0 border-r border-slate-200 bg-white p-4 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <Skeleton className="h-4 w-1/3" />
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 overflow-hidden p-8">
          <div className="mx-auto h-full max-w-5xl rounded-[32px] border border-slate-200 bg-white shadow-2xl p-10 flex flex-col gap-8">
             <Skeleton className="h-12 w-1/3 rounded-lg" />
             <Skeleton className="h-64 w-full rounded-2xl" />
             <div className="grid grid-cols-3 gap-6">
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-48 rounded-2xl" />
             </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 shrink-0 border-l border-slate-200 bg-white p-6 space-y-8">
           <div className="space-y-4">
             <Skeleton className="h-4 w-1/2" />
             <Skeleton className="h-24 rounded-2xl" />
           </div>
           <div className="space-y-4 border-t border-slate-100 pt-6">
             <Skeleton className="h-4 w-2/3" />
             {[...Array(6)].map((_, i) => (
               <div key={i} className="flex items-center justify-between">
                 <Skeleton className="h-3 w-1/3" />
                 <Skeleton className="h-8 w-1/2 rounded-lg" />
               </div>
             ))}
           </div>
        </aside>
      </div>
    </div>
  );
}
