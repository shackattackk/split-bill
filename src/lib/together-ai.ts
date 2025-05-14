"use server";
import Together from "together-ai";

const visionLLM = "meta-llama/Llama-Vision-Free";

export async function parseReceipt(image: string) {
  const apiKey = process.env.TOGETHER_API_KEY;

  if (!apiKey) {
    throw new Error("TOGETHER_API_KEY is not set");
  }

  const together = new Together({
    apiKey,
  });

  const prompt = `
    You are a receipt parsing assistant. Extract the following information from the receipt image and return it in a structured format:

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
    6. If any information is missing, use "N/A"
    7. Keep the format consistent with the example above
    8. Do not use markdown formatting
  `;

  const output = await together.chat.completions.create({
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

  return output.choices[0].message?.content;
}
