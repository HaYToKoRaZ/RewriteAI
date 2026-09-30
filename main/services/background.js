import { ContextMenuService } from './ContextMenuService.js';
import { TextTransformService } from './TextTransformService.js';
import { Logger } from '../core/Logger.js';

Logger.log('Background Service Worker başlatıldı.');

// Sağ tık menülerini başlat
ContextMenuService.init();

// Content Script & Popup mesajlaşma merkezi
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ status: 'PONG' });
    return true;
  }

  if (message.type === 'TRANSFORM_TEXT') {
    TextTransformService.transform(message.text, message.tone)
      .then((result) => {
        sendResponse({ success: true, result });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
    return true; // Asenkron yanıt için şart
  }
});
