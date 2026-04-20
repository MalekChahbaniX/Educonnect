import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../../redux/slices/authSlice';
import { fetchMessages } from '../../redux/slices/messageSlice';
import { selectMessages, selectUnreadCount } from '../../redux/slices/messageSlice';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const messages = useSelector(selectMessages);
  const unreadCount = useSelector(selectUnreadCount);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMessages());
    }
  }, [dispatch, isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMessages());
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de rafraîchir les données');
    } finally {
      setRefreshing(false);
    }
  };

  const menuItems = [
    {
      id: 'messages',
      title: 'Messages',
      subtitle: `${unreadCount} non lu${unreadCount > 1 ? 's' : ''}`,
      icon: '💬',
      color: '#2196F3',
      onPress: () => navigation.navigate('Messages'),
    },
    {
      id: 'assignments',
      title: 'Devoirs',
      subtitle: 'Suivi des devoirs',
      icon: '📚',
      color: '#FF9800',
      onPress: () => navigation.navigate('Assignments'),
    },
    {
      id: 'children',
      title: 'Mes Enfants',
      subtitle: 'Suivi scolaire',
      icon: '👨‍👩‍👧‍👦',
      color: '#4CAF50',
      onPress: () => navigation.navigate('Children'),
    },
    {
      id: 'profile',
      title: 'Mon Profil',
      subtitle: 'Gérer mon compte',
      icon: '👤',
      color: '#9C27B0',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>
          Bonjour {user?.firstName || 'Utilisateur'} !
        </Text>
        <Text style={styles.subtitle}>
          Bienvenue sur EduConnect
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{unreadCount}</Text>
          <Text style={styles.statLabel}>Messages non lus</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{messages.length}</Text>
          <Text style={styles.statLabel}>Total messages</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, { borderLeftColor: item.color }]}
            onPress={item.onPress}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.menuArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Actions Rapides</Text>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => navigation.navigate('Messages')}
        >
          <Text style={styles.quickButtonText}>✉️ Envoyer un message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => navigation.navigate('Assignments')}
        >
          <Text style={styles.quickButtonText}>📝 Voir les devoirs</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#2196F3',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#ffffff',
    marginVertical: 10,
  },
  statCard: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    minWidth: 100,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuArrow: {
    width: 30,
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: '#ccc',
  },
  quickActions: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  quickButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
