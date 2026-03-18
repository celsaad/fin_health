import React from 'react';
import { Text, Button } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

function ThemeConsumer() {
  const { theme, preference, isDark, isReady, setPreference } = useTheme();
  return (
    <>
      <Text testID="theme">{theme}</Text>
      <Text testID="preference">{preference}</Text>
      <Text testID="isDark">{String(isDark)}</Text>
      <Text testID="isReady">{String(isReady)}</Text>
      <Button title="Set Dark" onPress={() => setPreference('dark')} />
      <Button title="Set Light" onPress={() => setPreference('light')} />
    </>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  // TODO: times out with React 19 + @testing-library/react-native v13 — upgrade to v14+
  it.skip('provides default system preference', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('isReady').props.children).toBe('true');
    });

    expect(getByTestId('preference').props.children).toBe('system');
    expect(getByTestId('theme').props.children).toBe('light');
  });

  it('loads saved preference from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('isReady').props.children).toBe('true');
    });

    expect(getByTestId('preference').props.children).toBe('dark');
    expect(getByTestId('theme').props.children).toBe('dark');
    expect(getByTestId('isDark').props.children).toBe('true');
  });

  it('persists preference to AsyncStorage when changed', async () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('isReady').props.children).toBe('true');
    });

    fireEvent.press(getByText('Set Dark'));

    expect(getByTestId('theme').props.children).toBe('dark');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('throws when useTheme is used outside ThemeProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<ThemeConsumer />)).toThrow('useTheme must be used within ThemeProvider');

    spy.mockRestore();
  });
});
