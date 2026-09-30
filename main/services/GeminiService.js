import { Logger } from '../core/Logger.js';

export class GeminiService {
  static BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

  /**
   * Google Gemini hesabındaki aktif modelleri çeker
   */
  static async getAvailableModels(apiKey) {
    if (!apiKey) return [];
    try {
      const response = await fetch(`${this.BASE_URL}?key=${apiKey}`);
      if (!response.ok) return [];
      const data = await response.json();
      return (data.models || [])
        .map((m) => m.name.replace('models/', ''))
        .filter((name) => name.includes('gemini') && !name.includes('vision') && !name.includes('embedding'));
    } catch (e) {
      Logger.warn('Gemini model listesi çekilemedi:', e);
      return [];
    }
  }

  static async generate(apiKey, promptText, preferredModel = 'gemini-3.5-flash-lite') {
    if (!apiKey) {
      throw new Error('API anahtarı bulunamadı. Lütfen eklenti ayarlarından Gemini API anahtarınızı girin.');
    }

    // Denenecek model öncelik sırası (Aktif çalışan Gemini 3.x Flash ailesi)
    let candidateModels = [
      preferredModel,
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.7-flash'
    ].filter((m, idx, self) => m && self.indexOf(m) === idx);

    try {
      const live = await this.getAvailableModels(apiKey);
      if (live.length > 0) {
        candidateModels = [
          preferredModel,
          ...live
        ].filter((m, idx, self) => m && self.indexOf(m) === idx && live.includes(m));
      }
    } catch {
      // ignore
    }

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
        const rawMessage = errorData?.error?.message || `HTTP ${response.status} hatası`;
        Logger.error('Gemini API Hatası:', rawMessage);
        const localizedMessage = this._localizeErrorMessage(rawMessage);
        throw new Error(localizedMessage);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const resultText = candidate?.content?.parts?.[0]?.text;

      if (!resultText) {
        const isTr = this._isTurkishLocale();
        throw new Error(isTr ? 'API yanıtında metin bulunamadı.' : 'No text found in API response.');
      }

      return resultText.trim();
    } catch (err) {
      Logger.error('Ağ/İstek Hatası:', err);
      throw err;
    }
  }

  static _isTurkishLocale() {
    try {
      const uiLang = chrome?.i18n?.getUILanguage?.() || navigator?.language || 'en';
      return uiLang.toLowerCase().startsWith('tr');
    } catch {
      return true;
    }
  }

  static _localizeErrorMessage(rawMsg) {
    if (!this._isTurkishLocale()) {
      return `Gemini API Error: ${rawMsg}`;
    }

    const lower = rawMsg.toLowerCase();

    if (lower.includes('experiencing high demand') || lower.includes('spikes in demand')) {
      return 'Bu yapay zeka modeli şu anda yoğun talep görüyor. Bu durum genellikle geçicidir; lütfen birkaç saniye sonra tekrar deneyin veya farklı bir model seçin.';
    }

    if (lower.includes('quota') || lower.includes('rate limit') || lower.includes('resource_exhausted')) {
      return 'API kotanız veya dakikalık istek limitiniz doldu. Lütfen 1 dakika bekleyip tekrar deneyin veya AI Studio panelinizi kontrol edin.';
    }

    if (lower.includes('api key not valid') || lower.includes('invalid api key') || lower.includes('api_key_invalid')) {
      return 'Geçersiz API Anahtarı! Lütfen eklenti Ayarlar sayfasından Gemini API anahtarınızı kontrol edip tekrar kaydedin.';
    }

    if (lower.includes('is no longer available') || lower.includes('not found for api version')) {
      return 'Seçilen model artık mevcut değil veya bu API sürümüyle desteklenmiyor. Lütfen pencerenin sağ üstünden Gemini 3.8 Flash veya 3.7 Flash modelini seçin.';
    }

    return `Gemini API Hatası: ${rawMsg}`;
  }
}
