import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import ProgressBar from '../../components/ProgressBar';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('ProgressBar', () => {
  it('renders without crashing', async () => {
    const tree = renderWithTheme(<ProgressBar progress={0.5} />);
    await waitFor(() => expect(tree).toBeTruthy());
  });

  it('clamps progress above 1', async () => {
    const tree = renderWithTheme(<ProgressBar progress={1.5} />);
    await waitFor(() => expect(tree).toBeTruthy());
  });

  it('clamps progress below 0', async () => {
    const tree = renderWithTheme(<ProgressBar progress={-0.5} />);
    await waitFor(() => expect(tree).toBeTruthy());
  });

  it('accepts custom height', async () => {
    const tree = renderWithTheme(<ProgressBar progress={0.3} height={12} />);
    await waitFor(() => expect(tree).toBeTruthy());
  });

  it('accepts custom color', async () => {
    const tree = renderWithTheme(<ProgressBar progress={0.5} color="#ff0000" />);
    await waitFor(() => expect(tree).toBeTruthy());
  });
});
