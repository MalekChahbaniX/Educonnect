import io from 'socket.io-client';
import { store } from '../redux/store';
import { 
  setConnecting, 
  setConnected, 
  setSocketError, 
  setUserTyping,
  addMessage,
  updateMessage 
} from '../redux/slices/socketSlice';
import { addMessage as addMessageToMessages } from '../redux/slices/messageSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    store.dispatch(setConnecting(true));

    const socketURL = __DEV__ 
      ? 'http://localhost:5000' 
      : 'https://your-production-api.com';

    this.socket = io(socketURL, {
      auth: {
        token,
      },
      transports: ['websocket'],
      timeout: 10000,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      store.dispatch(setConnected(true));
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      store.dispatch(setConnected(false));
      
      if (reason === 'io server disconnect') {
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      store.dispatch(setSocketError(error.message));
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnect();
      }
    });

    this.socket.on('new_message', (message) => {
      console.log('📨 New message received:', message);
      store.dispatch(addMessageToMessages(message));
      store.dispatch(addMessage(message));
    });

    this.socket.on('message_sent', (message) => {
      console.log('📤 Message sent confirmation:', message);
      store.dispatch(updateMessage(message));
    });

    this.socket.on('message_read', (data) => {
      console.log('📖 Message read:', data);
      store.dispatch(updateMessage({ _id: data.messageId, readAt: data.readAt }));
    });

    this.socket.on('user_typing', (data) => {
      console.log('⌨️ User typing:', data);
      store.dispatch(setUserTyping(data));
    });

    this.socket.on('message_error', (error) => {
      console.error('Message error:', error);
      store.dispatch(setSocketError(error.message));
    });

    this.socket.on('student_updated', (data) => {
      console.log('👨‍🎓 Student updated:', data);
    });

    this.socket.on('announcement', (data) => {
      console.log('📢 Announcement received:', data);
    });
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.socket?.connected) {
        this.socket.connect();
      }
    }, delay);
  }

  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
      this.socket = null;
      store.dispatch(setConnected(false));
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  sendMessage(messageData) {
    this.emit('send_message', messageData);
  }

  markTyping(recipient) {
    this.emit('mark_typing', { recipient });
  }

  stopTyping(recipient) {
    this.emit('stop_typing', { recipient });
  }

  markMessageRead(messageId) {
    this.emit('mark_read', messageId);
  }

  joinClass(classId) {
    this.emit('join_class', classId);
  }

  leaveClass(classId) {
    this.emit('leave_class', classId);
  }

  joinStudentRoom(studentId) {
    this.emit('join_student_room', studentId);
  }

  leaveStudentRoom(studentId) {
    this.emit('leave_student_room', studentId);
  }

  sendClassAnnouncement(classId, title, message, priority = 'normal') {
    this.emit('class_announcement', {
      classId,
      title,
      message,
      priority,
    });
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
