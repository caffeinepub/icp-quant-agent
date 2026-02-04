import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Database } from 'lucide-react';
import SnapshotDetailsDialog from './SnapshotDetailsDialog';
import type { PriceSnapshot, PairConfig } from '../backend';

interface MarketSnapshotGridProps {
  pair: PairConfig;
  dexName: string;
  snapshots: PriceSnapshot[];
}

export default function MarketSnapshotGrid({ pair, dexName, snapshots }: MarketSnapshotGridProps) {
  const pairId = `${pair.baseSymbol}/${pair.quoteSymbol}`;
  
  // Find snapshots for this pair from different sources
  const binanceSnapshot = snapshots.find((s) => s.pairId === pairId && s.dexName === 'Binance');
  const icpSwapSnapshot = snapshots.find((s) => s.pairId === pairId && s.dexName === 'ICPSwap');
  const kongSwapSnapshot = snapshots.find((s) => s.pairId === pairId && s.dexName === 'KongSwap');

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    const now = Date.now();
    const diff = now - date.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const renderSnapshotCard = (snapshot: PriceSnapshot | undefined, sourceName: string) => {
    if (!snapshot) {
      return (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="outline">{sourceName}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <Badge variant="default">{sourceName}</Badge>
          <SnapshotDetailsDialog snapshot={snapshot} />
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-xl font-bold">{snapshot.price.toFixed(6)}</p>
          </div>
          {snapshot.reserves && (
            <div>
              <p className="text-xs text-muted-foreground">Reserves</p>
              <p className="font-mono text-xs">
                {snapshot.reserves[0].toFixed(2)} / {snapshot.reserves[1].toFixed(2)}
              </p>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{formatTimestamp(snapshot.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">
              {pair.baseSymbol}/{pair.quoteSymbol}
            </CardTitle>
            <CardDescription>Pool: {pair.poolId}</CardDescription>
          </div>
          <Badge variant="outline">{dexName}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {renderSnapshotCard(binanceSnapshot, 'Binance')}
          {renderSnapshotCard(icpSwapSnapshot, 'ICPSwap')}
          {renderSnapshotCard(kongSwapSnapshot, 'KongSwap')}
        </div>
      </CardContent>
    </Card>
  );
}
