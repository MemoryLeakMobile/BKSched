import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import AnimatedScreen from '../AnimatedScreen';

// Mock the Animated module
jest.mock('react-native/Libraries/Animated/animations/TimingAnimation');

describe('AnimatedScreen', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <AnimatedScreen>
        <Text>Hello, World!</Text>
      </AnimatedScreen>
    );

    expect(getByText('Hello, World!')).toBeTruthy();
  });
});
