import { render, screen, act, within, fireEvent } from "@testing-library/react";
import SplitBillClient from "../split-table-client";
import "@testing-library/jest-dom";
import { Transaction } from "@/types/split-bill";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase");

jest.mock("@/hooks/use-split-bill-subscription", () => ({
  useSplitBillSubscriptions: jest.fn(
    (transactionId, initialParticipants, initialItems, setTransaction) => {
      const [people, setPeople] = jest
        .requireActual("react")
        .useState(initialParticipants);
      const [editedItems, setEditedItems] = jest
        .requireActual("react")
        .useState(initialItems);
      const [selectedItems, setSelectedItems] = jest
        .requireActual("react")
        .useState(() => {
          const initialSelected: Record<number, number[]> = {};
          initialParticipants.forEach(
            (p: any) => (initialSelected[p.id] = p.items || [])
          );
          return initialSelected;
        });

      jest.requireActual("react").useEffect(() => {
        const channel = {
          subscribe: () => {
            (global as any).__mockOn = (payload: any) => {
              if (
                payload.table === "participants" &&
                payload.eventType === "INSERT"
              ) {
                setPeople((p: any) => [...p, { ...payload.new, items: [] }]);
              }
              if (
                payload.table === "line_items" &&
                payload.eventType === "INSERT"
              ) {
                setEditedItems((i: any) => [...i, payload.new]);
              }
              if (
                payload.table === "participant_items" &&
                (payload.eventType === "INSERT" ||
                  (payload.eventType === "UPDATE" && payload.new.is_selected))
              ) {
                setSelectedItems((s: any) => ({
                  ...s,
                  [payload.new.participant_id]: [
                    ...(s[payload.new.participant_id] || []),
                    payload.new.line_item_id,
                  ],
                }));
              }
              if (
                payload.table === "participant_items" &&
                (payload.eventType === "DELETE" ||
                  (payload.eventType === "UPDATE" && !payload.new.is_selected))
              ) {
                setSelectedItems((s: any) => ({
                  ...s,
                  [payload.new.participant_id]: (
                    s[payload.new.participant_id] || []
                  ).filter((id: number) => id !== payload.new.line_item_id),
                }));
              }
            };
            return { unsubscribe: () => {} };
          },
        };

        (global as any).__mockChannel = channel.subscribe();

        return () => {
          if ((global as any).__mockChannel) {
            (global as any).__mockChannel.unsubscribe();
          }
        };
      }, []);

      return {
        people,
        editedItems,
        selectedItems,
        setSelectedItems,
        setTransaction,
      };
    }
  ),
}));

describe("SplitBillClient Real-time Updates", () => {
  const mockTransaction: Transaction = {
    id: "123-456",
    restaurant: "The Mock Restaurant",
    date: new Date().toLocaleDateString(),
    tax: 10,
    tip: 20,
    items: [{ id: 1, description: "Pizza", amount: 25 }],
    participants: [{ id: 101, name: "Alice", items: [] }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display a new person when a participant event is received", () => {
    render(<SplitBillClient transaction={mockTransaction} />);

    const peopleList = screen.getByTestId("people-list");
    expect(within(peopleList).queryByText("Bob")).not.toBeInTheDocument();

    act(() => {
      (global as any).__mockOn({
        table: "participants",
        eventType: "INSERT",
        new: { id: 102, name: "Bob", transaction_id: mockTransaction.id },
      });
    });

    expect(within(peopleList).getByText("Bob")).toBeInTheDocument();
  });

  it("should display a new item when a line_item event is received", () => {
    render(<SplitBillClient transaction={mockTransaction} />);

    expect(screen.queryByText("Salad")).not.toBeInTheDocument();

    act(() => {
      (global as any).__mockOn({
        table: "line_items",
        eventType: "INSERT",
        new: { id: 2, description: "Salad", amount: 12 },
      });
    });

    expect(screen.getByText("Salad")).toBeInTheDocument();
    expect(screen.getByText("$12.00")).toBeInTheDocument();
  });

  it("should update the summary when an item is selected via a participant_items event", () => {
    render(<SplitBillClient transaction={mockTransaction} />);

    const summaryCard = screen.getByTestId("summary-card-101");
    expect(summaryCard).toHaveTextContent("$0.00");

    act(() => {
      (global as any).__mockOn({
        table: "participant_items",
        eventType: "INSERT",
        new: { participant_id: 101, line_item_id: 1, is_selected: true },
      });
    });

    expect(summaryCard).toHaveTextContent("$55.00");
  });
});

