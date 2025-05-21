import { db } from "@/db";
import { transactions, lineItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import SplitBillClient from "./split-table-client";
import { InferSelectModel } from "drizzle-orm";

type Transaction = InferSelectModel<typeof transactions>;
type LineItem = InferSelectModel<typeof lineItems>;

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SplitBillPage({ params }: PageProps) {
  const { id: transactionId } = await params;
  const transaction = await db.query.transactions.findFirst({
    where: eq(transactions.id, transactionId),
    with: {
      lineItems: true,
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
      }}
    />
  );
}
