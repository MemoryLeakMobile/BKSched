import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, IconButton, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfileScreenProps {
  user: any; // Google user info
  studentName?: string;
  studentId?: string;
  bkUsername?: string;
  onBack: () => void;
  onSwitchGoogle: () => void;
  onLoginBK: () => void;
  onLogout: () => void;
  onCalendarPurge: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  user, 
  studentName, 
  studentId, 
  bkUsername,
  onBack, 
  onSwitchGoogle, 
  onLoginBK,
  onLogout,
  onCalendarPurge,
}) => {
  const insets = useSafeAreaInsets();
  const universityEmail = bkUsername ? `${bkUsername}@hcmut.edu.vn` : '';

  // Handle potential nesting in user object
  const userInfo = user?.user || user?.data?.user || user;
  const displayName = userInfo?.name || userInfo?.fullName || 'Google Account';
  const displayEmail = userInfo?.email || 'Tap to sign in';
  const displayPhoto = userInfo?.photo || userInfo?.photoUrl;

  const getBKSubtitle = () => {
      if (studentId && universityEmail) return `${studentId} - ${universityEmail}`;
      if (studentId) return studentId;
      return 'Đồng bộ lịch học & lịch thi'; // Default text if not logged in
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={onBack} />
        <Text variant="headlineMedium" style={styles.headerTitle}>Hồ sơ</Text>
      </View>

      <View style={styles.content}>
        
        {/* Google Account Section */}
        <TouchableOpacity style={styles.card} onPress={onSwitchGoogle}>
          <View style={styles.leftContent}>
            <View style={styles.iconBox}>
               {displayPhoto ? (
                  <Avatar.Image size={40} source={{ uri: displayPhoto }} />
                ) : (
                  <Avatar.Text size={40} label={displayName.charAt(0)} style={{backgroundColor: '#E7E0EC'}} color='#6750A4' />
                )}
            </View>
            <View style={styles.textColumn}>
              <Text variant="titleMedium" style={styles.cardTitle}>{displayName}</Text>
              <Text variant="bodySmall" style={styles.cardSubtitle}>
                  {displayEmail}
              </Text>
            </View>
          </View>
          <IconButton icon="chevron-right" iconColor="#49454F" size={24} />
        </TouchableOpacity>

        {/* BK Account Section */}
        <TouchableOpacity style={styles.card} onPress={onLoginBK}>
          <View style={styles.leftContent}>
             <View style={styles.iconBox}>
                <IconButton icon="calendar-blank" iconColor="#6750A4" size={24} style={{margin: 0}} />
             </View>
            <View style={styles.textColumn}>
              <Text variant="titleMedium" style={styles.cardTitle}>{studentName || 'Lịch học'}</Text>
              <Text variant="bodySmall" style={styles.cardSubtitle}>
                  {getBKSubtitle()}
              </Text>
            </View>
          </View>
          <IconButton icon="chevron-right" iconColor="#49454F" size={24} />
        </TouchableOpacity>

        <Button 
          mode="outlined" 
          onPress={onCalendarPurge} 
          style={styles.logoutButton}
          textColor="#B3261E"
        >
          Xóa lịch
        </Button>

        <Button 
          mode="outlined" 
          onPress={onLogout} 
          style={styles.logoutButton}
          textColor="#B3261E"
        >
          Đăng xuất
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  headerTitle: {
      marginLeft: 8,
      fontWeight: '400',
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#9CA3AF', // Gray 400
    borderRadius: 12, // rounded-xl
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16, // Use gap for spacing between icon and text
      flex: 1,
  },
  iconBox: {
      width: 40,
      height: 40,
      borderRadius: 20, // rounded-full
      backgroundColor: '#E7E0EC', // surface-variant
      justifyContent: 'center',
      alignItems: 'center',
  },
  textColumn: {
      flex: 1,
      justifyContent: 'center',
  },
  cardTitle: {
      fontWeight: '500',
      color: '#1C1B1F', // text-primary
      fontSize: 16, // text-base
  },
  cardSubtitle: {
      color: '#49454F', // text-secondary
      fontSize: 12, // text-xs
      marginTop: 2,
  },
  logoutButton: {
      marginTop: 24,
      borderColor: '#B3261E',
  }
});

export default ProfileScreen;
