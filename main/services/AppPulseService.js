/**
 * AppPulseService - Hafif ve Anonim Uygulama Durum Bildirimi (Heartbeat)
 * Kullanıcının metin verilerini veya API anahtarlarını ASLA göndermez.
 * Sadece anonim oturum ve sürüm bildirimini günde 1 kez yürütür.
 */
export class AppPulseService {
  static ENDPOINT = 'https://hayto-telemetry.korazhayto.workers.dev/api/ping';
  static APP_ID = 'ext_rewriteai';

  static async sendPulse() {
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;

      const todayStr = new Date().toISOString().slice(0, 10);
      const res = await chrome.storage.local.get(['app_pulse_sid', 'app_pulse_last_date']);

      let sid = res.app_pulse_sid;
      let isNew = false;

      if (!sid) {
        sid = 'ext_' + Math.random().toString(36).substring(2, 15);
        await chrome.storage.local.set({ app_pulse_sid: sid });
      }

      if (res.app_pulse_last_date !== todayStr) {
        isNew = true;
        await chrome.storage.local.set({ app_pulse_last_date: todayStr });
      }

      await fetch(this.ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app: this.APP_ID,
          session_id: sid,
          is_new_session: isNew
        }),
        keepalive: true
      });
    } catch {
      // Sessiz hata yakalama
    }
  }

  static init() {
    // Servis worker uyandığında 1 kez tetikle
    this.sendPulse();

    // Periyodik kontrol (Chrome Alarm varsa) veya interval
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        this.sendPulse();
      }, 30 * 60 * 1000); // 30 dakikada bir kontrol
    }
  }
}
