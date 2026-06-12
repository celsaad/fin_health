import type { ReceiptScanResult } from '@fin-health/shared';
import { env } from '../lib/env';

export interface ReceiptProvider {
  scan(imageBase64: string, mimeType: string): Promise<ReceiptScanResult>;
}

export const RECEIPT_PROMPT = `You are a receipt parser. Extract information from this receipt image and return ONLY a valid JSON object with these exact fields:

{
  "merchant": "store/restaurant/service name",
  "amount": "total amount as a string, e.g. '42.50'",
  "currency": "ISO 4217 3-letter code, e.g. 'USD', 'BRL', 'EUR'",
  "date": "YYYY-MM-DD format",
  "type": "expense" or "income",
  "description": "brief purchase description in English, max 255 chars",
  "categoryName": "e.g. Food & Dining, Shopping, Transportation, Entertainment, Healthcare, Utilities, Housing, Education, Travel, Other",
  "subcategoryName": "optional subcategory or null",
  "notes": "any relevant details or null",
  "confidence": "high", "medium", or "low"
}

Rules:
- Return ONLY the JSON object, no markdown fences, no explanation.
- "type" is almost always "expense" unless this is a refund or income receipt.
- "currency" must be derived from the receipt locale/symbol; default to "USD" if unclear.
- "date" must be the transaction date on the receipt, not today's date.
- "amount" is the grand total including tax, as a plain number string.`;

export function parseReceiptJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return JSON.parse(fenced ? fenced[1] : trimmed);
}

export async function getReceiptProvider(): Promise<ReceiptProvider> {
  switch (env.RECEIPT_PROVIDER) {
    case 'openai': {
      const { OpenAIReceiptProvider } = await import('./receipt-providers/openai.js');
      return new OpenAIReceiptProvider();
    }
    case 'qwen': {
      const { QwenReceiptProvider } = await import('./receipt-providers/qwen.js');
      return new QwenReceiptProvider();
    }
    case 'anthropic':
    default: {
      const { AnthropicReceiptProvider } = await import('./receipt-providers/anthropic.js');
      return new AnthropicReceiptProvider();
    }
  }
}
