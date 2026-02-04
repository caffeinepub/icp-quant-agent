import { useState, useEffect } from 'react';
import { notificationCenter, NotificationWarning, WARNING_IDS } from '../lib/notificationCenter';

export function useNotificationCenter() {
  const [warnings, setWarnings] = useState<NotificationWarning[]>([]);

  useEffect(() => {
    // Initial load
    setWarnings(notificationCenter.getWarnings());

    // Subscribe to changes
    const unsubscribe = notificationCenter.subscribe(() => {
      setWarnings(notificationCenter.getWarnings());
    });

    return unsubscribe;
  }, []);

  const addWarning = (id: string, message: string, persistent: boolean = true) => {
    notificationCenter.addWarning(id, message, persistent);
  };

  const removeWarning = (id: string) => {
    notificationCenter.removeWarning(id);
  };

  const clearAll = () => {
    notificationCenter.clearAll();
  };

  return {
    warnings,
    addWarning,
    removeWarning,
    clearAll,
    WARNING_IDS,
  };
}
