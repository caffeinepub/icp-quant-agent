import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database } from 'lucide-react';
import { useGetDEXConfigs, useFetchBinancePrice, useRecordSnapshot } from '../hooks/useQueries';
import AutoRefreshControl from '../components/AutoRefreshControl';
import MarketSnapshotGrid from '../components/MarketSnapshotGrid';
import CkBtcIcpRatioWidget from '../components/CkBtcIcpRatioWidget';
import SystemReadyIndicator from '../components/SystemReadyIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { PriceSnapshot } from '../backend';

export default function MarketWatchPage() {
  const { data: configs, isLoading, refetch } = useGetDEXConfigs();
  const fetchBinance = useFetchBinancePrice();
  const recordSnapshot = useRecordSnapshot();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [snapshots, setSnapshots] = useState<PriceSnapshot[]>([]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      
      // Fetch Binance price and create snapshot
      const binancePrice = await fetchBinance.mutateAsync();
      const binanceSnapshot: PriceSnapshot = {
        timestamp: BigInt(Date.now() * 1_000_000),
        dexName: 'Binance',
        pairId: 'ICP/ckBTC',
        price: binancePrice,
        reserves: undefined,
        rawResponse: JSON.stringify({ symbol: 'ICPUSDT', price: binancePrice }),
      };
      
      // Record to backend and update local state
      await recordSnapshot.mutateAsync(binanceSnapshot);
      setSnapshots(prev => {
        const filtered = prev.filter(s => !(s.dexName === 'Binance' && s.pairId === 'ICP/ckBTC'));
        return [...filtered, binanceSnapshot];
      });
      
      toast.success('Market data refreshed');
    } catch (err) {
      toast.error('Failed to refresh market data');
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    if (autoRefresh) {
      handleManualRefresh();
    }
  }, [autoRefresh]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading market data...</div>
      </div>
    );
  }

  const hasPairs = configs?.some((config) => config.tradingPairs.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Market Watch</h2>
          <p className="text-muted-foreground">Sensory Cortex: Multi-source price monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <SystemReadyIndicator />
          <AutoRefreshControl enabled={autoRefresh} onToggle={setAutoRefresh} onRefresh={handleManualRefresh} />
          <Button onClick={handleManualRefresh} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Real-time snapshots from Binance (HTTPS outcalls), ICPSwap, and KongSwap. Each source is monitored
          independently with raw response debugging available.
        </AlertDescription>
      </Alert>

      {/* New ckBTC/ICP Ratio Widget */}
      <CkBtcIcpRatioWidget />

      {!hasPairs ? (
        <Alert>
          <AlertDescription>
            No trading pairs configured. Please add DEX configurations and trading pairs in the Configuration page.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {configs?.map((config) =>
            config.tradingPairs.map((pair, idx) => (
              <MarketSnapshotGrid
                key={`${config.id}-${idx}`}
                pair={pair}
                dexName={config.name}
                snapshots={snapshots}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
