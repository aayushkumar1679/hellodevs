"use client";

import React from "react";
import { useParams } from "next/navigation";
import IDEShell from "@/components/ide/IDEShell";

export default function BuilderPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  return <IDEShell projectId={id} />;
}
