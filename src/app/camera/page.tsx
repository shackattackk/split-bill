"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ReceiptProcessingContainer } from "@/components/receipt-processing-container";
import { useReceiptProcessing } from "@/hooks/use-receipt-processing";
import { track } from "@vercel/analytics";

export default function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { processReceipt, isLoading, error } = useReceiptProcessing();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setCameraError(
        "Error accessing camera: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.load();
      }
    } catch (error) {
      console.error("Error stopping camera:", error);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    track("capture_photo_clicked");
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64data = e.target?.result as string;
            await processReceipt(base64data);
            stopCamera();
          };
          reader.readAsDataURL(blob);
        }
      }, "image/jpeg");
    }
  };

  useEffect(() => {
    startCamera();

    const video = videoRef.current;

    return () => {
      stopCamera();
      if (video) {
        video.srcObject = null;
        video.load();
      }
    };
  }, []);

  const handleCancel = () => {
    stopCamera();
    router.back();
  };

  return (
    <ReceiptProcessingContainer isLoading={isLoading} error={error}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md sm:max-w-2xl bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700">
          <header className="flex items-center justify-between p-4 border-b border-slate-800">
            <h1 className="text-xl font-medium text-white">Take Photo</h1>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
              onClick={handleCancel}
            >
              <X className="h-6 w-6" />
            </Button>
          </header>
          <main className="flex flex-col">
            <div className="relative bg-black aspect-[3/4] rounded-b-2xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: "scale(1.1)" }}
              />
              <div className="absolute inset-0 border-4 border-slate-800/50 rounded-b-2xl pointer-events-none" />
            </div>
            {cameraError && (
              <p className="mt-4 text-sm text-red-400 text-center px-4">
                {cameraError}
              </p>
            )}
            <div className="p-4 flex gap-4">
              <Button
                variant="outline"
                className="flex-1 border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-white transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                onClick={capturePhoto}
              >
                Take Photo
              </Button>
            </div>
          </main>
        </div>
      </div>
    </ReceiptProcessingContainer>
  );
}
