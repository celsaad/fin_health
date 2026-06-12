import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useReceiptScan } from '@/hooks/useReceiptScan';
import { useTransactionForm } from '@/providers/TransactionFormProvider';
import type { ReceiptScanResult } from '@fin-health/shared';

interface ReceiptScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type AcceptedMimeType = (typeof ACCEPTED_TYPES)[number];

const CONFIDENCE_LABEL_KEYS: Record<ReceiptScanResult['confidence'], string> = {
  high: 'receiptScanner.confidenceHigh',
  medium: 'receiptScanner.confidenceMedium',
  low: 'receiptScanner.confidenceLow',
};

const CONFIDENCE_COLORS: Record<ReceiptScanResult['confidence'], string> = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600',
};

export function ReceiptScanner({ open, onOpenChange }: ReceiptScannerProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<AcceptedMimeType>('image/jpeg');
  const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null);

  const scanMutation = useReceiptScan();
  const { openFormWithData } = useTransactionForm();

  function handleClose() {
    setPreview(null);
    setImageBase64(null);
    setScanResult(null);
    scanMutation.reset();
    onOpenChange(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = file.type as AcceptedMimeType;
    if (!ACCEPTED_TYPES.includes(type)) return;

    setMimeType(type);
    setScanResult(null);
    scanMutation.reset();

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      // strip the data:image/...;base64, prefix
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleScan() {
    if (!imageBase64) return;
    try {
      const { result } = await scanMutation.mutateAsync({ imageBase64, mimeType });
      setScanResult(result);
    } catch {
      // handled by scanMutation.isError / onError toast
    }
  }

  function handleUseData() {
    if (!scanResult) return;
    openFormWithData({
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

  const isScanning = scanMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="size-5" />
            {t('receiptScanner.title')}
          </DialogTitle>
          <DialogDescription>{t('receiptScanner.dialogDescription')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Image picker */}
          {!preview && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-10 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Upload className="size-8" />
              <span className="text-sm font-medium">{t('receiptScanner.tapToSelect')}</span>
              <span className="text-xs">{t('receiptScanner.supportedFormats')}</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Preview */}
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Receipt preview"
                className="max-h-64 w-full rounded-lg object-contain"
              />
              {!isScanning && !scanResult && (
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setImageBase64(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground shadow"
                  aria-label={t('receiptScanner.removeImage')}
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          )}

          {/* Scan result */}
          {scanResult && (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              <div
                className={`mb-3 flex items-center gap-1.5 font-medium ${CONFIDENCE_COLORS[scanResult.confidence]}`}
              >
                {scanResult.confidence === 'high' ? (
                  <CheckCircle className="size-4" />
                ) : (
                  <AlertCircle className="size-4" />
                )}
                {t(CONFIDENCE_LABEL_KEYS[scanResult.confidence])}
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <dt className="text-muted-foreground">{t('receiptScanner.merchant')}</dt>
                <dd className="font-medium">{scanResult.merchant}</dd>
                <dt className="text-muted-foreground">{t('receiptScanner.amount')}</dt>
                <dd className="font-medium">
                  {scanResult.amount} {scanResult.currency}
                </dd>
                <dt className="text-muted-foreground">{t('receiptScanner.date')}</dt>
                <dd className="font-medium">{scanResult.date}</dd>
                <dt className="text-muted-foreground">{t('receiptScanner.category')}</dt>
                <dd className="font-medium">{scanResult.categoryName}</dd>
                <dt className="text-muted-foreground">{t('receiptScanner.description')}</dt>
                <dd className="font-medium col-span-2 mt-0.5">{scanResult.description}</dd>
              </dl>
            </div>
          )}

          {/* Error */}
          {scanMutation.isError && !scanResult && (
            <p className="text-sm text-destructive">{scanMutation.error.message}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          {!scanResult ? (
            <Button type="button" onClick={handleScan} disabled={!imageBase64 || isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t('receiptScanner.scanning')}
                </>
              ) : (
                t('receiptScanner.scanReceipt')
              )}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setScanResult(null);
                  scanMutation.reset();
                }}
              >
                {t('receiptScanner.rescan')}
              </Button>
              <Button type="button" onClick={handleUseData}>
                {t('receiptScanner.useThisData')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
