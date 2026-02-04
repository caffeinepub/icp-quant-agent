import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { useGetCkBtcIcpRatio, useGetLastUpdateId } from '../hooks/useQueries';
import CkBtcIcpRatioSparkline from './CkBtcIcpRatioSparkline';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RatioSample {
  timestamp: number;
  ratio: number;
}

export default function CkBtcIcpRatioWidget() {
  const { data: ratioData, isLoading, error } = useGetCkBtcIcpRatio();
  const { data: lastUpdateId } = useGetLastUpdateId();
  const [samples, setSamples] = useState<RatioSample[]>([]);
  const [prevUpdateId, setPrevUpdateId] = useState<bigint | null>(null);

  // Collect samples only when lastUpdateId changes (backend tick occurred)
  useEffect(() => {
    if (!ratioData || !lastUpdateId) return;

    // Only add a new sample if lastUpdateId has changed
    if (prevUpdateId !== null && lastUpdateId === prevUpdateId) {
      return;
    }

    const now = Date.now();
    const newSample: RatioSample = {
      timestamp: now,
      ratio: ratioData.ratio,
    };

    setSamples(prev => {
      // Add new sample
      const updated = [...prev, newSample];
      
      // Remove samples older than 60 seconds
      const cutoff = now - 60000;
      return updated.filter(s => s.timestamp >= cutoff);
    });

    setPrevUpdateId(lastUpdateId);
  }, [ratioData, lastUpdateId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            ckBTC/ICP Ratio Monitor
          </CardTitle>
          <CardDescription>Loading real-time ratio data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error || !ratioData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            ckBTC/ICP Ratio Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Unable to fetch ratio data. Please check ICPSwap canister configuration.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Calculate deviation percentage
  const deviation = Math.abs((ratioData.ratio - ratioData.avg24h) / ratioData.avg24h) * 100;
  const isViable = deviation > 1.5;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ckBTC/ICP Ratio Monitor
            </CardTitle>
            <CardDescription>Real-time price ratio from ICPSwap pool (xmiu5-jqaaa-aaaag-qbz7q-cai)</CardDescription>
          </div>
          <Badge variant="outline" className="font-mono">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm font-medium text-muted-foreground">Current Ratio</p>
            <p className="mt-2 font-mono text-3xl font-bold">{ratioData.ratio.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">ICP per ckBTC</p>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <p className="text-sm font-medium text-muted-foreground">24h Average</p>
                    <p className="mt-2 font-mono text-3xl font-bold">{ratioData.avg24h.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Rolling average</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Computed from samples collected over the last 24 hours</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className={`rounded-lg border-2 p-4 ${isViable ? 'border-green-500/50 bg-green-500/10' : 'border-border bg-muted/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isViable ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <p className="font-semibold">Arbitrage Viability Signal</p>
            </div>
            <Badge variant={isViable ? 'default' : 'secondary'} className={isViable ? 'bg-green-500 hover:bg-green-600' : ''}>
              {isViable ? 'TRUE' : 'FALSE'}
            </Badge>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-muted-foreground">
              Deviation from 24h average: <span className="font-mono font-semibold">{deviation.toFixed(3)}%</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {isViable 
                ? '✓ Price deviation exceeds 1.5% threshold - arbitrage opportunity detected'
                : '○ Price deviation below 1.5% threshold - no arbitrage signal'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">1-Minute Volatility Chart</p>
            <Badge variant="outline" className="text-xs">
              {samples.length} samples
            </Badge>
          </div>
          <CkBtcIcpRatioSparkline samples={samples} />
          <p className="text-xs text-muted-foreground">
            Real-time sparkline showing ratio fluctuations over the last 60 seconds (synced to 10s backend ticks)
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Reserve 0 (ckBTC)</p>
              <p className="font-mono font-semibold">{ratioData.reserve0.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reserve 1 (ICP)</p>
              <p className="font-mono font-semibold">{ratioData.reserve1.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
