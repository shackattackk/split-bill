"use server";

import type { parseReceipt } from "@/lib/trigger/together-ai-parse-receipt";
import { helloWorldTask } from "@/lib/trigger/example";
import { tasks } from "@trigger.dev/sdk/v3";

export async function parseReceiptTask(image: string) {
  try {
    const handle = await tasks.trigger<typeof parseReceipt>(
      "parse-receipt",
      image
    );
    
    return { handle };
  } catch (error) {
    console.error(error);
    return {
      error: "something went wrong",
    };
  }
}