describe("SplitBillClient User Interactions", () => {
  const mockTransaction: Transaction = {
    id: "user-interaction-test",
    restaurant: "The Interactive Diner",
    date: new Date().toLocaleDateString(),
    tax: 10,
    tip: 20,
    items: [{ id: 1, description: "Burger", amount: 15 }],
    participants: [{ id: 101, name: "Charlie", items: [] }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should disable the 'Add Person' button when the input is empty", () => {
    render(<SplitBillClient transaction={mockTransaction} />);
    const addPersonInput = screen.getByTestId("add-person-input");
    const addPersonButton = screen.getByTestId("add-person-button");

    expect(addPersonInput).toHaveValue("");
    expect(addPersonButton).toBeDisabled();
  });

  it("should call supabase to add an item and display it on real-time event", async () => {
    render(<SplitBillClient transaction={mockTransaction} />);
    const insertMock = jest.fn().mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    fireEvent.click(screen.getByTestId("add-item-popover-trigger"));
    fireEvent.change(screen.getByTestId("add-item-name-input"), {
      target: { value: "Fries" },
    });
    fireEvent.change(screen.getByTestId("add-item-price-input"), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByTestId("add-item-submit-button"));

    expect(supabase.from).toHaveBeenCalledWith("line_items");
    expect(insertMock).toHaveBeenCalledWith({
      transaction_id: mockTransaction.id,
      description: "Fries",
      amount: 5,
    });

    expect(screen.queryByText("Fries")).not.toBeInTheDocument();

    act(() => {
      (global as any).__mockOn({
        table: "line_items",
        eventType: "INSERT",
        new: { id: 99, description: "Fries", amount: 5 },
      });
    });

    expect(screen.getByText("Fries")).toBeInTheDocument();
    expect(screen.getByText("$5.00")).toBeInTheDocument();
  });

  it("should show the input when clicking on the tax display", () => {
    render(<SplitBillClient transaction={mockTransaction} />);
    const taxDisplay = screen.getByTestId("tax-display");

    fireEvent.click(taxDisplay);

    const taxInput = screen.getByTestId("tax-input");
    expect(taxInput).toBeInTheDocument();
    expect(taxInput).toHaveValue(10);
  });

  it("should deselect an item from a real-time event and update the summary", () => {
    const initialTransaction = {
      ...mockTransaction,
      participants: [
        {
          id: 101,
          name: "Dani",
          items: [1],
        },
      ],
    };

    render(<SplitBillClient transaction={initialTransaction} />);
    const summaryCard = screen.getByTestId("summary-card-101");
    expect(summaryCard.textContent).not.toContain("$0.00");

    act(() => {
      (global as any).__mockOn({
        table: "participant_items",
        eventType: "UPDATE",
        new: { participant_id: 101, line_item_id: 1, is_selected: false },
      });
    });

    expect(summaryCard).toHaveTextContent("$0.00");
  });
});

describe("SplitBillClient Advanced Real-time Scenarios", () => {
  const mockTransaction: Transaction = {
    id: "advanced-test",
    restaurant: "The Real-time Cafe",
    date: new Date().toLocaleDateString(),
    tax: 10,
    tip: 20,
    items: [
      { id: 1, description: "Coffee", amount: 4 },
      { id: 2, description: "Cake", amount: 8 },
    ],
    participants: [
      { id: 101, name: "Dani", items: [] },
      { id: 102, name: "Eli", items: [] },
    ],
  };

//   it("should update an item's description and price from a real-time event", () => {
//     render(<SplitBillClient transaction={mockTransaction} />);
//     const itemRow = screen.getByTestId("item-row-1");
//     expect(within(itemRow).getByText("Coffee")).toBeInTheDocument();
//     expect(within(itemRow).getByText("$4.00")).toBeInTheDocument();

//     act(() => {
//       (global as any).__mockOn({
//         table: "line_items",
//         eventType: "UPDATE",
//         new: { id: 1, description: "Espresso", amount: 5 },
//       });
//     });

//     expect(within(itemRow).getByText("Espresso")).toBeInTheDocument();
//     expect(within(itemRow).getByText("$5.00")).toBeInTheDocument();
//   });

  it("should update summaries correctly when multiple people select the same item", () => {
    render(<SplitBillClient transaction={mockTransaction} />);
    const daniSummary = screen.getByTestId("summary-card-101");
    const eliSummary = screen.getByTestId("summary-card-102");

    expect(daniSummary).toHaveTextContent("$0.00");
    expect(eliSummary).toHaveTextContent("$0.00");

    act(() => {
      (global as any).__mockOn({
        table: "participant_items",
        eventType: "INSERT",
        new: { participant_id: 101, line_item_id: 2, is_selected: true },
      });
    });

    expect(daniSummary.textContent).toContain("$38.00");
    expect(eliSummary).toHaveTextContent("$0.00");

    act(() => {
      (global as any).__mockOn({
        table: "participant_items",
        eventType: "INSERT",
        new: { participant_id: 102, line_item_id: 2, is_selected: true },
      });
    });

    expect(daniSummary.textContent).toContain("$19.00");
    expect(eliSummary.textContent).toContain("$19.00");
  });

  it("should handle a new person joining and immediately selecting an item", () => {
    render(<SplitBillClient transaction={mockTransaction} />);

    act(() => {
      (global as any).__mockOn({
        table: "participants",
        eventType: "INSERT",
        new: { id: 103, name: "Frank", transaction_id: mockTransaction.id },
      });
    });

    const peopleList = screen.getByTestId("people-list");
    expect(within(peopleList).getByText("Frank")).toBeInTheDocument();
    const frankSummary = screen.getByTestId("summary-card-103");
    expect(frankSummary).toBeInTheDocument();
    expect(frankSummary).toHaveTextContent("$0.00");

    act(() => {
      (global as any).__mockOn({
        table: "participant_items",
        eventType: "INSERT",
        new: { participant_id: 103, line_item_id: 1, is_selected: true },
      });
    });

    expect(frankSummary.textContent).toContain("$4.00");
  });
});
