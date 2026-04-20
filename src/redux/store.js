import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import messageSlice from './slices/messageSlice';
import socketSlice from './slices/socketSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    messages: messageSlice,
    socket: socketSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['auth.user'],
      },
      warnAfter: 128,
    }),
});

export { store };
