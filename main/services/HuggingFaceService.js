import { Logger } from '../core/Logger.js';

export class HuggingFaceService {
  /**
   * Hugging Face yeni birleşik router uç noktası (OpenAI uyumlu /v1/chat/completions)
   */
  static ROUTER_BASE = 'https://router.huggingface.co/v1/chat/completions';

  static async generate(apiKey, promptText, requestedModel = 'Qwen/Qwen2.5-72B-Instruct') {
    if (!apiKey) {
      throw new Error('Hugging Face Access Token bulunamadı. Lütfen eklenti ayarlarından girin.');
    }

    // Hugging Face router üzerinde çalışan popüler açık kaynak modeller sırası
    const candidateModels = [
      requestedModel,
      'Qwen/Qwen2.5-72B-Instruct',
      'meta-llama/Llama-3.3-70B-Instruct',
      'meta-llama/Llama-3.1-8B-Instruct',
      'mistralai/Mistral-7B-Instruct-v0.3'
    ].filter((m, idx, self) => m && self.indexOf(m) === idx);

    let lastError = null;

    for (const model of candidateModels) {
      try {
        Logger.log(`Hugging Face modeli deneniyor: ${model}`);
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
          ],
          max_tokens: 2048,
          temperature: 0.4
        };

        const response = await fetch(this.ROUTER_BASE, {
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
          const msg = errData?.error?.message || errData?.error || `HTTP ${response.status}: ${response.statusText}`;

          if (msg.includes('not supported') || response.status === 404 || response.status === 400) {
            Logger.warn(`Hugging Face '${model}' bu sağlayıcı tarafından desteklenmiyor, sıradaki modele geçiliyor: ${msg}`);
            lastError = new Error(msg);
            continue;
          }

          if (response.status === 401) {
            throw new Error('Hugging Face Token geçersiz veya yetersiz (Read yetkili token olmalı).');
          }
          if (response.status === 503) {
            throw new Error('Model şu an yükleniyor, lütfen birkaç saniye sonra tekrar deneyin.');
          }
          throw new Error(`Hugging Face Hatası: ${msg}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('Hugging Face boş bir yanıt döndürdü.');
        }
        return content.trim();
      } catch (err) {
        if (err.message && err.message.includes('not supported')) {
          lastError = err;
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('Kullanılabilir aktif bir Hugging Face modeli bulunamadı.');
  }
}
