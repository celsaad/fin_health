import { useRef, useState } from 'react';
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

const CONFIDENCE_LABELS: Record<ReceiptScanResult['confidence'], string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence — please verify',
};

const CONFIDENCE_COLORS: Record<ReceiptScanResult['confidence'], string> = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600',
};

export function ReceiptScanner({ open, onOpenChange }: ReceiptScannerProps) {
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
    const { result } = await scanMutation.mutateAsync({ imageBase64, mimeType });
    setScanResult(result);
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
            Scan Receipt
          </DialogTitle>
          <DialogDescription>
            Upload a photo of your receipt to automatically fill in transaction details.
          </DialogDescription>
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
              <span className="text-sm font-medium">Tap to select a receipt image</span>
              <span className="text-xs">JPEG, PNG, WebP supported</span>
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
                  aria-label="Remove image"
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
                {CONFIDENCE_LABELS[scanResult.confidence]}
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <dt className="text-muted-foreground">Merchant</dt>
                <dd className="font-medium">{scanResult.merchant}</dd>
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="font-medium">
                  {scanResult.amount} {scanResult.currency}
                </dd>
                <dt className="text-muted-foreground">Date</dt>
                <dd className="font-medium">{scanResult.date}</dd>
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium">{scanResult.categoryName}</dd>
                <dt className="text-muted-foreground">Description</dt>
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
            Cancel
          </Button>
          {!scanResult ? (
            <Button type="button" onClick={handleScan} disabled={!imageBase64 || isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                'Scan Receipt'
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
                Re-scan
              </Button>
              <Button type="button" onClick={handleUseData}>
                Use this data
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
