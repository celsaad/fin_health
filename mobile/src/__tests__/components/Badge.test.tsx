import React from 'react';
import { render } from '@testing-library/react-native';
import Badge from '../../components/Badge';

describe('Badge', () => {
  it('renders the label text', () => {
    const { getByText } = render(<Badge label="income" color="#16a34a" bgColor="#f0fdf4" />);
    expect(getByText('income')).toBeTruthy();
  });

  it('applies color and background color', () => {
    const { getByText } = render(<Badge label="expense" color="#dc2626" bgColor="#fef2f2" />);
    const text = getByText('expense');
    expect(text.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#dc2626' })]),
    );
  });
});
