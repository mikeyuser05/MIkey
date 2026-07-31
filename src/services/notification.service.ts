class PushNotificationService {
  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[Push Notification]: Browser does not support native notifications.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  public sendEmergencyAlert(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'emergency-alert',
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }

    // Trigger Mobile Device Vibration Pattern (200ms pulse, 100ms pause, 200ms pulse)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }
}

export const notificationService = new PushNotificationService();
