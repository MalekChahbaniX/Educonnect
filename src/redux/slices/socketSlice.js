import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  connecting: false,
  error: null,
  typingUsers: {},
  onlineUsers: [],
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnecting: (state, action) => {
      state.connecting = action.payload;
    },
    setConnected: (state, action) => {
      state.connected = action.payload;
      if (action.payload) {
        state.connecting = false;
        state.error = null;
      }
    },
    setSocketError: (state, action) => {
      state.error = action.payload;
      state.connecting = false;
      state.connected = false;
    },
    setUserTyping: (state, action) => {
      const { userId, userName, isTyping } = action.payload;
      if (isTyping) {
        state.typingUsers[userId] = userName;
      } else {
        delete state.typingUsers[userId];
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    clearSocketState: (state) => {
      state.connected = false;
      state.connecting = false;
      state.error = null;
      state.typingUsers = {};
      state.onlineUsers = [];
    },
  },
});

export const {
  setConnecting,
  setConnected,
  setSocketError,
  setUserTyping,
  setOnlineUsers,
  clearSocketState,
} = socketSlice.actions;

export default socketSlice.reducer;
