import { render, screen, act, within } from "@testing-library/react";
import SplitBillClient from "../split-table-client";
import "@testing-library/jest-dom";
import { Transaction } from "@/types/split-bill";

// This tells Jest to use our mock implementation from src/lib/__mocks__/supabase.ts
jest.mock("@/lib/supabase");

// Mock the useSplitBillSubscriptions hook to isolate the component
jest.mock("@/hooks/use-split-bill-subscription", () => ({
  useSplitBillSubscriptions: jest.fn((
    transactionId,
    initialParticipants,
    initialItems,
    setTransaction
  ) => {
    // This mock will return state that can be updated by our tests
    const [people, setPeople] = jest.requireActual("react").useState(initialParticipants);
    const [editedItems, setEditedItems] = jest.requireActual("react").useState(initialItems);
    const [selectedItems, setSelectedItems] = jest.requireActual("react").useState(() => {
        const initialSelected: Record<number, number[]> = {};
        initialParticipants.forEach((p: any) => (initialSelected[p.id] = p.items));
        return initialSelected;
    });

    // Listen for mock events to update state
    jest.requireActual("react").useEffect(() => {
      const channel = {
        subscribe: () => {
          (global as any).__mockOn = (payload: any) => {
             if (payload.table === 'participants' && payload.eventType === 'INSERT') {
              setPeople((p: any) => [...p, { ...payload.new, items: []}]);
            }
             if (payload.table === 'line_items' && payload.eventType === 'INSERT') {
              setEditedItems((i: any) => [...i, payload.new]);
            }
            if (payload.table === 'participant_items' && payload.eventType === 'INSERT') {
               setSelectedItems((s: any) => ({
                ...s,
                [payload.new.participant_id]: [...(s[payload.new.participant_id] || []), payload.new.line_item_id],
              }));
            }
          };
          return { unsubscribe: () => {} };
        }
      };

      (global as any).__mockChannel = channel.subscribe();

      return () => {
        if ((global as any).__mockChannel) {
          (global as any).__mockChannel.unsubscribe();
        }
      };
    }, []);

    return { people, editedItems, selectedItems, setSelectedItems };
  }),
}));

describe("SplitBillClient Real-time Updates", () => {
  const mockTransaction: Transaction = {
    id: "123-456",
    restaurant: "The Mock Restaurant",
    date: new Date().toLocaleDateString(),
    tax: 10,
    tip: 20,
    items: [{ id: 1, description: "Pizza", amount: 25 }],
    participants: [
      { id: 101, name: "Alice", items: [] },
    ],
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it("should display a new person when a participant event is received", () => {
    render(<SplitBillClient transaction={mockTransaction} />);

    // Initially, Bob is not there
    const peopleList = screen.getByTestId("people-list");
    expect(within(peopleList).queryByText("Bob")).not.toBeInTheDocument();


    // Manually trigger a mock Supabase event for a new participant
     act(() => {
        (global as any).__mockOn({
        table: 'participants',
        eventType: "INSERT",
        new: { id: 102, name: "Bob", transaction_id: mockTransaction.id },
      });
    });

    // Now, Bob should be visible in the component
    expect(within(peopleList).getByText("Bob")).toBeInTheDocument();
  });

  it("should display a new item when a line_item event is received", () => {
    render(<SplitBillClient transaction={mockTransaction} />);

    // Initially, the new item is not there
    expect(screen.queryByText("Salad")).not.toBeInTheDocument();

     act(() => {
        (global as any).__mockOn({
        table: 'line_items',
        eventType: "INSERT",
        new: { id: 2, description: "Salad", amount: 12 },
      });
    });

    expect(screen.getByText("Salad")).toBeInTheDocument();
    expect(screen.getByText("$12.00")).toBeInTheDocument();
  });

  it("should update the summary when an item is selected via a participant_items event", () => {
    render(<SplitBillClient transaction={mockTransaction} />);

    // We need a data-testid to reliably select the summary card
    // Let's assume the Summary component has been modified to include it:
    // <div data-testid={`summary-card-${person.id}`}>...</div>
    
    // For this test to pass, you would need to modify `src/components/split-bill/summary.tsx`
    // to add the data-testid attribute. I'll proceed assuming it's there.

    // Initially, Alice's total is $0.00.
    // The test will fail here if the data-testid is not present.
    const summaryCard = screen.getByTestId("summary-card-101");
    expect(summaryCard).toHaveTextContent("$0.00");
    
     act(() => {
        (global as any).__mockOn({
        table: 'participant_items',
        eventType: "INSERT",
        new: { participant_id: 101, line_item_id: 1, is_selected: true },
      });
    });
    
    expect(summaryCard).toHaveTextContent("$55.00");
  });
}); 