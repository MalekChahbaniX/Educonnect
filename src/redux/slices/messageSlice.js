import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageService } from '../../api/messageService';

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (params, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessages(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await messageService.sendMessage(messageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

const initialState = {
  messages: [],
  currentConversation: [],
  unreadCount: 0,
  loading: false,
  sending: false,
  error: null,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.unshift(action.payload);
    },
    updateMessage: (state, action) => {
      const index = state.messages.findIndex(msg => msg._id === action.payload._id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    setConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addConversationMessage: (state, action) => {
      state.currentConversation.unshift(action.payload);
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.messages.unshift(action.payload);
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      });
  },
});

export const { addMessage, updateMessage, setConversation, addConversationMessage, setUnreadCount, clearError } = messageSlice.actions;

export default messageSlice.reducer;

// Selectors
export const selectMessages = (state) => state.messages.messages;
export const selectCurrentConversation = (state) => state.messages.currentConversation;
export const selectUnreadCount = (state) => state.messages.unreadCount;
export const selectLoading = (state) => state.messages.loading;
export const selectSending = (state) => state.messages.sending;
export const selectError = (state) => state.messages.error;
