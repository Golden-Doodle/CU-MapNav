import React from 'react';
import { render } from '@testing-library/react-native';
import IndoorMapScreen from '../IndoorMapScreen';

jest.mock('../../../components/IndoorNavigation/IndoorMap', () => {
  return () => {
    return <></>;
  };
});

describe('IndoorMapScreen', () => {
  it('renders the header and bottom navigation', () => {
    const { getByTestId } = render(<IndoorMapScreen />);
    
    expect(getByTestId('indoor-navigation-header')).toBeTruthy();
    expect(getByTestId('bottom-navigation')).toBeTruthy();
  });
});
