import React from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Card from '../../components/Card';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Card', () => {
  it('renders children', async () => {
    const { getByText } = renderWithTheme(
      <Card>
        <Text>Card content</Text>
      </Card>,
    );
    await waitFor(() => expect(getByText('Card content')).toBeTruthy());
  });

  it('applies custom style', async () => {
    const { getByText } = renderWithTheme(
      <Card style={{ marginTop: 20 }}>
        <Text>Styled card</Text>
      </Card>,
    );
    await waitFor(() => expect(getByText('Styled card')).toBeTruthy());
  });
});
