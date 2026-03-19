"use client";

/**
 * Minimal Dialog primitives — drop-in stub for shadcn/radix Dialog.
 * Replace with full Radix implementation when needed.
 */

import React, { createContext, useContext, useState } from "react";

/* ── Context ────────────────────────────────────────────────────── */
interface DialogCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}
const DialogContext = createContext<DialogCtx>({ open: false, setOpen: () => {} });

/* ── Dialog ─────────────────────────────────────────────────────── */
export function Dialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

/* ── DialogTrigger ───────────────────────────────────────────────── */
export function DialogTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const { setOpen } = useContext(DialogContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => setOpen(true),
    });
  }

  return (
    <button type="button" onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

/* ── DialogContent ───────────────────────────────────────────────── */
export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open, setOpen } = useContext(DialogContext);
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 200,
        }}
        onClick={() => setOpen(false)}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal
        className={className}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 201,
          minWidth: 320,
        }}
      >
        {children}
      </div>
    </>
  );
}

/* ── DialogHeader ────────────────────────────────────────────────── */
export function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/* ── DialogTitle ─────────────────────────────────────────────────── */
export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h2 className={className}>{children}</h2>;
}

/* ── DialogDescription ───────────────────────────────────────────── */
export function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={className}>{children}</p>;
}
