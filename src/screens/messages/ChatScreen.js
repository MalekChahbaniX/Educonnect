import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage, addConversationMessage } from '../../redux/slices/messageSlice';
import { selectCurrentConversation, selectSending } from '../../redux/slices/messageSlice';
import { selectUser } from '../../redux/slices/authSlice';
import socketService from '../../sockets/socketService';

const ChatScreen = ({ route, navigation }) => {
  const { userId, userName } = route.params;
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const conversation = useSelector(selectCurrentConversation);
  const sending = useSelector(selectSending);
  
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: userName || 'Chat' });
    
    // Simuler une conversation existante
    const mockConversation = [
      {
        _id: '1',
        sender: { _id: userId, firstName: userName },
        recipient: user,
        content: 'Bonjour ! Comment allez-vous ?',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        readByRecipient: true,
      },
      {
        _id: '2',
        sender: user,
        recipient: { _id: userId, firstName: userName },
        content: 'Très bien, merci ! Et vous ?',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        readByRecipient: true,
      },
    ];
    
    dispatch({ type: 'messages/setConversation', payload: mockConversation });
  }, [dispatch, userId, userName, navigation, user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (flatListRef.current && conversation.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversation]);

  const handleSend = async () => {
    if (!messageText.trim()) return;

    try {
      const messageData = {
        recipient: userId,
        subject: 'Message',
        content: messageText.trim(),
        type: 'direct',
        priority: 'normal',
      };

      // Optimistic update
      const tempMessage = {
        _id: Date.now().toString(),
        sender: user,
        recipient: { _id: userId, firstName: userName },
        content: messageText.trim(),
        createdAt: new Date().toISOString(),
        readByRecipient: false,
      };

      dispatch(addConversationMessage(tempMessage));
      
      // Send via socket
      socketService.sendMessage(messageData);
      
      // Send via Redux
      await dispatch(sendMessage(messageData));
      
      setMessageText('');
      setIsTyping(false);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const handleTyping = (text) => {
    setMessageText(text);
    const wasTyping = isTyping;
    const isCurrentlyTyping = text.length > 0;
    
    if (wasTyping !== isCurrentlyTyping) {
      setIsTyping(isCurrentlyTyping);
      if (isCurrentlyTyping) {
        socketService.markTyping(userId);
      } else {
        socketService.stopTyping(userId);
      }
    }
  };

  const renderMessage = ({ item }) => {
    const isFromMe = item.sender?._id === user?._id;
    
    return (
      <View style={[
        styles.messageContainer,
        isFromMe ? styles.messageFromMe : styles.messageFromOther
      ]}>
        <View style={[
          styles.messageBubble,
          isFromMe ? styles.bubbleFromMe : styles.bubbleFromOther
        ]}>
          <Text style={[
            styles.messageText,
            isFromMe ? styles.textFromMe : styles.textFromOther
          ]}>
            {item?.content || ''}
          </Text>
          <Text style={[
            styles.messageTime,
            isFromMe ? styles.timeFromMe : styles.timeFromOther
          ]}>
            {item?.createdAt ? new Date(item.createdAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            }) : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>ℹ️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={conversation}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />

      <View style={styles.inputContainer}>
        {sending && (
          <View style={styles.sendingIndicator}>
            <Text style={styles.sendingText}>Envoi en cours...</Text>
          </View>
        )}
        
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={messageText}
            onChangeText={handleTyping}
            placeholder="Écrivez votre message..."
            multiline
            maxLength={1000}
            editable={!sending}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
          >
            <Text style={styles.sendButtonText}>
              {sending ? '⏳' : '➤'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2196F3',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 15,
  },
  messageContainer: {
    marginVertical: 5,
  },
  messageFromMe: {
    flexDirection: 'row-reverse',
  },
  messageFromOther: {
    flexDirection: 'row',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  bubbleFromMe: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 5,
  },
  bubbleFromOther: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  textFromMe: {
    color: '#ffffff',
  },
  textFromOther: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 5,
  },
  timeFromMe: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  timeFromOther: {
    color: '#999',
    textAlign: 'left',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendingIndicator: {
    alignItems: 'center',
    marginBottom: 5,
  },
  sendingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    maxHeight: 100,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
