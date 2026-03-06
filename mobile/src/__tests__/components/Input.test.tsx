import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Input from '../../components/Input';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Input', () => {
  it('renders label', async () => {
    const { getByText } = renderWithTheme(<Input label="Email" placeholder="Enter email" />);
    await waitFor(() => expect(getByText('Email')).toBeTruthy());
  });

  it('renders placeholder', async () => {
    const { getByPlaceholderText } = renderWithTheme(<Input placeholder="Enter email" />);
    await waitFor(() => expect(getByPlaceholderText('Enter email')).toBeTruthy());
  });

  it('displays error message', async () => {
    const { getByText } = renderWithTheme(<Input label="Email" error="Email is required" />);
    await waitFor(() => expect(getByText('Email is required')).toBeTruthy());
  });

  it('calls onChangeText', async () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = renderWithTheme(
      <Input placeholder="Type here" onChangeText={onChange} />,
    );
    await waitFor(() => expect(getByPlaceholderText('Type here')).toBeTruthy());
    fireEvent.changeText(getByPlaceholderText('Type here'), 'hello');
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('renders right label and handles press', async () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Input label="Password" rightLabel={{ text: 'Forgot?', onPress }} />,
    );
    await waitFor(() => expect(getByText('Forgot?')).toBeTruthy());
    fireEvent.press(getByText('Forgot?'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders eye icon for password input', async () => {
    const { getByTestId } = renderWithTheme(<Input label="Password" isPassword value="secret" />);
    await waitFor(() => expect(getByTestId('icon-Eye')).toBeTruthy());
  });
});
