import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import EmptyState from '../../components/EmptyState';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('EmptyState', () => {
  it('renders title and message', async () => {
    const { getByText } = renderWithTheme(
      <EmptyState title="No data" message="Nothing to show here" />,
    );
    await waitFor(() => {
      expect(getByText('No data')).toBeTruthy();
      expect(getByText('Nothing to show here')).toBeTruthy();
    });
  });

  it('renders action button when provided', async () => {
    const onAction = jest.fn();
    const { getByText } = renderWithTheme(
      <EmptyState
        title="Empty"
        message="Add something"
        actionLabel="Add Item"
        onAction={onAction}
      />,
    );
    await waitFor(() => expect(getByText('Add Item')).toBeTruthy());
    fireEvent.press(getByText('Add Item'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when actionLabel is missing', async () => {
    const { queryByText } = renderWithTheme(<EmptyState title="Empty" message="Nothing" />);
    await waitFor(() => expect(queryByText('Empty')).toBeTruthy());
    expect(queryByText('Add Item')).toBeNull();
  });
});
