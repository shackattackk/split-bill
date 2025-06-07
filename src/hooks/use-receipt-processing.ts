import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { TaskOutput } from "@/types/task";
import { parseReceiptTask } from "@/app/api/actions";

export function useReceiptProcessing() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskOutput, setTaskOutput] = useState<TaskOutput | null>(null);


  useRealtimeRun(taskOutput?.runId, {
    accessToken: taskOutput?.publicAccessToken,
    enabled: !!taskOutput?.runId,
    onComplete: (run) => {
      if (run.output?.transactionId) {
        router.push(`/split/${run.output?.transactionId}`);
      } else {
        setIsLoading(false);
        setError("Failed to parse receipt");
      }
    },
  });

  const processReceipt = async (base64Image: string) => {
    setIsLoading(true);
    setError(null);
    setTaskOutput(null);
    try {
      const taskOutput = await parseReceiptTask(base64Image);
      if (taskOutput?.handle) {
        setTaskOutput({
          runId: taskOutput.handle.id,
          publicAccessToken: taskOutput.handle.publicAccessToken,
        });
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during processing"
      );
    }
  };

  return {
    isLoading,
    error,
    processReceipt,
  };
}
