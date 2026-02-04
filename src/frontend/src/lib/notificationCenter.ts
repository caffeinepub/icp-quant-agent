export interface NotificationWarning {
  id: string;
  message: string;
  timestamp: number;
  persistent: boolean;
}

class NotificationCenterState {
  private warnings: NotificationWarning[] = [];
  private listeners: Set<() => void> = new Set();

  addWarning(id: string, message: string, persistent: boolean = true): void {
    // Check if warning already exists
    const existing = this.warnings.find(w => w.id === id);
    if (existing) return;

    this.warnings.push({
      id,
      message,
      timestamp: Date.now(),
      persistent,
    });
    this.notifyListeners();
  }

  removeWarning(id: string): void {
    this.warnings = this.warnings.filter(w => w.id !== id);
    this.notifyListeners();
  }

  clearAll(): void {
    this.warnings = [];
    this.notifyListeners();
  }

  getWarnings(): NotificationWarning[] {
    return [...this.warnings];
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const notificationCenter = new NotificationCenterState();

// Predefined warning IDs
export const WARNING_IDS = {
  CANISTER_TIMEOUT: 'canister-timeout',
  TIMER_START_FAILED: 'timer-start-failed',
} as const;
