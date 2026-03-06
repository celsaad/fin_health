import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Button from '../../components/Button';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Button', () => {
  it('renders title text', async () => {
    const { getByText } = renderWithTheme(<Button title="Save" onPress={() => {}} />);
    await waitFor(() => expect(getByText('Save')).toBeTruthy());
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(<Button title="Save" onPress={onPress} />);
    await waitFor(() => expect(getByText('Save')).toBeTruthy());
    fireEvent.press(getByText('Save'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(<Button title="Save" onPress={onPress} disabled />);
    await waitFor(() => expect(getByText('Save')).toBeTruthy());
    fireEvent.press(getByText('Save'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator instead of title when loading', async () => {
    const { queryByText } = renderWithTheme(<Button title="Save" onPress={() => {}} loading />);
    // When loading, the title text is replaced by ActivityIndicator
    await waitFor(() => expect(queryByText('Save')).toBeNull());
  });

  it('renders with destructive variant', async () => {
    const { getByText } = renderWithTheme(
      <Button title="Delete" onPress={() => {}} variant="destructive" />,
    );
    await waitFor(() => expect(getByText('Delete')).toBeTruthy());
  });

  it('renders with outline variant', async () => {
    const { getByText } = renderWithTheme(
      <Button title="Cancel" onPress={() => {}} variant="outline" />,
    );
    await waitFor(() => expect(getByText('Cancel')).toBeTruthy());
  });
});
