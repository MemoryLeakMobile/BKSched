import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import NetworkLogger from 'react-native-network-logger';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';

interface LoggerScreenProps {
  onBack: () => void;
}

const LoggerScreen: React.FC<LoggerScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton icon="close" iconColor="white" onPress={onBack} />
        <Text style={styles.title}>Network Logs</Text>
      </View>
      <NetworkLogger theme="dark" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: '#2d2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default LoggerScreen;
