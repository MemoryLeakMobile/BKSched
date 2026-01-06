import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { Text, IconButton, Button, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storage } from '../services/storage';

interface SettingsScreenProps {
  onBack: () => void;
  onOpenColorAdjust: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onOpenColorAdjust }) => {
  const insets = useSafeAreaInsets();
  const [autoFetch, setAutoFetch] = useState(false);
  const [fetchFrequency, setFetchFrequency] = useState('daily'); // 'hourly', 'daily', 'weekly'

  useEffect(() => {
      loadSettings();
  }, []);

  const loadSettings = async () => {
      const settings = await storage.getSettings();
      setAutoFetch(settings.autoFetch);
      setFetchFrequency(settings.fetchFrequency);
  };

  const saveSettings = async (newAutoFetch: boolean, newFrequency: string) => {
      await storage.saveSettings({
          autoFetch: newAutoFetch,
          fetchFrequency: newFrequency
      });
  };

  const handleAutoFetchChange = (value: boolean) => {
      setAutoFetch(value);
      saveSettings(value, fetchFrequency);
  };

  const handleFrequencyChange = (value: string) => {
      setFetchFrequency(value);
      saveSettings(autoFetch, value);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={onBack} />
        <Text variant="headlineMedium" style={styles.title}>Tùy chọn</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Color Adjustment Option */}
        <View style={styles.optionRow}>
            <View style={styles.optionIcon}>
                <IconButton icon="palette" iconColor="#6750A4" />
            </View>
            <View style={styles.optionText}>
                <Text variant="titleMedium">Điều chỉnh màu sắc</Text>
                <Text variant="bodySmall" style={styles.description}>Tùy chỉnh màu sắc cho các môn học</Text>
            </View>
            <IconButton icon="chevron-right" onPress={onOpenColorAdjust} />
        </View>

        <Divider style={styles.divider} />

        {/* Auto Fetch Option */}
        <View style={styles.optionRow}>
            <View style={styles.optionIcon}>
                <IconButton icon="sync" iconColor="#6750A4" />
            </View>
            <View style={styles.optionText}>
                <Text variant="titleMedium">Tự động cập nhật</Text>
                <Text variant="bodySmall" style={styles.description}>Cập nhật lịch học tự động</Text>
            </View>
            <Switch 
                value={autoFetch} 
                onValueChange={handleAutoFetchChange} 
                trackColor={{ false: "#767577", true: "#6750A4" }}
                thumbColor={autoFetch ? "#f4f3f4" : "#f4f3f4"}
            />
        </View>

        {autoFetch && (
            <View style={styles.subOptions}>
                <Text variant="labelLarge" style={{marginBottom: 10}}>Tần suất cập nhật:</Text>
                <View style={styles.radioGroup}>
                    <Button 
                        mode={fetchFrequency === 'hourly' ? 'contained' : 'outlined'} 
                        onPress={() => handleFrequencyChange('hourly')}
                        style={styles.freqButton}
                        compact
                    >
                        Mỗi giờ
                    </Button>
                    <Button 
                        mode={fetchFrequency === 'daily' ? 'contained' : 'outlined'} 
                        onPress={() => handleFrequencyChange('daily')}
                        style={styles.freqButton}
                        compact
                    >
                        Mỗi ngày
                    </Button>
                    <Button 
                        mode={fetchFrequency === 'weekly' ? 'contained' : 'outlined'} 
                        onPress={() => handleFrequencyChange('weekly')}
                        style={styles.freqButton}
                        compact
                    >
                        Mỗi tuần
                    </Button>
                </View>
            </View>
        )}

      </ScrollView>
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
    marginBottom: 10,
  },
  title: {
    marginLeft: 8,
    fontWeight: 'normal',
  },
  content: {
    padding: 16,
  },
  optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
  },
  optionIcon: {
      backgroundColor: '#E7E0EC',
      borderRadius: 20,
      marginRight: 16,
  },
  optionText: {
      flex: 1,
  },
  description: {
      color: '#757575',
  },
  divider: {
      marginVertical: 8,
  },
  subOptions: {
      paddingLeft: 64,
      paddingBottom: 16,
  },
  radioGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
  },
  freqButton: {
      marginRight: 8,
      borderRadius: 20,
  },
});

export default SettingsScreen;
