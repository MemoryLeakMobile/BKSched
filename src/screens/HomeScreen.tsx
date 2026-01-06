import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Text, Avatar, IconButton, Chip, FAB, Menu, Divider, Button, Portal, Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Calendar from 'expo-calendar';
import { hcmut } from '../services/hcmut';
import { storage } from '../services/storage';

interface HomeScreenProps {
  onLogout: () => void;
  schedule?: any[];
  notifications?: any[];
  logs?: any[];
  classColors?: Record<string, string>;
  selectedSemester?: number;
  onSemesterChange?: (semester: number) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onSync: () => Promise<void>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onLogout,
  schedule,
  notifications,
  logs,
  classColors = {},
  selectedSemester,
  onSemesterChange,
  onOpenProfile,
  onOpenSettings,
  onSync
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'home' | 'notifications'>('home');
  const [sortBy, setSortBy] = useState<'time' | 'name'>('time');
  const [scheduleType, setScheduleType] = useState<'class' | 'exam'>('class');
  const [syncing, setSyncing] = useState(false);

  const getChipStyle = (selected: boolean) => ({
      backgroundColor: selected ? '#000000' : 'transparent',
      borderColor: '#000000',
      borderWidth: 1,
  });

  const getChipTextStyle = (selected: boolean) => ({
      color: selected ? '#FFFFFF' : '#000000',
      fontWeight: '500' as const,
  });

  const availableSemesters = useMemo(() => {
      const current = hcmut.getCurrentSemester().code;
      return hcmut.getAdjacentSemesters(current);
  }, []);

  const sortedSchedule = useMemo(() => {
      if (!schedule) return [];
      
      let data = [...schedule];
      
      // Filter by type if present (backward compatibility check)
      if (data.some(item => item.type)) {
          data = data.filter(item => item.type === scheduleType);
      }

      if (sortBy === 'name') {
          return data.sort((a, b) => (a.TENMONHOC || '').localeCompare(b.TENMONHOC || ''));
      } else {
          return data.sort((a, b) => {
             const timeA = a.GIOBD || '';
             const timeB = b.GIOBD || '';
             if (timeA !== timeB) return timeA.localeCompare(timeB);
             return 0;
          });
      }
  }, [schedule, sortBy, scheduleType]);

  useEffect(() => {
    (async () => {
      await Calendar.requestCalendarPermissionsAsync();
    })();
  }, []);

  const handleSync = async () => {
      setSyncing(true);
      try {
          await onSync();
      } finally {
          setSyncing(false);
      }
  };

  const toggleSort = () => {
      setSortBy(prev => prev === 'time' ? 'name' : 'time');
  };

