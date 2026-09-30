import { GeminiService } from './GeminiService.js';
import { StorageRepository } from '../data/StorageRepository.js';
import { TONE_DEFINITIONS } from '../core/TonePrompts.js';
import { Logger } from '../core/Logger.js';

export class TextTransformService {
  static async transform(text, toneId = 'fix_grammar') {
    if (!text || text.trim() === '') {
      throw new Error('Lütfen dönüştürülecek bir metin girin.');
    }

    const settings = await StorageRepository.getSettings();
    if (!settings.apiKey) {
      throw new Error('Lütfen önce Eklenti Seçeneklerinden Gemini API Anahtarınızı kaydedin.');
    }

    const toneConfig = TONE_DEFINITIONS[toneId] || TONE_DEFINITIONS.fix_grammar;
    const prompt = `${toneConfig.prompt}\n\nİşlenecek Metin:\n"""\n${text}\n"""`;

    Logger.log(`Metin işleniyor... Model: ${settings.selectedModel}, Ton: ${toneConfig.name}`);
    const result = await GeminiService.generate(settings.apiKey, prompt, settings.selectedModel);

    // Sonucu yerel geçmişe kaydet
    await StorageRepository.saveLastResult(text, result, toneId);

    return result;
  }
}
