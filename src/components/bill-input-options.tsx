"use client";

import { Upload, Camera, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { parseReceiptTask } from "@/app/api/actions";
import { FullPageLoading } from "@/components/full-page-loading";

interface TaskOutput {
  runId: string;
  publicAccessToken: string;
}

export function BillInputOptions() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [taskOutput, setTaskOutput] = useState<TaskOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { run: runData, error: runError } = useRealtimeRun(taskOutput?.runId, {
    accessToken: taskOutput?.publicAccessToken,
    enabled: !!taskOutput?.runId,
    onComplete: (run) => {
      if (run.output?.transactionId) {
        router.push(`/split/${run.output?.transactionId}`);
      } else {
        setIsLoading(false);
        setUploadError("Failed to parse receipt");
      }
    },
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    try {
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Please upload a valid image file (PNG, JPEG, JPG)");
      }

      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        throw new Error("File size must be less than 5MB");
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        localStorage.setItem("receiptImage", base64);
        try {
          setIsLoading(true);
          const taskOutput = await parseReceiptTask(base64);
          if (taskOutput?.handle) {
            setTaskOutput({
              runId: taskOutput.handle.id,
              publicAccessToken: taskOutput.handle.publicAccessToken,
            });
          }
        } catch (error) {
          setUploadError(
            error instanceof Error
              ? error.message
              : "An error occurred during processing"
          );
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "An error occurred during upload"
      );
    }
  };

  const handleTakePhotoClick = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Camera access not supported");
      return;
    }

    router.push("/camera");
  };

  const handleManualEntryClick = () => {
    console.log("Enter Items Manually clicked");
  };

  return (
    <>
      {isLoading ? (
        <FullPageLoading />
      ) : (
        <Card className="mt-8 md:mt-12 max-w-lg mx-auto bg-slate-800/60 border-slate-700 shadow-2xl text-left ring-2 ring-slate-500/30 shadow-slate-500/40">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-slate-100">
              Add Your Bill
            </CardTitle>
            <CardDescription className="text-slate-400">
              Choose how you want to add your bill items:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                aria-label="Upload receipt image"
              />
              <Button
                variant="outline"
                className="w-full justify-start gap-3 text-base py-6 border-slate-600 hover:bg-slate-700/50 hover:text-slate-100 cursor-pointer"
                onClick={handleUploadClick}
                disabled={isLoading}
                aria-busy={isLoading}
              >
                <Upload className="h-5 w-5 text-blue-400" />
                Upload Receipt Image
              </Button>
              {uploadError && (
                <p className="mt-2 text-sm text-red-400">{uploadError}</p>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-base py-6 border-slate-600 hover:bg-slate-700/50 hover:text-slate-100 cursor-pointer"
              onClick={handleTakePhotoClick}
            >
              <Camera className="h-5 w-5 text-green-400" />
              Take a Photo
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-base py-6 border-slate-600 hover:bg-slate-700/50 hover:text-slate-100 cursor-pointer"
              onClick={handleManualEntryClick}
            >
              <Edit3 className="h-5 w-5 text-orange-400" />
              Enter Items Manually
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
