import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { AlertTriangle, RotateCcw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <AlertTriangle size={48} color="#dc2626" />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app ran into an unexpected error. Please try again.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorDetail} numberOfLines={6}>
              {this.state.error.message}
            </Text>
          )}
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <RotateCcw size={18} color="#ffffff" />
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#0f1729',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 20,
  },
  message: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  errorDetail: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 32,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
