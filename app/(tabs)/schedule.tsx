import DSBLoginModal from '@/components/DSBLoginModal';
import { ScheduleItem as DSBScheduleItem } from '@/service/DSB/TimeTable';
import { useDSB } from '@/service/useDSB';
import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

// Mock data for schedule - fallback if DSB is not configured
const mockSchedule = [
  { id: '1', subject: 'Mathematics', time: '08:00 - 09:30', room: 'Room 101', period: 1, day: 'Monday' },
  { id: '2', subject: 'English', time: '09:45 - 11:15', room: 'Room 203', period: 2, day: 'Monday' },
  { id: '3', subject: 'Physics', time: '11:30 - 13:00', room: 'Lab 1', period: 3, day: 'Monday' },
  { id: '4', subject: 'History', time: '14:00 - 15:30', room: 'Room 105', period: 4, day: 'Monday' },
];

type LocalScheduleItem = {
  id: string;
  subject: string;
  time: string;
  room: string;
  teacher?: string;
  period: number;
  day: string;
};

const ScheduleItemCard = ({ item }: { item: LocalScheduleItem }) => (
  <View style={styles.scheduleCard}>
    <View style={styles.timeContainer}>
      <Text style={styles.timeText}>{item.time}</Text>
      <Text style={styles.periodText}>Period {item.period}</Text>
    </View>
    <View style={styles.detailsContainer}>
      <Text style={styles.subjectText}>{item.subject}</Text>
      <Text style={styles.roomText}>{item.room}</Text>
      {item.teacher && <Text style={styles.teacherText}>{item.teacher}</Text>}
    </View>
  </View>
);

const LoginPrompt = ({ onLoginPress }: { onLoginPress: () => void }) => (
  <View style={styles.loginPrompt}>
    <FontAwesome name="lock" size={48} color="#9CA3AF" />
    <Text style={styles.loginTitle}>DSB Login Required</Text>
    <Text style={styles.loginText}>
      Please login with your DSB credentials to view your real schedule
    </Text>
    <Pressable style={styles.loginButton} onPress={onLoginPress}>
      <Text style={styles.loginButtonText}>Login to DSB</Text>
    </Pressable>
  </View>
);

export default function ScheduleScreen() {
  const [schedule, setSchedule] = useState<LocalScheduleItem[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const dsb = useDSB();

  useEffect(() => {
    if (dsb.isAuthenticated && dsb.timetable) {
      // Convert DSB schedule items to local format
      const todaysSchedule = dsb.getTodaysSchedule().map((item: DSBScheduleItem): LocalScheduleItem => ({
        id: item.id,
        subject: item.subject,
        time: item.time,
        room: item.room,
        teacher: item.teacher,
        period: item.period,
        day: item.day,
      }));
      setSchedule(todaysSchedule);
    } else if (!dsb.isAuthenticated) {
      // Use mock data if not authenticated
      setSchedule(mockSchedule);
    }
  }, [dsb.isAuthenticated, dsb.timetable]);

  const handleRefresh = async () => {
    if (dsb.isAuthenticated) {
      await dsb.refreshTimetable();
    }
  };

  const handleLoginPress = () => {
    setShowLoginModal(true);
  };

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    return await dsb.authenticate(username, password);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Today's Schedule</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
            {dsb.lastUpdated && (
              <Text style={styles.lastUpdated}>
                Last updated: {dsb.lastUpdated.toLocaleTimeString()}
              </Text>
            )}
          </View>
          
          <View style={styles.headerRight}>
            {dsb.isAuthenticated ? (
              <Pressable style={styles.refreshButton} onPress={handleRefresh} disabled={dsb.isLoading}>
                {dsb.isLoading ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <FontAwesome name="refresh" size={20} color="#3B82F6" />
                )}
              </Pressable>
            ) : (
              <Pressable style={styles.loginIconButton} onPress={handleLoginPress}>
                <FontAwesome name="sign-in" size={20} color="#F59E0B" />
              </Pressable>
            )}
          </View>
        </View>

        {dsb.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{dsb.error}</Text>
          </View>
        )}

        {!dsb.isAuthenticated ? (
          <LoginPrompt onLoginPress={handleLoginPress} />
        ) : (
          <FlatList
            data={schedule}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ScheduleItemCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={dsb.isLoading}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FontAwesome name="calendar-o" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No classes scheduled for today</Text>
              </View>
            }
          />
        )}
      </View>
      
      <DSBLoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </>
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
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#374151',
  },
  loginIconButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#374151',
  },
  errorContainer: {
    backgroundColor: '#DC2626',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 6,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  timeContainer: {
    justifyContent: 'center',
    marginRight: 16,
    minWidth: 80,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'center',
  },
  periodText: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  subjectText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  roomText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  teacherText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginTop: 16,
    marginBottom: 8,
  },
  loginText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
});
