// A map to store the callback functions for different tables.
const onHandlers: Record<string, (payload: any) => void> = {};

// This function allows our tests to manually trigger a 'postgres_changes' event.
export const __triggerSupabaseEvent = (
  table: string,
  payload: { eventType: string; new: any }
) => {
  if (onHandlers[table]) {
    onHandlers[table](payload);
  }
};

type ChannelMock = {
  on: jest.Mock<any, any>;
  subscribe: jest.Mock<any, any>;
};

const channelMock: ChannelMock = {
  on: jest.fn((event, config, callback) => {
    // Store the callback for the table being listened to.
    onHandlers[config.table] = callback;
    return channelMock; // Allow chaining .on().subscribe()
  }),
  subscribe: jest.fn((callback) => {
    if (callback) {
      callback("SUBSCRIBED");
    }
    // Return an unsubscribe function to mimic the real client.
    return {
      unsubscribe: jest.fn(),
    };
  }),
};

export const supabase = {
  // Mock the standard query methods.
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ error: null, data: [{}] }),
    update: jest.fn().mockResolvedValue({ error: null, data: [{}] }),
    match: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  })),
  // Mock the channel method to return our channel mock.
  channel: jest.fn(() => channelMock),
}; 