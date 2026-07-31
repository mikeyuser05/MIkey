class PWAService {
  private deferredPrompt: any = null;

  public init() {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA]: ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('[PWA]: ServiceWorker registration failed:', error);
          });
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('[PWA]: Install prompt captured.');
    });
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('[PWA]: Install prompt not available or app already installed.');
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    return outcome === 'accepted';
  }

  public isInstallable(): boolean {
    return this.deferredPrompt !== null;
  }
}

export const pwaService = new PWAService();
