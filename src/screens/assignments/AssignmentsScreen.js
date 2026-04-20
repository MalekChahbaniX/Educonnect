import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';

const AssignmentsScreen = ({ navigation }) => {
  const user = useSelector(selectUser);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      // Mock data pour l'instant
      const mockAssignments = [
        {
          _id: '1',
          title: 'Exercices de mathématiques',
          description: 'Pages 45-48 du manuel',
          subject: 'Mathématiques',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          type: 'homework',
          priority: 'normal',
          status: 'pending',
          teacher: { firstName: 'Martin', lastName: 'Durand' },
          class: { name: '6ème B' },
        },
        {
          _id: '2',
          title: 'Composition française',
          description: 'Rédaction sur le thème de l\'aventure',
          subject: 'Français',
          dueDate: new Date(Date.now() + 172800000).toISOString(),
          type: 'exam',
          priority: 'high',
          status: 'pending',
          teacher: { firstName: 'Sophie', lastName: 'Petit' },
          class: { name: '6ème B' },
        },
        {
          _id: '3',
          title: 'Projet sciences',
          description: 'Présentation sur les énergies renouvelables',
          subject: 'Sciences',
          dueDate: new Date(Date.now() + 259200000).toISOString(),
          type: 'project',
          priority: 'normal',
          status: 'submitted',
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          teacher: { firstName: 'Claude', lastName: 'Bernard' },
          class: { name: '6ème B' },
        },
      ];
      setAssignments(mockAssignments);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les devoirs');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssignments();
    setRefreshing(false);
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return assignment.status === 'pending';
    if (filter === 'submitted') return assignment.status === 'submitted';
    if (filter === 'overdue') return new Date(assignment.dueDate) < new Date();
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'urgent': return '#d32f2f';
      default: return '#ff9800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return '#4caf50';
      case 'overdue': return '#f44336';
      default: return '#ff9800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted': return 'Soumis';
      case 'overdue': return 'En retard';
      default: return 'En attente';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'exam': return '📝';
      case 'project': return '📊';
      case 'quiz': return '❓';
      default: return '📚';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const renderAssignment = ({ item }) => {
    const overdue = isOverdue(item.dueDate);
    
    return (
      <TouchableOpacity
        style={[
          styles.assignmentCard,
          overdue && styles.overdueCard
        ]}
        onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: item._id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.typeIcon}>
            <Text style={styles.iconText}>{getTypeIcon(item.type)}</Text>
          </View>
          <View style={styles.assignmentInfo}>
            <Text style={styles.assignmentTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.assignmentMeta}>
              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.className}>{item.class.name}</Text>
            </View>
          </View>
          <View style={styles.cardBadges}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.badgeText}>{item.priority}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.badgeText}>{getStatusText(item.status)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.dueDateContainer}>
            <Text style={styles.dueDateLabel}>À rendre le:</Text>
            <Text style={[
              styles.dueDate,
              overdue && styles.overdueDate
            ]}>
              {new Date(item.dueDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </View>
          <Text style={styles.teacherName}>
            Par: {item.teacher.firstName} {item.teacher.lastName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const filterButtons = [
    { id: 'all', label: 'Tous', count: assignments.length },
    { id: 'pending', label: 'En attente', count: assignments.filter(a => a.status === 'pending').length },
    { id: 'submitted', label: 'Soumis', count: assignments.filter(a => a.status === 'submitted').length },
    { id: 'overdue', label: 'En retard', count: assignments.filter(a => isOverdue(a.dueDate)).length },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Devoirs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('NewAssignment')}
        >
          <Text style={styles.addButtonText}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filterButtons.map((button) => (
          <TouchableOpacity
            key={button.id}
            style={[
              styles.filterButton,
              filter === button.id && styles.activeFilter
            ]}
            onPress={() => setFilter(button.id)}
          >
            <Text style={[
              styles.filterText,
              filter === button.id && styles.activeFilterText
            ]}>
              {button.label} ({button.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Assignments List */}
      <FlatList
        data={filteredAssignments}
        renderItem={renderAssignment}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>Aucun devoir</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? 'Tous les devoirs apparaîtront ici'
                : `Aucun devoir ${filter === 'pending' ? 'en attente' : filter === 'submitted' ? 'soumis' : 'en retard'}`
              }
            </Text>
          </View>
        )}
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
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
  },
  activeFilter: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 15,
  },
  assignmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 15,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 20,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  assignmentMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  subject: {
    fontSize: 12,
    color: '#2196F3',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  className: {
    fontSize: 12,
    color: '#666',
  },
  cardBadges: {
    flexDirection: 'row',
    gap: 5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dueDateContainer: {
    flex: 1,
  },
  dueDateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  dueDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  overdueDate: {
    color: '#f44336',
  },
  teacherName: {
    fontSize: 12,
    color: '#666',
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
});

export default AssignmentsScreen;
