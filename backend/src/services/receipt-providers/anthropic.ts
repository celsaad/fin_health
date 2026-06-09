import Anthropic from '@anthropic-ai/sdk';
import { receiptScanResultSchema, type ReceiptScanResult } from '@fin-health/shared';
import { env } from '../../lib/env';
import type { ReceiptProvider } from '../receiptScanner';
import { RECEIPT_PROMPT } from '../receiptScanner';

export class AnthropicReceiptProvider implements ReceiptProvider {
  private client: Anthropic;

  constructor() {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required for the anthropic receipt provider');
    }
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  async scan(imageBase64: string, mimeType: string): Promise<ReceiptScanResult> {
    const response = await this.client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            { type: 'text', text: RECEIPT_PROMPT },
          ],
        },
      ],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    return receiptScanResultSchema.parse(JSON.parse(text));
  }
}
