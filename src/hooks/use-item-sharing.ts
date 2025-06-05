import { useMemo } from "react";
import { Person, TransactionItem } from "@/types/split-bill";

interface UseItemSharingProps {
  items: TransactionItem[];
  people: Person[];
  selectedItems: Record<number, number[]>;
}

export function useItemSharing({
  items,
  people,
  selectedItems,
}: UseItemSharingProps) {
  const sharingCalculations = useMemo(() => {
    const sharingMap = new Map<number, number>();
    const itemTotals = new Map<number, number>();

    items.forEach((item) => {
      const sharingCount = people.filter((p) =>
        selectedItems[p.id]?.includes(item.id)
      ).length;
      sharingMap.set(item.id, sharingCount);
    });

    people.forEach((person) => {
      const personItems = selectedItems[person.id] || [];
      personItems.forEach((itemId) => {
        const item = items.find((i) => i.id === itemId);
        const sharingCount = sharingMap.get(itemId) || 1;
        const currentTotal = itemTotals.get(person.id) || 0;
        itemTotals.set(
          person.id,
          currentTotal + (item?.price || 0) / sharingCount
        );
      });
    });

    return {
      sharingMap,
      itemTotals,
    };
  }, [items, people, selectedItems]);

  const getSharingCount = (itemId: number) => {
    return sharingCalculations.sharingMap.get(itemId) || 1;
  };

  const isItemShared = (itemId: number) => {
    return (sharingCalculations.sharingMap.get(itemId) || 1) > 1;
  };

  const getPersonTotal = (personId: number) => {
    return sharingCalculations.itemTotals.get(personId) || 0;
  };

  return {
    getSharingCount,
    isItemShared,
    getPersonTotal,
  };
}
