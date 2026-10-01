import { DEFAULT_SETTINGS } from './DefaultSettings.js';

export class StorageRepository {
  static async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(DEFAULT_SETTINGS, (items) => {
        resolve(items);
      });
    });
  }

  static async saveSettings(settings) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(settings, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(true);
        }
      });
    });
  }

  static async getApiKey() {
    const settings = await this.getSettings();
    return settings.apiKey || '';
  }

  static async saveApiKey(apiKey) {
    return this.saveSettings({ apiKey: apiKey.trim() });
  }

  static async getLastResult() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['lastInputText', 'lastOutputText', 'lastTone'], (items) => {
        resolve(items);
      });
    });
  }

  static async saveLastResult(inputText, outputText, tone) {
    return this.saveSettings({
      lastInputText: inputText,
      lastOutputText: outputText,
      lastTone: tone
    });
  }

  static async getDailyUsage(model = 'gemini-3.8-flash') {
    const today = new Date().toISOString().slice(0, 10);
    return new Promise((resolve) => {
      chrome.storage.local.get(['modelUsageStats'], (data) => {
        const stats = data.modelUsageStats || {};
        if (stats.date !== today) {
          resolve({ date: today, count: 0 });
        } else {
          const modelCounts = stats.counts || {};
          resolve({ date: today, count: modelCounts[model] || 0 });
        }
      });
    });
  }

  static async incrementDailyUsage(model = 'gemini-3.8-flash') {
    const today = new Date().toISOString().slice(0, 10);
    return new Promise((resolve) => {
      chrome.storage.local.get(['modelUsageStats'], (data) => {
        let stats = data.modelUsageStats || {};
        if (stats.date !== today) {
          stats = { date: today, counts: {} };
        }
        if (!stats.counts) stats.counts = {};

        const currentCount = stats.counts[model] || 0;
        const newCount = currentCount + 1;
        stats.counts[model] = newCount;

        chrome.storage.local.set({ modelUsageStats: stats }, () => {
          resolve(newCount);
        });
      });
    });
  }

  static async saveUiLanguage(lang) {
    return this.saveSettings({ uiLanguage: lang });
  }

  static async saveSelectedModel(modelId) {
    return this.saveSettings({ selectedModel: modelId });
  }

  static async getTargetLanguage() {
    return new Promise((resolve) => {
      chrome.storage.local.get({ selectedTargetLanguage: 'auto' }, (items) => {
        resolve(items.selectedTargetLanguage || 'auto');
      });
    });
  }

  static async saveTargetLanguage(langCode) {
    return this.saveSettings({ selectedTargetLanguage: langCode });
  }

  static async getTwitterMode() {
    return new Promise((resolve) => {
      chrome.storage.local.get({ twitterMode: false }, (items) => {
        resolve(!!items.twitterMode);
      });
    });
  }

  static async saveTwitterMode(enabled) {
    return this.saveSettings({ twitterMode: enabled });
  }

  static async getApiKeyForModel(modelId) {
    let keyName = 'apiKey';
    if (modelId.startsWith('llama')) keyName = 'groqApiKey';
    else if (modelId.startsWith('command')) keyName = 'cohereApiKey';
    else if (modelId.includes('Qwen') || modelId.includes('/')) keyName = 'hfApiKey';
    else if (modelId.startsWith('gpt')) keyName = 'openaiApiKey';
    else if (modelId.startsWith('claude')) keyName = 'anthropicApiKey';
    else if (modelId.startsWith('deepseek')) keyName = 'deepseekApiKey';
    return new Promise((resolve) => {
      chrome.storage.local.get([keyName], (data) => {
        resolve({ keyName, value: data[keyName] || '' });
      });
    });
  }
}