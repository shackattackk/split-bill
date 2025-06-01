import { task } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { parseText } from "@/lib/text-parser";
import { db } from "@/db";
import { transactions, lineItems } from "@/db/schema";
import Together from "together-ai";

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

const visionLLM = "meta-llama/Llama-Vision-Free";

const receiptSchema = z.object({
  restaurant: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  items: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
    })
  ),
  subtotal: z.number().optional(),
  tax: z.number().nullable().optional(),
  tip: z.number().nullable().optional(),
  total: z.number().optional(),
});

const prompt = `
You are a receipt parsing expert. Extract the following information from the receipt image and return it in a structured format:

RESTAURANT: [restaurant name]
DATE: [date]
TIME: [time]
ITEMS:
[item name]|$[price]
[item name]|$[price]
[item name]|$[price]
END_ITEMS
SUBTOTAL: $[amount]
TAX: $[amount]
TIP: $[amount]
TOTAL: $[amount]

Rules:
1. Use all caps for section headers followed by a colon
2. Use pipe (|) as delimiter between item name and price
3. Include the dollar sign ($) before all prices
4. List all items with their prices, one per line
5. Use END_ITEMS to mark the end of the items list
6. Keep the format consistent with the example above
7. Capture tax amount and tip amount otherwise return null
8. Ensure all numerical values are accurate
9. Do not use markdown formatting
`;

export const parseReceipt = task({
  id: "parse-receipt",
  retry: {
    maxAttempts: 3,
  },
  run: async (image: string) => {
    const extractedText = await together.chat.completions.create({
      model: visionLLM,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
    });
    if (!extractedText.choices[0].message?.content) {
      throw new Error("Failed to extract text from receipt. Retrying...");
    }
    const parsedText = parseText(extractedText.choices[0].message?.content);
    const parsedOutput = receiptSchema.safeParse(parsedText);
    if (!parsedOutput.success) {
      throw new Error("Failed to parse receipt.");
    }

    const receiptData = parsedOutput.data;

    try {
      return await db.transaction(async (tx) => {
        const [transaction] = await tx
          .insert(transactions)
          .values({
            totalAmount: receiptData.total?.toString(),
            status: "active",
            imageUrl: "",
            restaurant: receiptData?.restaurant,
            tax: receiptData.tax?.toString(),
            tip: receiptData.tip?.toString(),
          })
          .returning();

        const lineItemsData: (typeof lineItems.$inferInsert)[] =
          receiptData.items.map((item) => ({
            transactionId: transaction.id,
            description: item.name,
            amount: item.price.toString(),
            quantity: 1,
          }));

        await tx.insert(lineItems).values(lineItemsData);

        return {
          transactionId: transaction.id,
          lineItems: lineItemsData,
        };
      });
    } catch (error) {
      console.error("Failed to save receipt data:", error);
      throw new Error("Failed to save receipt data. Please try again.");
    }
  },
});
