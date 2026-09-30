import { Logger } from '../core/Logger.js';

export class OpenAISpecService {
  /**
   * OpenAI Uyumlu Chat Completions İstemcisi
   * Groq, OpenAI ve DeepSeek aynı endpoint formatını (/chat/completions) kullanır.
   */
  static async generate({ endpoint, apiKey, model, promptText, maxTokens = 2048, temperature = 0.4 }) {
    if (!apiKey) {
      throw new Error(`API anahtarı bulunamadı. Lütfen eklenti ayarlarından ilgili sağlayıcının API anahtarını girin.`);
    }

    const payload = {
      model,
      messages: [
        {
          role: 'system',
          content: 'Sen profesyonel bir metin düzenleme, dilbilgisi düzeltme ve üslup uyarlama asistanısın. Kullanıcının talimatlarına tam olarak uy, yalnızca istenen nihai metni üret, fazladan sohbet cümlesi ekleme.'
        },
        {
          role: 'user',
          content: promptText
        }
      ],
      temperature,
      max_tokens: maxTokens
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch {
          // ignore
        }

        const msg = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(this._translateError(msg, response.status));
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Servis boş bir yanıt döndürdü.');
      }

      return content.trim();
    } catch (err) {
      Logger.error(`OpenAISpecService (${model}) Hatası:`, err);
      throw err;
    }
  }

  static _translateError(msg, status) {
    if (status === 401 || msg.includes('invalid_api_key') || msg.includes('Incorrect API key')) {
      return 'Geçersiz API Anahtarı. Lütfen ayarlar sayfasından anahtarınızı kontrol edin.';
    }
    if (status === 429 || msg.includes('rate_limit') || msg.includes('Rate limit')) {
      return 'İstek sınırı (Rate limit) aşıldı. Lütfen biraz bekleyin veya başka bir model seçin.';
    }
    if (msg.includes('insufficient_quota') || msg.includes('quota')) {
      return 'Hesap kotası veya bakiyesi tükendi. Lütfen hesap bakiyenizi kontrol edin.';
    }
    return msg;
  }
}
