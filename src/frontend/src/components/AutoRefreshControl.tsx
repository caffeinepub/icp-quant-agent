import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEffect, useRef } from 'react';

interface AutoRefreshControlProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onRefresh: () => void;
  intervalSeconds?: number;
}

export default function AutoRefreshControl({
  enabled,
  onToggle,
  onRefresh,
  intervalSeconds = 30,
}: AutoRefreshControlProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(() => {
        onRefresh();
      }, intervalSeconds * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intervalSeconds, onRefresh]);

  return (
    <div className="flex items-center gap-2">
      <Switch id="auto-refresh" checked={enabled} onCheckedChange={onToggle} />
      <Label htmlFor="auto-refresh" className="cursor-pointer text-sm">
        Auto-refresh ({intervalSeconds}s)
      </Label>
    </div>
  );
}
