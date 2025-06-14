import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TransactionItem, Person, Transaction } from "@/types/split-bill";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface ParticipantItemPayload {
  participant_id: number;
  line_item_id: number;
  is_selected: boolean;
}

export function useSplitBillSubscriptions(
  transactionId: string,
  initialPeople: Person[],
  initialItems: TransactionItem[],
  setTransaction: (updater: (prev: Transaction) => Transaction) => void
) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [editedItems, setEditedItems] =
    useState<TransactionItem[]>(initialItems);
  const [selectedItems, setSelectedItems] = useState<Record<number, number[]>>(
    () => {
      const initialSelectedItems: Record<number, number[]> = {};
      initialPeople.forEach((participant) => {
        initialSelectedItems[participant.id] = participant.items;
      });
      return initialSelectedItems;
    }
  );

  useEffect(() => {
    const channel = supabase
      .channel("line_items_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "line_items",
          filter: `transaction_id=eq.${transactionId}`,
        },
        (payload: RealtimePostgresChangesPayload<TransactionItem>) => {
          if (payload.eventType === "INSERT") {
            setEditedItems((current) => [...current, payload.new]);
            setTransaction((prev) => ({
              ...prev,
              items: [...prev.items, payload.new],
            }));
          } else if (payload.eventType === "UPDATE") {
            setEditedItems((current) =>
              current.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
            setTransaction((prev) => ({
              ...prev,
              items: prev.items.map((item) =>
                item.id === payload.new.id ? payload.new : item
              ),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [transactionId, setTransaction]);

  useEffect(() => {
    const channel = supabase
      .channel("participants_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `transaction_id=eq.${transactionId}`,
        },
        (payload: RealtimePostgresChangesPayload<Person>) => {
          if (payload.eventType === "INSERT") {
            setPeople((current) => [...current, { ...payload.new, items: [] }]);
          } else if (payload.eventType === "UPDATE") {
            setPeople((current) =>
              current.map((person) =>
                person.id === payload.new.id
                  ? { ...payload.new, items: person.items }
                  : person
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [transactionId]);

  useEffect(() => {
    if (people.length === 0) return;

    const channel = supabase
      .channel("participant_items_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participant_items",
          filter: `participant_id=in.(${people.map((p) => p.id).join(",")})`,
        },
        (payload: RealtimePostgresChangesPayload<ParticipantItemPayload>) => {
          if (payload.eventType == "INSERT" && payload.new.is_selected) {
            const participantId = payload.new.participant_id;
            if (typeof participantId === "number") {
              setSelectedItems((current) => {
                const personItems = current[participantId] || [];
                if (personItems.includes(payload.new.line_item_id)) {
                  return current;
                }
                return {
                  ...current,
                  [participantId]: [...personItems, payload.new.line_item_id],
                };
              });
            }
          } else if (
            payload.eventType === "UPDATE" &&
            !payload.new.is_selected
          ) {
            const participantId = payload.new.participant_id;
            if (typeof participantId === "number") {
              setSelectedItems((current) => {
                const personItems = current[participantId] || [];
                return {
                  ...current,
                  [participantId]: personItems.filter(
                    (id: number) => id !== payload.new.line_item_id
                  ),
                };
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [people]);

  return {
    people,
    editedItems,
    selectedItems,
    setSelectedItems,
  };
}
