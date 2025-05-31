import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TransactionItem, Person } from "@/types/split-bill";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface ParticipantItemPayload {
  participantId: number;
  lineItemId: number;
  isSelected: boolean;
}

export function useSplitBillSubscriptions(
  transactionId: string,
  initialPeople: Person[],
  initialItems: TransactionItem[]
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
          } else if (payload.eventType === "UPDATE") {
            setEditedItems((current) =>
              current.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          } else if (payload.eventType === "DELETE") {
            setEditedItems((current) =>
              current.filter((item) => item.id !== payload.old.id)
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
          } else if (payload.eventType === "DELETE") {
            setPeople((current) =>
              current.filter((person) => person.id !== payload.old.id)
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
          if (payload.eventType === "INSERT" && payload.new.isSelected) {
            const participantId = payload.new.participantId;
            if (typeof participantId === "number") {
              setSelectedItems((current) => {
                const personItems = current[participantId] || [];
                return {
                  ...current,
                  [participantId]: [...personItems, payload.new.lineItemId],
                };
              });
            }
          } else if (
            payload.eventType === "DELETE" ||
            (payload.eventType === "UPDATE" && !payload.new.isSelected)
          ) {
            const participantId = payload.old.participantId;
            if (typeof participantId === "number") {
              setSelectedItems((current) => {
                const personItems = current[participantId] || [];
                return {
                  ...current,
                  [participantId]: personItems.filter(
                    (id: number) => id !== payload.old.lineItemId
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
