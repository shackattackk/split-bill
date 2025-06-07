"use client";

import { FullPageLoading } from "@/components/full-page-loading";

interface ReceiptProcessingContainerProps {
  isLoading: boolean;
  error: string | null;
  children: React.ReactNode;
}

export function ReceiptProcessingContainer({
  isLoading,
  error,
  children,
}: ReceiptProcessingContainerProps) {
  if (isLoading) {
    return <FullPageLoading />;
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        </div>
      )}
      {children}
    </>
  );
}
