"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingCardProps {
  message?: string;
  className?: string;
}

export function LoadingCard({ message = "Processing...", className }: LoadingCardProps) {
  return (
    <div
      className={cn(
        "mt-8 md:mt-12 max-w-lg mx-auto bg-slate-800/60 border-slate-700 shadow-2xl text-left ring-2 ring-slate-500/30 shadow-slate-500/40 rounded-xl p-16",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/0 before:via-blue-500/10 before:to-blue-500/0 before:animate-shimmer",
        "after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-blue-500/5 after:to-transparent after:animate-pulse",
        className
      )}
    >
      <div className="relative z-10 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl" />
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
        <p className="text-sm font-medium text-slate-300">{message}</p>
      </div>
    </div>
  );
}