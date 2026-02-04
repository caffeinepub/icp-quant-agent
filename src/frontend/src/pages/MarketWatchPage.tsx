import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useGetDEXConfigs } from '../hooks/useQueries';
import AutoRefreshControl from '../components/AutoRefreshControl';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MarketWatchPage() {
  const { data: configs, isLoading, refetch } = useGetDEXConfigs();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

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
          <p className="text-muted-foreground">Real-time DEX price monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <AutoRefreshControl enabled={autoRefresh} onToggle={setAutoRefresh} onRefresh={handleManualRefresh} />
          <Button onClick={handleManualRefresh} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

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
              <Card key={`${config.id}-${idx}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {pair.baseSymbol}/{pair.quoteSymbol}
                      </CardTitle>
                      <CardDescription>Pool: {pair.poolId}</CardDescription>
                    </div>
                    <Badge variant="outline">{config.name}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-2xl font-bold">--</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Awaiting data</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Reserves</p>
                      <p className="text-lg font-semibold">--</p>
                      <p className="text-xs text-muted-foreground">Liquidity data unavailable</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="text-lg font-semibold">--</p>
                      <p className="text-xs text-muted-foreground">No snapshots recorded</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