  const renderScheduleItem = ({ item }: { item: any }) => {
    const itemColor = classColors[item.MAMONHOC] || '#E6E1E5';
    return (
      <View style={styles.scheduleItem}>
        <View style={styles.iconContainer}>
          <Avatar.Icon 
            size={40} 
            icon="shape-outline" 
            style={{backgroundColor: itemColor}} 
            color={itemColor === '#E6E1E5' ? '#79747E' : '#FFFFFF'} 
          />
        </View>
        <View style={styles.itemContent}>
          <Text variant="titleSmall" style={styles.itemTitle}>{item.TENMONHOC}</Text>
          <Text variant="bodySmall" style={styles.itemSubtitle}>
              {item.GIOBD} @ {item.MAPHONG}
          </Text>
        </View>
      </View>
    );
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
      <View style={styles.scheduleItem}>
        <View style={styles.iconContainer}>
          <Avatar.Icon size={40} icon="bell-outline" style={{backgroundColor: '#E6E1E5'}} color='#79747E' />
        </View>
        <View style={styles.itemContent}>
          <Text variant="titleSmall" style={styles.itemTitle}>{item.title}</Text>
          <Text variant="bodySmall" style={styles.itemSubtitle}>{item.message}</Text>
          <Text variant="labelSmall" style={{color: '#666'}}>Today</Text>
        </View>
        <IconButton icon="dots-vertical" size={20} />
      </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="account-circle-outline" size={30} onPress={onOpenProfile} />
        <IconButton icon="cog" size={24} onPress={onOpenSettings} />
      </View>

      <View style={styles.titleRow}>
        <Text variant="headlineMedium" style={styles.pageTitle}>
            {activeTab === 'home' ? 'Trang chính' : 'Thông báo'}
        </Text>
      </View>

      {/* Filter/Sort Header */}
      <View style={styles.filterHeader}>
          <TouchableOpacity style={styles.filterLeft} onPress={toggleSort}>
              <IconButton 
                icon="arrow-up-down" 
                size={16} 
                iconColor="#6750A4" 
                style={{margin: 0}}
              />
              <Text style={{color: '#6750A4', fontWeight: '500', marginLeft: 4}}>
                  {sortBy === 'time' ? 'Thời gian' : 'Tên môn học'}
              </Text>
          </TouchableOpacity>
          
          {activeTab === 'home' && (
              <View style={styles.chipContainer}>
                  <Chip 
                      selected={scheduleType === 'class'} 
                      onPress={() => setScheduleType('class')}
                      style={getChipStyle(scheduleType === 'class')}
                      textStyle={getChipTextStyle(scheduleType === 'class')}
                      showSelectedOverlay={false}
                      showSelectedCheck={false}
                      compact
                  >Lịch học</Chip>
                  <Chip 
                      selected={scheduleType === 'exam'} 
                      onPress={() => setScheduleType('exam')}
                      style={getChipStyle(scheduleType === 'exam')}
                      textStyle={getChipTextStyle(scheduleType === 'exam')}
                      showSelectedOverlay={false}
                      showSelectedCheck={false}
                      compact
                  >Lịch thi</Chip>
              </View>
          )}
      </View>

      {/* Semester Selection Chips */}
      {activeTab === 'home' && (
          <View style={styles.semesterChipRow}>
              {availableSemesters.map((sem) => (
                  <Chip
                      key={sem}
                      selected={selectedSemester === sem}
                      onPress={() => onSemesterChange?.(sem)}
                      style={[styles.semesterChip, getChipStyle(selectedSemester === sem)]}
                      textStyle={getChipTextStyle(selectedSemester === sem)}
                      showSelectedOverlay={false}
                      showSelectedCheck={false}
                      compact
                  >
                      {sem}
                  </Chip>
              ))}
          </View>
      )}

      {/* Content List */}
      <View style={styles.listContainer}>
          {activeTab === 'home' ? (
             sortedSchedule && sortedSchedule.length > 0 ? (
                <FlatList
                    data={sortedSchedule}
                    renderItem={renderScheduleItem}
                    keyExtractor={(item) => item.ID.toString()}
                    showsVerticalScrollIndicator={false}
                />
             ) : (
                 <Text style={{textAlign: 'center', marginTop: 20, color: '#666'}}>
                     {scheduleType === 'class' ? 'Không có lịch học.' : 'Không có lịch thi.'}
                 </Text>
             )
          ) : (
              (notifications && notifications.length > 0) ? (
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                />
              ) : (
                  <Text style={{textAlign: 'center', marginTop: 20, color: '#666'}}>No notifications.</Text>
              )
          )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={[styles.navItem, activeTab !== 'home' && { opacity: 0.6 }]} 
            onPress={() => setActiveTab('home')}
          >
              <View style={[styles.navIconContainer, activeTab === 'home' && styles.navIconActive]}>
                  <IconButton icon="earth" iconColor={activeTab === 'home' ? '#1C1B1F' : '#1C1B1F'} size={20} />
              </View>
              <Text variant="labelSmall" style={{color: '#1C1B1F'}}>Trang chính</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navItem, activeTab !== 'notifications' && { opacity: 0.6 }]} 
            onPress={() => setActiveTab('notifications')}
          >
              <View style={[styles.navIconContainer, activeTab === 'notifications' && styles.navIconActive]}>
                  <IconButton icon="bell" iconColor={activeTab === 'notifications' ? '#1C1B1F' : '#1C1B1F'} size={20} />
              </View>
              <Text variant="labelSmall" style={{color: '#1C1B1F'}}>Thông báo</Text>
          </TouchableOpacity>
      </View>

      <FAB
        icon="sync"
        style={styles.fab}
        onPress={handleSync}
        color="white"
        loading={syncing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  pageTitle: {
      fontWeight: '400',
  },
  semesterChipRow: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      gap: 8,
      marginBottom: 16,
  },
  semesterChip: {
      // Removed flex: 1 to fit text content only
  },
  filterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginBottom: 8,
      height: 40,
  },
  filterLeft: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  chipContainer: {
      flexDirection: 'row',
      gap: 8,
  },
  chip: {
      backgroundColor: '#f3f4f6', 
  },
  listContainer: {
      flex: 1,
      paddingHorizontal: 16,
  },
  scheduleItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
      marginRight: 16,
  },
  itemContent: {
      flex: 1,
      justifyContent: 'center',
  },
  itemTitle: {
      fontWeight: '500',
      marginBottom: 4,
  },
  itemSubtitle: {
      color: '#49454F',
  },
  bottomNav: {
      height: 80,
      backgroundColor: '#F3F4F6', // Surface variant opacity
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: 10,
  },
  navItem: {
      alignItems: 'center',
  },
  navIconContainer: {
      height: 32,
      width: 64,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      marginBottom: 4,
  },
  navIconActive: {
      backgroundColor: '#E8DEF8',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: '#6750A4',
  },
});

export default HomeScreen;
