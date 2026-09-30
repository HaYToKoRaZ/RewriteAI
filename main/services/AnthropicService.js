import { Logger } from '../core/Logger.js';

export class AnthropicService {
  static ENDPOINT = 'https://api.anthropic.com/v1/messages';

  static async generate(apiKey, promptText, model = 'claude-3-5-haiku-20241022') {
    const cleanKey = (apiKey || '').trim();
    if (!cleanKey) {
      throw new Error('Anthropic API anahtarı bulunamadı. Lütfen eklenti ayarlarından Anthropic API anahtarınızı girin.');
    }

    const payload = {
      model,
      max_tokens: 2048,
      system: 'Sen profesyonel bir metin düzenleme ve dilbilgisi asistanısın. Yalnızca istenen nihai metni üret, fazladan sohbet cümlesi ekleme.',
      messages: [
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
          'x-api-key': cleanKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true'
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
        const msg = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        if (response.status === 401) {
          throw new Error(`Anthropic Hatası (401 Yetkisiz): ${msg} (Lütfen 'sk-ant-api03-...' ile başlayan geçerli bir API anahtarı girildiğinden ve hesapta kredi olduğundan emin olun).`);
        }
        if (response.status === 429) {
          throw new Error('Anthropic hız veya bakiye limiti aşıldı.');
        }
        throw new Error(`Anthropic Hatası: ${msg}`);
      }

      const data = await response.json();
      const textBlock = data.content?.find((c) => c.type === 'text');
      if (!textBlock?.text) {
        throw new Error('Anthropic boş bir yanıt döndürdü.');
      }
      return textBlock.text.trim();
    } catch (err) {
      Logger.error('AnthropicService Hatası:', err);
      throw err;
    }
  }
}
