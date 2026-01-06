import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton, Button, Avatar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storage } from '../services/storage';
import { calendarService } from '../services/calendar';

interface ColorAdjustScreenProps {
  onBack: () => void;
}

const PALETTE = [
  '#D0BCFF', // Pastel Purple
  '#F2B8B5', // Pastel Red
  '#A8C7FA', // Pastel Blue
  '#C4E7C5', // Pastel Green
  '#F5E284', // Pastel Yellow
];

const ColorAdjustScreen: React.FC<ColorAdjustScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [colors, setColors] = useState<Record<string, string>>({});
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const storedSchedule = await storage.getSchedule();
    const storedColors = await storage.getClassColors();
    setSchedule(storedSchedule);
    setColors(storedColors);

    // Extract unique subjects
    const uniqueSubjects = new Map();
    storedSchedule.forEach((item: any) => {
      const subjectId = item.MAMONHOC || item.subject?.code || item.ID?.toString();
      if (subjectId && !uniqueSubjects.has(subjectId)) {
        uniqueSubjects.set(subjectId, {
          id: subjectId,
          name: item.TENMONHOC || item.subject?.nameVi || 'Môn học không tên',
        });
      }
    });
    setSubjects(Array.from(uniqueSubjects.values()));
  };

  const handleColorSelect = (subjectId: string, color: string) => {
    setColors(prev => ({
      ...prev,
      [subjectId]: color
    }));
  };

  const handleSave = async () => {
    await storage.saveClassColors(colors);
    // Sync with calendar to reflect changes
    // Note: In a real app we might want to ask confirmation or do this in background
    await calendarService.syncSchedule(schedule, colors);
    onBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={onBack} />
        <Text variant="headlineMedium" style={styles.headerTitle}>Màu sắc</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {subjects.map((subject, index) => {
            const selectedColor = colors[subject.id] || PALETTE[0];
            return (
                <View key={`${subject.id}-${index}`} style={styles.subjectContainer}>
                    <View style={styles.subjectHeader}>
                        <View style={styles.subjectInfo}>
                            <View style={[styles.iconBox, { backgroundColor: selectedColor }]}>
                                <Avatar.Icon size={24} icon="book-outline" style={{backgroundColor: 'transparent'}} color="#FFFFFF" />
                            </View>
                            <Text variant="titleSmall" style={styles.subjectName}>{subject.name}</Text>
                        </View>
                        <IconButton icon="dots-vertical" size={20} />
                    </View>
                    
                    <View style={styles.paletteContainer}>
                        {PALETTE.map((color) => (
                            <TouchableOpacity
                                key={color}
                                onPress={() => handleColorSelect(subject.id, color)}
                                style={[
                                    styles.colorCircle, 
                                    { backgroundColor: color },
                                    selectedColor === color && styles.colorSelected
                                ]}
                            />
                        ))}
                    </View>
                </View>
            );
        })}
        <View key="bottom-spacer" style={{height: 100}} /> 
      </ScrollView>

      {/* Done Button */}
      <View style={styles.fabContainer}>
         <Button 
            mode="contained" 
            onPress={handleSave} 
            style={styles.doneButton}
            contentStyle={{paddingVertical: 4}}
         >
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  headerTitle: {
      marginLeft: 8,
      fontWeight: '400',
  },
  pageTitle: {
      paddingHorizontal: 24,
      marginBottom: 24,
      fontWeight: '400',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  subjectContainer: {
      marginBottom: 24,
  },
  subjectHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
  },
  subjectInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingRight: 8,
  },
  iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#E7E0EC',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
  },
  subjectName: {
      flex: 1,
      fontWeight: '500',
  },
  paletteContainer: {
      flexDirection: 'row',
      gap: 12,
      paddingLeft: 52, // Align with text start
  },
  colorCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
  },
  colorSelected: {
      borderWidth: 2,
      borderColor: '#6750A4',
      transform: [{scale: 1.2}],
  },
  fabContainer: {
      position: 'absolute',
      right: 24,
      bottom: 24,
  },
  doneButton: {
      borderRadius: 30,
      elevation: 4,
  }
});

export default ColorAdjustScreen;
