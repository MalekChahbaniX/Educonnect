import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import socketService from './src/sockets/socketService';
import { selectIsAuthenticated, selectUser, initializeAuth } from './src/redux/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContent = () => {
  const dispatch = useDispatch();
  const previousAuthStateRef = React.useRef<{ isAuthenticated: boolean; userId?: string } | null>(null);

  useEffect(() => {
    // Initialize auth from AsyncStorage
    const initializeAuthState = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          dispatch(initializeAuth({ token, user }));
        } catch (error) {
          console.error('Failed to parse stored user:', error);
        }
      }
    };

    initializeAuthState();
  }, [dispatch]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#2196F3', true);
    }

    let isSubscribed = true;
    const unsubscribe = store.subscribe(() => {
      if (!isSubscribed) return;

      const state = store.getState();
      const isAuthenticated = selectIsAuthenticated(state);
      const user = selectUser(state);
      const currentAuthState = { isAuthenticated, userId: user?._id };
      
      // Only process if auth state actually changed
      const previousState = previousAuthStateRef.current;
      if (previousState && JSON.stringify(currentAuthState) === JSON.stringify(previousState)) {
        return;
      }
      
      previousAuthStateRef.current = currentAuthState;
      
      if (isAuthenticated && user) {
        AsyncStorage.getItem('accessToken').then(token => {
          if (token && !socketService.isConnected()) {
            socketService.connect(token);
          }
        });
      } else if (socketService.isConnected()) {
        socketService.disconnect();
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
      if (socketService.isConnected()) {
        socketService.disconnect();
      }
    };
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      <AppNavigator />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
