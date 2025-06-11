const onHandlers: Record<string, (payload: any) => void> = {};

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
    onHandlers[config.table] = callback;
    return channelMock; 
  }),
  subscribe: jest.fn((callback) => {
    if (callback) {
      callback("SUBSCRIBED");
    }
    return {
      unsubscribe: jest.fn(),
    };
  }),
};

export const supabase = {
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ error: null, data: [{}] }),
    update: jest.fn().mockResolvedValue({ error: null, data: [{}] }),
    match: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  })),
  channel: jest.fn(() => channelMock),
};