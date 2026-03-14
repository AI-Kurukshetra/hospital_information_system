"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      closeButton
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast: "border border-slate-200 bg-white text-slate-950 shadow-xl",
          title: "text-sm font-semibold",
          description: "text-sm text-slate-600"
        }
      }}
    />
  );
}
