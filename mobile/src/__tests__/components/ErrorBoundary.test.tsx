import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ErrorBoundary from '../../components/ErrorBoundary';

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test crash');
  return <Text>Content is visible</Text>;
}

// Suppress all console.error during these tests — React 19 logs extensively on boundaries
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(getByText('Content is visible')).toBeTruthy();
  });

  it('renders error UI when child throws', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
    expect(queryByText('Content is visible')).toBeNull();
  });

  it('shows error message in __DEV__ mode', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(getByText('Test crash')).toBeTruthy();
  });

  it('recovers when Try Again is pressed', () => {
    let shouldThrow = true;
    function ConditionalThrower() {
      if (shouldThrow) throw new Error('Boom');
      return <Text>Recovered</Text>;
    }

    const { getByText } = render(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    expect(getByText('Something went wrong')).toBeTruthy();

    // Fix the throw condition before pressing retry
    shouldThrow = false;
    fireEvent.press(getByText('Try Again'));

    expect(getByText('Recovered')).toBeTruthy();
  });
});
