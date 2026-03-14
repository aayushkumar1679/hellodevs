"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, User as UserIcon, LogOut, Settings } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardHeader() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* New project */}
      <Link
        href="/builder/new"
        className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-[11px] font-bold text-white shadow-[0_2px_10px_rgba(124,110,248,0.3)] transition-all hover:bg-violet-500 active:scale-95"
      >
        <Plus className="h-3 w-3" />
        New project
      </Link>

      {/* User avatar / menu */}
      {session ? (
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border border-white/10 transition hover:border-white/20"
          >
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt="Avatar"
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-3.5 w-3.5 text-white/40" />
            )}
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full z-50 mt-1.5 w-48 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1A1A1E] shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
              >
                <div className="px-3 py-2.5 border-b border-white/[0.06]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/25">
                    Signed in as
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-semibold text-white/70">
                    {session.user?.name ?? session.user?.email ?? "User"}
                  </p>
                </div>
                <div className="p-1">
                  <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-white/40 transition hover:bg-white/[0.05] hover:text-white/60">
                    <Settings className="h-3 w-3" /> Settings
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-rose-400/80 transition hover:bg-rose-500/8 hover:text-rose-400"
                  >
                    <LogOut className="h-3 w-3" /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <Link
          href="/auth/signin"
          className="flex h-7 items-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-[11px] font-semibold text-white/40 transition hover:border-white/15 hover:text-white/60"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
