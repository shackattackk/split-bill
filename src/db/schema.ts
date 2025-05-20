import {
  integer,
  pgTable,
  varchar,
  uuid,
  timestamp,
  boolean,
  decimal,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const transactionStatusEnum = pgEnum("transaction_status", [
  "active",
  "completed",
  "cancelled",
]);

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  imageUrl: varchar("image_url"),
  restaurant: varchar("restaurant"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  tip: decimal("tip", { precision: 10, scale: 2 }).default("0"),
  status: transactionStatusEnum("status").default("active"),
});

export const lineItems = pgTable("line_items", {
  id: serial("id").primaryKey(),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  description: varchar("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  quantity: integer("quantity").default(1),
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  name: varchar("name"),
  email: varchar("email"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const participantItems = pgTable("participant_items", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").references(() => participants.id),
  lineItemId: integer("line_item_id").references(() => lineItems.id),
  isSelected: boolean("is_selected").default(false),
});

// Relations
export const transactionsRelations = relations(transactions, ({ many }) => ({
  lineItems: many(lineItems),
  participants: many(participants),
}));

export const lineItemsRelations = relations(lineItems, ({ one, many }) => ({
  transaction: one(transactions, {
    fields: [lineItems.transactionId],
    references: [transactions.id],
  }),
  participantItems: many(participantItems),
}));

export const participantsRelations = relations(participants, ({ one, many }) => ({
  transaction: one(transactions, {
    fields: [participants.transactionId],
    references: [transactions.id],
  }),
  participantItems: many(participantItems),
}));

export const participantItemsRelations = relations(participantItems, ({ one }) => ({
  participant: one(participants, {
    fields: [participantItems.participantId],
    references: [participants.id],
  }),
  lineItem: one(lineItems, {
    fields: [participantItems.lineItemId],
    references: [lineItems.id],
  }),
}));
