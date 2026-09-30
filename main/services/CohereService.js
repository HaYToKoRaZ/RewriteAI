import { Logger } from '../core/Logger.js';

export class CohereService {
  static ENDPOINT = 'https://api.cohere.com/v2/chat';

  static async generate(apiKey, promptText, model = 'command-r-plus') {
    if (!apiKey) {
      throw new Error('Cohere API anahtarı bulunamadı. Lütfen eklenti ayarlarından Cohere API anahtarınızı girin.');
    }

    const payload = {
      model,
      messages: [
        {
          role: 'system',
          content: 'Sen profesyonel bir metin düzenleme, dilbilgisi düzeltme ve üslup uyarlama asistanısın. Yalnızca istenen nihai metni üret, fazladan sohbet cümlesi ekleme.'
        },
        {
          role: 'user',
          content: promptText
        }
      ]
    };

    try {
      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errData = null;
        try {
          errData = await response.json();
        } catch {
          // ignore
        }
        const msg = errData?.message || `HTTP ${response.status}: ${response.statusText}`;
        if (response.status === 401) {
          throw new Error('Cohere API anahtarı geçersiz. Lütfen ayarları kontrol edin.');
        }
        if (response.status === 429) {
          throw new Error('Cohere istek kotası aşıldı. Lütfen biraz bekleyin.');
        }
        throw new Error(`Cohere API Hatası: ${msg}`);
      }

      const data = await response.json();
      const content = data.message?.content?.[0]?.text;
      if (!content) {
        throw new Error('Cohere boş bir yanıt döndürdü.');
      }
      return content.trim();
    } catch (err) {
      Logger.error('CohereService Hatası:', err);
      throw err;
    }
  }
}
