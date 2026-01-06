import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PreviewScreenProps {
  schedule: any[];
  onDone: () => void;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({ schedule, onDone }) => {
  const insets = useSafeAreaInsets();

  // Simple mock of the grid view for now
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <IconButton icon="account-circle-outline" size={30} />
            <IconButton icon="cog" size={24} />
        </View>
        <Text variant="displaySmall" style={styles.title}>Xem trước</Text>
      </View>

      <View style={styles.calendarContainer}>
          <View style={styles.daysHeader}>
              {['T2', 'T3', 'T4', 'T5', 'T6'].map(day => (
                  <Text key={day} style={styles.dayText}>{day}</Text>
              ))}
          </View>
          
          <ScrollView contentContainerStyle={styles.gridContainer}>
              {/* Time lines */}
              {[7, 9, 13, 15].map(hour => (
                  <View key={hour} style={styles.timeRow}>
                      <Text style={styles.timeText}>{hour.toString().padStart(2, '0')}:00</Text>
                      <View style={styles.gridLine} />
                  </View>
              ))}

              {/* Schedule Items (Simplified Mock) */}
              {/* In a real implementation, we would calculate position based on day/time */}
              <View style={styles.scheduleItemOverlay}>
                  <View style={[styles.classItem, { top: '0%', left: '0%', backgroundColor: '#B3261E' }]}>
                      <Text style={styles.classText}>Tiếng Nhật 7</Text>
                  </View>
                  <View style={[styles.classItem, { top: '50%', left: '20%', backgroundColor: '#1976D2' }]}>
                      <Text style={styles.classText}>Quản lý Dự án</Text>
                  </View>
                   <View style={[styles.classItem, { top: '50%', left: '0%', backgroundColor: '#FBC02D' }]}>
                      <Text style={[styles.classText, {color: 'black'}]}>Kiến trúc PM</Text>
                  </View>
              </View>
          </ScrollView>
      </View>

      <View style={styles.footer}>
        <Button mode="contained" onPress={onDone} style={styles.doneButton}>
          Xong
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
  },
  title: {
    fontWeight: '400',
    color: '#1C1B1F',
  },
  calendarContainer: {
      flex: 1,
      paddingHorizontal: 16,
  },
  daysHeader: {
      flexDirection: 'row',
      marginLeft: 40,
      marginBottom: 10,
  },
  dayText: {
      flex: 1,
      textAlign: 'center',
      color: '#49454F',
      fontWeight: '500',
  },
  gridContainer: {
      flexGrow: 1,
      position: 'relative',
      height: 500,
  },
  timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 125, // divide 500 by 4 slots approx
      position: 'absolute',
      width: '100%',
  },
  timeText: {
      width: 40,
      textAlign: 'right',
      marginRight: 8,
      color: '#9CA3AF',
      fontSize: 10,
  },
  gridLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#E5E7EB',
  },
  scheduleItemOverlay: {
      position: 'absolute',
      top: 0,
      left: 48,
      right: 0,
      bottom: 0,
      height: 500,
  },
  classItem: {
      position: 'absolute',
      width: '19%',
      height: '20%',
      borderRadius: 8,
      padding: 4,
      justifyContent: 'center',
      alignItems: 'center',
  },
  classText: {
      color: 'white',
      fontSize: 10,
      textAlign: 'center',
      fontWeight: 'bold',
  },
  footer: {
      padding: 16,
      alignItems: 'flex-end',
  },
  doneButton: {
      backgroundColor: '#6750A4',
      borderRadius: 20,
      paddingHorizontal: 20,
  },
});

export default PreviewScreen;
