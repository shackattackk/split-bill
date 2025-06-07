import { db } from "@/db";
import { transactions, lineItems, participants, participantItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import SplitBillClient from "./split-table-client";
import { InferSelectModel } from "drizzle-orm";
import { z } from "zod";

type LineItem = InferSelectModel<typeof lineItems>;
type Participant = InferSelectModel<typeof participants>;
type ParticipantItem = InferSelectModel<typeof participantItems>;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export default async function SplitBillPage({ params }: PageProps) {
  const { id: transactionId } = await params;
 
  const parsedParams = paramsSchema.safeParse({id: transactionId});
  if (!parsedParams.success) {
    notFound();
  }

  const transaction = await db.query.transactions.findFirst({
    where: eq(transactions.id, transactionId),
    with: {
      lineItems: true,
      participants: {
        with: {
          participantItems: true
        }
      }
    },
  });

  if (!transaction) {
    notFound();
  }

  return (
    <SplitBillClient
      transaction={{
        id: transaction.id,
        restaurant: transaction.restaurant || "Unknown Restaurant",
        date: transaction.createdAt?.toLocaleDateString() || new Date().toLocaleDateString(),
        tax: Number(transaction.tax || 0),
        tip: Number(transaction.tip || 0),
        items: transaction.lineItems.map((item: LineItem) => ({
          id: item.id,
          name: item.description || "Unknown Item",
          price: Number(item.amount),
        })),
        participants: transaction.participants.map((participant: Participant & { participantItems: ParticipantItem[] }) => ({
          id: participant.id,
          name: participant.name || "Unknown Person",
          items: participant.participantItems
            .filter((pi) => pi.isSelected && pi.lineItemId !== null)
            .map((pi) => pi.lineItemId as number),
        })),
      }}
    />
  );
}
