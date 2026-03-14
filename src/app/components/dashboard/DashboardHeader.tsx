"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, User as UserIcon, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardHeader() {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="flex items-center gap-5">
      {session ? (
        <div className="relative">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-400 hover:shadow-md"
          >
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt="User Profile"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full ring-2 ring-slate-100"
              />
            ) : (
              <UserIcon size={20} className="text-slate-500" />
            )}
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_32px_80px_-24px_rgba(15,23,42,0.4)]"
              >
                <div className="px-4 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Account
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-950">
                    {session.user?.name || "Member"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {session.user?.email}
                  </p>
                </div>
                <div className="h-px bg-slate-100 mx-1 mb-1" />
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <Link
          href="/auth/signin"
          className="text-sm font-bold text-slate-600 transition hover:text-slate-950"
        >
          Log in
        </Link>
      )}

      <Link
        href="/builder/new"
        className="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-[0_15px_30px_-12px_rgba(15,23,42,0.45)] transition hover:bg-slate-800 hover:scale-[1.02] active:scale-95"
      >
        <Plus className="h-4 w-4" />
        New Project
      </Link>
    </div>
  );
}
