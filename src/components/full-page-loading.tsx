"use client";

import { Receipt } from "lucide-react";

interface FullPageLoadingProps {
  message?: string;
  className?: string;
}

export function FullPageLoading({
  message = "Processing your receipt...",
}: FullPageLoadingProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 animate-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-8">
        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
          <div className="relative flex items-center justify-center">
            <Receipt className="h-16 w-16 text-blue-400 animate-bounce" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-slate-100">{message}</h2>
          <p className="text-sm text-slate-400">
            This may take a few moments...
          </p>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-blue-400"
              style={{
                animation: `bounce 1.4s infinite ease-in-out ${i * 0.16}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
