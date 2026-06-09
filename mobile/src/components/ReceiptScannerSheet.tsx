import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, CheckCircle, AlertCircle, X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { trpcClient } from '../lib/trpc';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';
import Button from './Button';
import type { ReceiptScanResult } from '@fin-health/shared';

interface PrefillData {
  amount?: string;
  currency?: string;
  type?: 'expense' | 'income';
  description?: string;
  date?: string;
  categoryName?: string;
  subcategoryName?: string;
  notes?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onScanComplete: (data: PrefillData) => void;
}

const CONFIDENCE_COLORS = {
  high: '#16a34a',
  medium: '#d97706',
  low: '#dc2626',
};

export default function ReceiptScannerSheet({ visible, onClose, onScanComplete }: Props) {
  const { colors } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  function handleClose() {
    setImageUri(null);
    setImageBase64(null);
    setScanResult(null);
    onClose();
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageBase64(asset.base64 ?? null);
      const type = asset.mimeType as typeof mimeType;
      setMimeType(type && type.startsWith('image/') ? type : 'image/jpeg');
      setScanResult(null);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageBase64(asset.base64 ?? null);
      setMimeType('image/jpeg');
      setScanResult(null);
    }
  }

  async function handleScan() {
    if (!imageBase64) return;
    setIsScanning(true);
    try {
      const { result } = await trpcClient.receipts.scan.mutate({ imageBase64, mimeType });
      setScanResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to scan receipt';
      Alert.alert('Scan failed', msg);
    } finally {
      setIsScanning(false);
    }
  }

  function handleUseData() {
    if (!scanResult) return;
    onScanComplete({
      amount: scanResult.amount,
      currency: scanResult.currency,
      type: scanResult.type,
      description: scanResult.description,
      date: scanResult.date,
      categoryName: scanResult.categoryName,
      subcategoryName: scanResult.subcategoryName,
      notes: scanResult.notes,
    });
    handleClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Camera size={20} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Scan Receipt</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Take a photo or upload a receipt to auto-fill transaction details.
          </Text>

          {/* Image preview or picker */}
          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
              {!isScanning && !scanResult && (
                <TouchableOpacity
                  style={[styles.removeBtn, { backgroundColor: colors.card }]}
                  onPress={() => {
                    setImageUri(null);
                    setImageBase64(null);
                  }}
                >
                  <X size={16} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.pickerRow}>
              <TouchableOpacity
                style={[
                  styles.pickerBtn,
                  { backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
                onPress={takePhoto}
              >
                <Camera size={24} color={colors.primary} />
                <Text style={[styles.pickerLabel, { color: colors.text }]}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pickerBtn,
                  { backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
                onPress={pickImage}
              >
                <Upload size={24} color={colors.primary} />
                <Text style={[styles.pickerLabel, { color: colors.text }]}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Scan result */}
          {scanResult && (
            <View
              style={[
                styles.resultCard,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <View style={styles.confidenceRow}>
                {scanResult.confidence === 'high' ? (
                  <CheckCircle size={16} color={CONFIDENCE_COLORS.high} />
                ) : (
                  <AlertCircle size={16} color={CONFIDENCE_COLORS[scanResult.confidence]} />
                )}
                <Text
                  style={[
                    styles.confidenceText,
                    { color: CONFIDENCE_COLORS[scanResult.confidence] },
                  ]}
                >
                  {scanResult.confidence === 'high'
                    ? 'High confidence'
                    : scanResult.confidence === 'medium'
                      ? 'Medium confidence'
                      : 'Low confidence — please verify'}
                </Text>
              </View>
              <ResultRow label="Merchant" value={scanResult.merchant} colors={colors} />
              <ResultRow
                label="Amount"
                value={`${scanResult.amount} ${scanResult.currency}`}
                colors={colors}
              />
              <ResultRow label="Date" value={scanResult.date} colors={colors} />
              <ResultRow label="Category" value={scanResult.categoryName} colors={colors} />
              <ResultRow label="Description" value={scanResult.description} colors={colors} />
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {!scanResult ? (
              <>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={handleClose}
                  style={styles.actionBtn}
                />
                <Button
                  title={isScanning ? 'Scanning...' : 'Scan Receipt'}
                  onPress={handleScan}
                  disabled={!imageBase64 || isScanning}
                  loading={isScanning}
                  style={styles.actionBtn}
                />
              </>
            ) : (
              <>
                <Button
                  title="Re-scan"
                  variant="outline"
                  onPress={() => setScanResult(null)}
                  style={styles.actionBtn}
                />
                <Button title="Use this data" onPress={handleUseData} style={styles.actionBtn} />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ResultRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={styles.resultRow}>
      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.resultValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.sectionHeader,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FontSize.caption,
    marginBottom: Spacing.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  pickerBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  pickerLabel: {
    fontSize: FontSize.label,
    fontWeight: '500',
  },
  previewContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  resultCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  confidenceText: {
    fontSize: FontSize.caption,
    fontWeight: '600',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  resultLabel: {
    fontSize: FontSize.caption,
    flex: 1,
  },
  resultValue: {
    fontSize: FontSize.caption,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
