import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

// Mock dependencies
jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    ...jest.requireActual('react-native-paper'),
    IconButton: (props: any) => <View {...props}><Text>{props.icon}</Text></View>,
    FAB: (props: any) => <View {...props}><Text>{props.icon}</Text></View>,
    Chip: (props: any) => <View {...props}>{props.children}</View>,
  };
});

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    const props = {
      onLogout: jest.fn(),
      schedule: [],
      notifications: [],
      logs: [],
      classColors: {},
      selectedSemester: 241,
      onSemesterChange: jest.fn(),
      onOpenProfile: jest.fn(),
      onOpenSettings: jest.fn(),
      onSync: jest.fn(),
    };
    render(<HomeScreen {...props} />);
  });
});
