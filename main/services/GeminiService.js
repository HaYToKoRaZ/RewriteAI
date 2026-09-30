import { Logger } from '../core/Logger.js';

export class GeminiService {
  static BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

  static async generate(apiKey, promptText, preferredModel = 'gemini-2.0-flash') {
    if (!apiKey) {
      throw new Error('API anahtarı bulunamadı. Lütfen eklenti ayarlarından Gemini API anahtarınızı girin.');
    }

    // Denenecek model öncelik sırası
    const candidateModels = [
      preferredModel,
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-1.5-flash'
    ].filter((m, idx, self) => m && self.indexOf(m) === idx);

    let lastError = null;

    for (const model of candidateModels) {
      try {
        const result = await this._callModel(apiKey, promptText, model);
        return result;
      } catch (err) {
        lastError = err;
        // Eğer model bulunamadı (404) hatası ise bir sonraki güncel modeli dene
        if (err.message && (err.message.includes('not found') || err.message.includes('404'))) {
          Logger.warn(`Model '${model}' bulunamadı, sıradaki modele geçiliyor...`);
          continue;
        }
        // Başka bir hata (ör. API anahtarı geçersiz, kota aşımı) ise hemen fırlat
        throw err;
      }
    }

    throw lastError || new Error('Uygun bir Gemini modeli bulunamadı.');
  }

  static async _callModel(apiKey, promptText, model) {
    const endpoint = `${this.BASE_URL}/${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: promptText
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `HTTP ${response.status} hatası`;
        Logger.error('Gemini API Hatası:', message);
        throw new Error(`Gemini API Hatası: ${message}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const resultText = candidate?.content?.parts?.[0]?.text;

      if (!resultText) {
        throw new Error('API yanıtında metin bulunamadı.');
      }

      return resultText.trim();
    } catch (err) {
      Logger.error('Ağ/İstek Hatası:', err);
      throw err;
    }
  }
}
