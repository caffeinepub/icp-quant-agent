import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Radio, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useGetLiveDataSourceStatus, useSetLiveDataSource } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function LiveDataSourceControl() {
  const { data: status, isLoading } = useGetLiveDataSourceStatus();
  const setLiveDataSource = useSetLiveDataSource();

  const handleToggle = async (checked: boolean) => {
    try {
      await setLiveDataSource.mutateAsync(checked);
      toast.success(
        checked 
          ? 'Live Data Source enabled - 10s ICPSwap outcall loop started' 
          : 'Live Data Source disabled - Timer stopped'
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle Live Data Source');
    }
  };

  const isEnabled = status?.enabled ?? false;
  const isTimerRunning = status?.timerRunning ?? false;
  const statusMessage = status?.statusMessage ?? '';

  // Check if status message indicates dev environment or backend not ready
  const isDevEnvironment = statusMessage.includes('Live data unavailable in dev environment');
  const isBackendNotReady = statusMessage.includes('not yet implemented');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Live Data Source
            </CardTitle>
            <CardDescription>
              Toggle real-time ICPSwap HTTPS outcall loop (10-second interval)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isTimerRunning ? 'default' : 'secondary'}>
              {isTimerRunning ? 'Timer Active' : 'Timer Idle'}
            </Badge>
            <Badge variant={isEnabled ? 'default' : 'outline'}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
          <div className="space-y-0.5">
            <Label htmlFor="live-data-toggle" className="text-base font-semibold">
              Enable Live Data Source
            </Label>
            <p className="text-sm text-muted-foreground">
              Start 10-second HTTP outcall loop to ICPSwap API
            </p>
          </div>
          <Switch
            id="live-data-toggle"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading || setLiveDataSource.isPending || isBackendNotReady}
          />
        </div>

        {isBackendNotReady && (
          <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              {statusMessage}
            </AlertDescription>
          </Alert>
        )}

        {isDevEnvironment && (
          <Alert variant="default" className="border-warning/50 bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning-foreground">
              {statusMessage}
            </AlertDescription>
          </Alert>
        )}

        {!isDevEnvironment && !isBackendNotReady && statusMessage && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <h4 className="mb-2 text-sm font-semibold">How It Works</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• <strong>ON:</strong> Canister starts a 10-second ICP Timer that fetches live ckBTC/ICP price and TVL from ICPSwap API</li>
            <li>• <strong>OFF:</strong> Timer is immediately cancelled, no further HTTP outcalls are made</li>
            <li>• <strong>Mainnet Only:</strong> Live data is only available when deployed to IC Mainnet</li>
            <li>• <strong>Signal Detection:</strong> Each tick logs price, TVL, and fluctuation to Evolutionary Lab history</li>
          </ul>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">Data Source</p>
            <p className="mt-1 font-mono text-sm font-semibold">ICPSwap API</p>
            <p className="text-xs text-muted-foreground">Pool: xmiu5-jqaaa-aaaag-qbz7q-cai</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">Outcall Interval</p>
            <p className="mt-1 font-mono text-sm font-semibold">10 seconds</p>
            <p className="text-xs text-muted-foreground">Controlled by ICP Timer</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
