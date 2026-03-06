import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (!isOffline) return null;

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 4 }]}>
      <WifiOff size={14} color="#ffffff" />
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 6,
    zIndex: 1000,
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
