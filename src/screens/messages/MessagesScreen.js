import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMessages, sendMessage } from '../../redux/slices/messageSlice';
import { selectMessages, selectLoading, selectError } from '../../redux/slices/messageSlice';
import { selectUser } from '../../redux/slices/authSlice';

const MessagesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const messages = useSelector(selectMessages);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchMessages());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMessages());
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de rafraîchir les messages');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMessageItem = ({ item }) => {
    const isFromMe = item?.sender?._id === user?._id;
    const isRead = item?.readByRecipient || item?.readAt;

    return (
      <TouchableOpacity
        style={[
          styles.messageItem,
          isFromMe && styles.messageItemFromMe,
          !isRead && styles.messageItemUnread
        ]}
        onPress={() => navigation.navigate('Chat', {
          userId: isFromMe ? item?.recipient?._id : item?.sender?._id,
          userName: isFromMe ? item?.recipient?.firstName : item?.sender?.firstName
        })}
      >
        <View style={styles.messageHeader}>
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>
              {isFromMe ? `À: ${item?.recipient?.firstName}` : item?.sender?.firstName}
            </Text>
            <Text style={styles.messageTime}>
              {item?.createdAt ? new Date(item.createdAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              }) : ''}
            </Text>
          </View>
          <View style={styles.messageBadges}>
            {item?.priority === 'urgent' && (
              <View style={styles.urgentBadge}>
                <Text style={styles.badgeText}>Urgent</Text>
              </View>
            )}
            {!isRead && (
              <View style={styles.unreadBadge}>
                <Text style={styles.badgeText}>•</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.messageSubject} numberOfLines={1}>
          {item.subject}
        </Text>
        <Text style={styles.messageContent} numberOfLines={2}>
          {item.content}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>Aucun message</Text>
      <Text style={styles.emptySubtitle}>
        Commencez une conversation avec un enseignant
      </Text>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Erreur lors du chargement des messages: {error}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchMessages())}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity
          style={styles.newMessageButton}
          onPress={() => navigation.navigate('NewMessage')}
        >
          <Text style={styles.newMessageText}>✉️ Nouveau</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un message..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredMessages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  newMessageButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newMessageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  messageItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageItemFromMe: {
    borderLeftColor: '#2196F3',
  },
  messageItemUnread: {
    backgroundColor: '#f0f8ff',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  messageBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgentBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 5,
  },
  unreadBadge: {
    backgroundColor: '#2196F3',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  messageContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MessagesScreen;
