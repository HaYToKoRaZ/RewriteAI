import { GeminiService } from './GeminiService.js';
import { OpenAISpecService } from './OpenAISpecService.js';
import { CohereService } from './CohereService.js';
import { HuggingFaceService } from './HuggingFaceService.js';
import { AnthropicService } from './AnthropicService.js';
import { StorageRepository } from '../data/StorageRepository.js';
import { AVAILABLE_MODELS } from '../data/DefaultSettings.js';
import { TONE_DEFINITIONS } from '../core/TonePrompts.js';
import { Logger } from '../core/Logger.js';

export class TextTransformService {
  static async transform(text, toneId = 'fix_grammar', overrideModel = null) {
    if (!text || text.trim() === '') {
      throw new Error('Lütfen dönüştürülecek bir metin girin.');
    }

    const settings = await StorageRepository.getSettings();
    const activeModelId = overrideModel || settings.selectedModel || 'gemini-3.5-flash-lite';
    const modelMeta = AVAILABLE_MODELS.find((m) => m.id === activeModelId) || {
      id: activeModelId,
      provider: 'gemini'
    };

    const toneConfig = TONE_DEFINITIONS[toneId] || TONE_DEFINITIONS.fix_grammar;
    const prompt = `${toneConfig.prompt}\n\nİşlenecek Metin:\n"""\n${text}\n"""`;

    Logger.log(`Metin işleniyor... Model: ${activeModelId} (${modelMeta.provider}), Ton: ${toneConfig.name}`);

    let result = '';

    switch (modelMeta.provider) {
      case 'gemini': {
        const key = settings.apiKey;
        if (!key) {
          throw new Error('Google Gemini API Anahtarınız kayıtlı değil. Lütfen eklenti ayarlarından girin.');
        }
        result = await GeminiService.generate(key, prompt, activeModelId);
        break;
      }

      case 'groq': {
        const key = settings.groqApiKey;
        if (!key) {
          throw new Error('Groq API Anahtarınız bulunamadı. Lütfen eklenti ayarlarından ücretsiz Groq anahtarınızı girin.');
        }
        result = await OpenAISpecService.generate({
          endpoint: 'https://api.groq.com/openai/v1/chat/completions',
          apiKey: key,
          model: activeModelId,
          promptText: prompt
        });
        break;
      }

      case 'cohere': {
        const key = settings.cohereApiKey;
        if (!key) {
          throw new Error('Cohere API Anahtarınız bulunamadı. Lütfen eklenti ayarlarından Cohere anahtarınızı girin.');
        }
        result = await CohereService.generate(key, prompt, activeModelId);
        break;
      }

      case 'huggingface': {
        const key = settings.hfApiKey;
        if (!key) {
          throw new Error('Hugging Face Access Token bulunamadı. Lütfen eklenti ayarlarından girin.');
        }
        result = await HuggingFaceService.generate(key, prompt, activeModelId);
        break;
      }

      case 'openai': {
        const key = settings.openaiApiKey;
        if (!key) {
          throw new Error('OpenAI API Anahtarınız bulunamadı. Lütfen eklenti ayarlarından girin.');
        }
        result = await OpenAISpecService.generate({
          endpoint: 'https://api.openai.com/v1/chat/completions',
          apiKey: key,
          model: activeModelId,
          promptText: prompt
        });
        break;
      }

      case 'anthropic': {
        const key = settings.anthropicApiKey;
        if (!key) {
          throw new Error('Anthropic Claude API Anahtarınız bulunamadı. Lütfen eklenti ayarlarından girin.');
        }
        result = await AnthropicService.generate(key, prompt, activeModelId);
        break;
      }

      case 'deepseek': {
        const key = settings.deepseekApiKey;
        if (!key) {
          throw new Error('DeepSeek API Anahtarınız bulunamadı. Lütfen eklenti ayarlarından girin.');
        }
        result = await OpenAISpecService.generate({
          endpoint: 'https://api.deepseek.com/chat/completions',
          apiKey: key,
          model: activeModelId,
          promptText: prompt
        });
        break;
      }

      default:
        throw new Error(`Desteklenmeyen yapay zeka sağlayıcısı: ${modelMeta.provider}`);
    }

    // Sonucu yerel geçmişe kaydet ve kullanılan modelin günlük sayacını artır
    await StorageRepository.saveLastResult(text, result, toneId);
    await StorageRepository.incrementDailyUsage(activeModelId);

    return result;
  }
}
