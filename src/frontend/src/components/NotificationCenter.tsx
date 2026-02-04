import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useNotificationCenter } from '../hooks/useNotificationCenter';
import { cn } from '../lib/utils';

export default function NotificationCenter() {
  const { warnings, removeWarning, clearAll } = useNotificationCenter();

  if (warnings.length === 0) {
    return null;
  }

  return (
    <Card className="border-warning/50 bg-warning/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle className="text-base">System Warnings</CardTitle>
            <Badge variant="outline" className="ml-2">
              {warnings.length}
            </Badge>
          </div>
          {warnings.length > 1 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {warnings.map((warning) => (
          <div
            key={warning.id}
            className={cn(
              'flex items-start justify-between rounded-lg border border-warning/30 bg-background p-3',
              warning.id === 'canister-timeout' && 'border-destructive/50 bg-destructive/5'
            )}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{warning.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(warning.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => removeWarning(warning.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
