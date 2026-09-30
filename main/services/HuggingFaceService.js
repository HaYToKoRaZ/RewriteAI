import { Logger } from '../core/Logger.js';

export class HuggingFaceService {
  static ROUTER_BASE = 'https://router.huggingface.co/hf-inference/v1/chat/completions';

  static async generate(apiKey, promptText, model = 'Qwen/Qwen2.5-72B-Instruct') {
    if (!apiKey) {
      throw new Error('Hugging Face Access Token bulunamadı. Lütfen eklenti ayarlarından girin.');
    }

    const payload = {
      model,
      messages: [
        {
          role: 'system',
          content: 'Sen profesyonel bir metin düzenleme ve dilbilgisi asistanısın. Yalnızca istenen nihai metni üret.'
        },
        {
          role: 'user',
          content: promptText
        }
      ],
      max_tokens: 2048,
      temperature: 0.4
    };

    try {
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
        try {
          errData = await response.json();
        } catch {
          // ignore
        }
        const msg = errData?.error || `HTTP ${response.status}: ${response.statusText}`;
        if (response.status === 401) {
          throw new Error('Hugging Face Token geçersiz veya okuma izni (read) yok.');
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
      Logger.error('HuggingFaceService Hatası:', err);
      throw err;
    }
  }
}
