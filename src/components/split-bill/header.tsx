"use client";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <header className="w-full border-b border-slate-800/50 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="container max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <Button
          variant="default"
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-4 py-2 rounded-md flex items-center gap-2 transition-all relative cursor-pointer"
          onClick={handleCopy}
        >
          <Share2 className="h-4 w-4" />
          Share Bill
          {showCopied && (
            <div className="absolute top-full mt-2 right-0 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-md shadow-lg border border-slate-700 z-50 whitespace-nowrap">
              Copied to clipboard!
            </div>
          )}
        </Button>
      </div>
    </header>
  );
} 