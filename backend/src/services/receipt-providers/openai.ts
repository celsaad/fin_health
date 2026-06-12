import OpenAI from 'openai';
import { receiptScanResultSchema, type ReceiptScanResult } from '@fin-health/shared';
import { env } from '../../lib/env';
import type { ReceiptProvider } from '../receiptScanner';
import { RECEIPT_PROMPT, parseReceiptJson } from '../receiptScanner';

export class OpenAIReceiptProvider implements ReceiptProvider {
  private client: OpenAI;

  constructor() {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for the openai receipt provider');
    }
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async scan(imageBase64: string, mimeType: string): Promise<ReceiptScanResult> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            { type: 'text', text: RECEIPT_PROMPT },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? '';
    return receiptScanResultSchema.parse(parseReceiptJson(text));
  }
}
