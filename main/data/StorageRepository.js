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

  static async getDailyUsage() {
    const today = new Date().toISOString().slice(0, 10);
    return new Promise((resolve) => {
      chrome.storage.local.get(['usageStats'], (data) => {
        const stats = data.usageStats || {};
        if (stats.date !== today) {
          resolve({ date: today, count: 0 });
        } else {
          resolve({ date: today, count: stats.count || 0 });
        }
      });
    });
  }

  static async incrementDailyUsage() {
    const today = new Date().toISOString().slice(0, 10);
    const usage = await this.getDailyUsage();
    const newCount = (usage.date === today ? usage.count : 0) + 1;
    await this.saveSettings({
      usageStats: { date: today, count: newCount }
    });
    return newCount;
  }
}
