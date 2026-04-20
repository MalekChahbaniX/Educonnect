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

const ChildrenScreen = ({ navigation }) => {
  const user = useSelector(selectUser);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    setLoading(true);
    try {
      // Mock data pour l'instant
      const mockChildren = [
        {
          _id: '1',
          firstName: 'Lucas',
          lastName: 'Martin',
          dateOfBirth: '2012-05-15',
          studentId: 'STU001',
          class: {
            _id: 'class1',
            name: '6ème B',
            level: '6ème',
            teacher: { firstName: 'Martin', lastName: 'Durand' }
          },
          attendance: {
            rate: 95,
            absences: 2,
            delays: 1
          },
          grades: {
            average: 14.5,
            subjects: [
              { name: 'Mathématiques', grade: 15 },
              { name: 'Français', grade: 14 },
              { name: 'Sciences', grade: 16 }
            ]
          },
          behavior: {
            rating: 'Excellent',
            recentNotes: [
              { date: '2024-01-15', note: 'Très bon élève', type: 'positive' },
              { date: '2024-01-10', note: 'Aide ses camarades', type: 'positive' }
            ]
          }
        },
        {
          _id: '2',
          firstName: 'Emma',
          lastName: 'Martin',
          dateOfBirth: '2014-08-22',
          studentId: 'STU002',
          class: {
            _id: 'class2',
            name: '5ème A',
            level: '5ème',
            teacher: { firstName: 'Sophie', lastName: 'Petit' }
          },
          attendance: {
            rate: 98,
            absences: 1,
            delays: 0
          },
          grades: {
            average: 16.2,
            subjects: [
              { name: 'Mathématiques', grade: 17 },
              { name: 'Français', grade: 16 },
              { name: 'Sciences', grade: 15.5 }
            ]
          },
          behavior: {
            rating: 'Très bon',
            recentNotes: [
              { date: '2024-01-12', note: 'Participative en classe', type: 'positive' },
              { date: '2024-01-08', note: 'Travail soigné', type: 'positive' }
            ]
          }
        }
      ];
      setChildren(mockChildren);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les informations des enfants');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  };

  const getAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 95) return '#4caf50';
    if (rate >= 90) return '#ff9800';
    return '#f44336';
  };

  const getGradeColor = (grade) => {
    if (grade >= 16) return '#4caf50';
    if (grade >= 14) return '#ff9800';
    return '#f44336';
  };

  const renderChild = ({ item }) => {
    const age = getAge(item.dateOfBirth);
    
    return (
      <TouchableOpacity
        style={styles.childCard}
        onPress={() => navigation.navigate('ChildDetail', { childId: item._id })}
      >
        <View style={styles.childHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.firstName.charAt(0)}{item.lastName.charAt(0)}
            </Text>
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.childDetails}>
              {age} ans • {item.class.name} • {item.studentId}
            </Text>
          </View>
          <TouchableOpacity style={styles.messageButton}>
            <Text style={styles.messageButtonText}>💬</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Présence</Text>
              <View style={styles.statValue}>
                <Text style={[
                  styles.statNumber,
                  { color: getAttendanceColor(item.attendance.rate) }
                ]}>
                  {item.attendance.rate}%
                </Text>
                <Text style={styles.statSubtext}>
                  {item.attendance.absences} absences
                </Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Moyenne</Text>
              <Text style={[
                styles.statNumber,
                { color: getGradeColor(item.grades.average) }
              ]}>
                {item.grades.average}/20
              </Text>
            </View>
          </View>
          
          <View style={styles.behaviorContainer}>
            <Text style={styles.behaviorLabel}>Comportement</Text>
            <View style={[styles.behaviorBadge, { backgroundColor: item.behavior.rating === 'Excellent' ? '#4caf50' : '#ff9800' }]}>
              <Text style={styles.behaviorText}>{item.behavior.rating}</Text>
            </View>
          </View>
        </View>

        <View style={styles.subjectsContainer}>
          <Text style={styles.subjectsTitle}>Dernières notes</Text>
          <View style={styles.subjectsList}>
            {item.grades.subjects.slice(0, 3).map((subject, index) => (
              <View key={index} style={styles.subjectItem}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={[
                  styles.subjectGrade,
                  { color: getGradeColor(subject.grade) }
                ]}>
                  {subject.grade}/20
                </Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Enfants</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddChild')}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Children List */}
      <FlatList
        data={children}
        renderItem={renderChild}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.emptyTitle}>Aucun enfant</Text>
            <Text style={styles.emptySubtitle}>
              Ajoutez vos enfants pour suivre leur scolarité
            </Text>
          </View>
        )}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Actions Rapides</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Bientôt disponible', 'Communication avec les enseignants')}
          >
            <Text style={styles.actionButtonText}>✉️ Contacter les profs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Bientôt disponible', 'Demande de rendez-vous')}
          >
            <Text style={styles.actionButtonText}>📅 Prendre rendez-vous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Assignments')}
          >
            <Text style={styles.actionButtonText}>📚 Voir tous les devoirs</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  listContainer: {
    padding: 15,
  },
  childCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  childDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  messageButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: 16,
  },
  statsContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statSubtext: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  behaviorContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  behaviorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  behaviorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  behaviorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subjectsContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  subjectsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  subjectsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  subjectItem: {
    alignItems: 'center',
  },
  subjectName: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
    textAlign: 'center',
  },
  subjectGrade: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickActions: {
    backgroundColor: '#ffffff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  actionButtons: {
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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

export default ChildrenScreen;
