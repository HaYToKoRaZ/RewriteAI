import { Logger } from '../core/Logger.js';

export class CohereService {
  static BASE_URL = 'https://api.cohere.com/v2';

  /**
   * Hesaptaki aktif modelleri çeker
   */
  static async getAvailableModels(apiKey) {
    if (!apiKey) return [];
    try {
      const response = await fetch(`${this.BASE_URL}/models`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return (data.models || []).map((m) => m.name);
    } catch {
      return [];
    }
  }

  static async generate(apiKey, promptText, requestedModel = 'command-a') {
    if (!apiKey) {
      throw new Error('Cohere API anahtarı bulunamadı. Lütfen eklenti ayarlarından Cohere API anahtarınızı girin.');
    }

    // Cohere güncel modelleri (Command A+, Command A, Command R7B, command-r-08-2024 vb.)
    let candidateModels = [
      requestedModel,
      'command-a',
      'command-a-plus',
      'command-r7b-12-2024',
      'command-r-08-2024',
      'command-r-plus-08-2024'
    ].filter((m, idx, self) => m && self.indexOf(m) === idx);

    try {
      const live = await this.getAvailableModels(apiKey);
      if (live.length > 0) {
        candidateModels = [
          requestedModel,
          ...live
        ].filter((m, idx, self) => m && self.indexOf(m) === idx && live.includes(m));
      }
    } catch {
      // ignore
    }

    let lastError = null;

    for (const model of candidateModels) {
      try {
        Logger.log(`Cohere modeli deneniyor: ${model}`);
        const payload = {
          model,
          messages: [
            {
              role: 'system',
              content: 'Sen profesyonel bir metin düzenleme ve dilbilgisi asistanısın. Yalnızca istenen nihai metni üret, fazladan sohbet cümlesi ekleme.'
            },
            {
              role: 'user',
              content: promptText
            }
          ]
        };

        const response = await fetch(`${this.BASE_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          let errData = null;
          try { errData = await response.json(); } catch {}
          const msg = errData?.message || `HTTP ${response.status}: ${response.statusText}`;

          if (msg.includes('removed') || msg.includes('not found') || response.status === 404) {
            Logger.warn(`Cohere modeli '${model}' emekli edilmiş, sıradaki modele geçiliyor... Hata: ${msg}`);
            lastError = new Error(msg);
            continue;
          }

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
        if (err.message && (err.message.includes('removed') || err.message.includes('not found'))) {
          lastError = err;
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('Kullanılabilir aktif bir Cohere modeli bulunamadı.');
  }
}
