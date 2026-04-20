// Mock service pour l'instant - remplacer par API réelle plus tard
export const messageService = {
  sendMessage: async (messageData) => {
    return { success: true, data: { ...messageData, _id: Date.now().toString() } };
  },

  getMessages: async (params = {}) => {
    return { success: true, data: { messages: [] } };
  },

  getMessage: async (messageId) => {
    return { success: true, data: { _id: messageId, content: 'Mock message' } };
  },

  markAsRead: async (messageId) => {
    return { success: true, data: { _id: messageId, readAt: new Date() } };
  },

  deleteMessage: async (messageId) => {
    return { success: true };
  },

  getUnreadCount: async () => {
    return { success: true, data: { unreadCount: 0 } };
  },

  getConversation: async (userId, params = {}) => {
    return { success: true, data: { messages: [] } };
  }
};
