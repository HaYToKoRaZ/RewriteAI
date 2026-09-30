import { Logger } from '../core/Logger.js';

export class GroqService {
  static BASE_URL = 'https://api.groq.com/openai/v1';

  /**
   * Kullanıcının Groq hesabındaki aktif modelleri çeker
   */
  static async getAvailableModels(apiKey) {
    if (!apiKey) return [];
    try {
      const response = await fetch(`${this.BASE_URL}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return (data.data || []).map((m) => m.id);
    } catch (e) {
      Logger.warn('Groq model listesi çekilemedi:', e);
      return [];
    }
  }

  /**
   * Metin dönüştürme isteğini gönderir.
   * Model deprecate olmuş veya yoksa otomatik olarak kullanıcının hesabındaki ilk aktif Llama modeline geçer.
   */
  static async generate(apiKey, promptText, requestedModel = 'llama-3.3-70b-versatile') {
    if (!apiKey) {
      throw new Error('Groq API Anahtarınız bulunamadı. Lütfen eklenti ayarlarından girin.');
    }

    // Olası modeller (Öncelik sırasıyla)
    let candidateModels = [
      requestedModel,
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'llama3-70b-8192',
      'llama3-8b-8192',
      'mixtral-8x7b-32768',
      'gemma2-9b-it'
    ].filter((m, idx, self) => m && self.indexOf(m) === idx);

    // Eğer model listesi çekilebilirse kullanıcı hesabındaki gerçek modellerle listeyi güncelle
    try {
      const liveModels = await this.getAvailableModels(apiKey);
      if (liveModels.length > 0) {
        // İstenen model canlı listede var mı? Varsa ilk sıraya al
        const textModels = liveModels.filter((m) => !m.includes('whisper') && !m.includes('guard'));
        if (textModels.length > 0) {
          candidateModels = [
            requestedModel,
            ...textModels
          ].filter((m, idx, self) => m && self.indexOf(m) === idx && textModels.includes(m));
        }
      }
    } catch {
      // ignore
    }

    let lastError = null;

    for (const model of candidateModels) {
      try {
        Logger.log(`Groq modeli deneniyor: ${model}`);
        const payload = {
          model,
          messages: [
            {
              role: 'system',
              content: 'Sen profesyonel bir metin düzenleme ve dilbilgisi asistanısın. Yalnızca istenen nihai metni üret, fazladan açıklama veya sohbet cümlesi ekleme.'
            },
            {
              role: 'user',
              content: promptText
            }
          ],
          temperature: 0.4,
          max_tokens: 2048
        };

        const response = await fetch(`${this.BASE_URL}/chat/completions`, {
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
          const msg = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;

          // Eğer model bulunamadı veya yetki yoksa sıradaki modeli dene
          if (response.status === 404 || msg.includes('does not exist') || msg.includes('decommissioned')) {
            Logger.warn(`Groq modeli '${model}' aktif değil, sıradaki modele geçiliyor... Hata: ${msg}`);
            lastError = new Error(msg);
            continue;
          }

          if (response.status === 401) {
            throw new Error('Groq API anahtarı geçersiz. Lütfen ayarlar sayfasından kontrol edin.');
          }
          if (response.status === 429) {
            throw new Error('Groq istek sınırı aşıldı. Lütfen biraz bekleyin.');
          }

          throw new Error(`Groq API Hatası: ${msg}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('Groq boş bir yanıt döndürdü.');
        }

        return content.trim();
      } catch (err) {
        if (err.message && (err.message.includes('does not exist') || err.message.includes('decommissioned'))) {
          lastError = err;
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('Hesabınızda kullanılabilir aktif bir Groq modeli bulunamadı.');
  }
}
