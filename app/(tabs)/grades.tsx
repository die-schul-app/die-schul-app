import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

// Mock data for grades - replace with your actual data source
const mockGrades: Grade[] = [
  { id: 1, subject: 'Mathematics', grade: 'A-', date: '2025-07-05', type: 'Test', weight: 'Major' },
  { id: 2, subject: 'English', grade: 'B+', date: '2025-07-03', type: 'Essay', weight: 'Major' },
  { id: 3, subject: 'Physics', grade: 'A', date: '2025-07-01', type: 'Lab Report', weight: 'Minor' },
  { id: 4, subject: 'History', grade: 'B', date: '2025-06-28', type: 'Quiz', weight: 'Minor' },
  { id: 5, subject: 'Mathematics', grade: 'A', date: '2025-06-25', type: 'Homework', weight: 'Minor' },
];

type Grade = {
  id: number;
  subject: string;
  grade: string;
  date: string;
  type: string;
  weight: 'Major' | 'Minor';
};

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return '#10B981'; // Green
  if (grade.startsWith('B')) return '#3B82F6'; // Blue
  if (grade.startsWith('C')) return '#F59E0B'; // Yellow
  if (grade.startsWith('D')) return '#EF4444'; // Red
  return '#6B7280'; // Gray
};

const GradeCard = ({ item }: { item: Grade }) => (
  <View style={styles.gradeCard}>
    <View style={styles.gradeCircle}>
      <Text style={[styles.gradeText, { color: getGradeColor(item.grade) }]}>
        {item.grade}
      </Text>
    </View>
    
    <View style={styles.gradeDetails}>
      <View style={styles.gradeHeader}>
        <Text style={styles.subjectText}>{item.subject}</Text>
        <View style={[styles.weightBadge, { 
          backgroundColor: item.weight === 'Major' ? '#DC2626' : '#059669' 
        }]}>
          <Text style={styles.weightText}>{item.weight}</Text>
        </View>
      </View>
      
      <Text style={styles.assignmentType}>{item.type}</Text>
      <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
    </View>
    
    <Pressable style={styles.moreButton}>
      <FontAwesome name="ellipsis-v" size={16} color="#9CA3AF" />
    </Pressable>
  </View>
);

const calculateGPA = (grades: Grade[]) => {
  const gradePoints: { [key: string]: number } = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  
  const totalPoints = grades.reduce((sum, grade) => {
    const weight = grade.weight === 'Major' ? 2 : 1;
    return sum + (gradePoints[grade.grade] || 0) * weight;
  }, 0);
  
  const totalWeights = grades.reduce((sum, grade) => {
    return sum + (grade.weight === 'Major' ? 2 : 1);
  }, 0);
  
  return totalWeights > 0 ? (totalPoints / totalWeights).toFixed(2) : '0.00';
};

export default function GradesScreen() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  useEffect(() => {
    // Load grades data - replace with actual API call
    setGrades(mockGrades);
  }, []);

  const subjects = ['All', ...Array.from(new Set(grades.map(g => g.subject)))];
  const filteredGrades = selectedSubject === 'All' 
    ? grades 
    : grades.filter(g => g.subject === selectedSubject);

  const gpa = calculateGPA(filteredGrades);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grades</Text>
        <View style={styles.gpaContainer}>
          <Text style={styles.gpaLabel}>Current GPA</Text>
          <Text style={styles.gpaValue}>{gpa}</Text>
        </View>
      </View>

      {/* Subject Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={subjects}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.filterButton,
                selectedSubject === item && styles.filterButtonActive
              ]}
              onPress={() => setSelectedSubject(item)}
            >
              <Text style={[
                styles.filterText,
                selectedSubject === item && styles.filterTextActive
              ]}>
                {item}
              </Text>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Grades List */}
      <FlatList
        data={filteredGrades}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <GradeCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  gpaContainer: {
    alignItems: 'center',
  },
  gpaLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  gpaValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  filterContainer: {
    backgroundColor: '#1F2937',
    paddingBottom: 15,
  },
  filterList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
  },
  gradeCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  gradeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gradeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gradeDetails: {
    flex: 1,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  weightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  weightText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  assignmentType: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreButton: {
    padding: 8,
  },
});
