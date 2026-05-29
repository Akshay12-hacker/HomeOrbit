import { Platform } from 'react-native';
import logger from '../logger';

/**
 * NotificationService handles:
 * 1. Permission requests
 * 2. Push token management
 * 3. Handling incoming notifications (foreground/background)
 * 4. Local notification scheduling
 */

class NotificationService {
  constructor() {
    this.token = null;
    this.notifications = [];
    this.listeners = new Set();
  }

  // Initialize service
  async init() {
    try {
      logger.info('notification_service_init', { platform: Platform.OS });
      // In a real app with expo-notifications:
      // const { status } = await Notifications.requestPermissionsAsync();
      // if (status === 'granted') { ... }
    } catch (error) {
      logger.error('notification_service_init_failed', { message: error.message });
    }
  }

  // Get all notifications (from local state/storage)
  getNotifications() {
    return this.notifications;
  }

  // Add a new notification to the list
  addNotification(notification) {
    const newNotif = {
      id: Date.now().toString(),
      title: notification.title || 'New Update',
      body: notification.body || '',
      data: notification.data || {},
      receivedAt: new Date().toISOString(),
      read: false,
      type: notification.type || 'info', // info, payment, announcement, alert
    };

    this.notifications = [newNotif, ...this.notifications];
    this.notifyListeners();
    return newNotif;
  }

  // Mark a notification as read
  markAsRead(id) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Event listeners for UI updates
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.notifications));
  }
}

const notificationService = new NotificationService();
export default notificationService;
