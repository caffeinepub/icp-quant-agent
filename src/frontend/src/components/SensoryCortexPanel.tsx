import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { useGetAllPoolPrices, useAddPricePoint } from '../hooks/useQueries';
import type { PricePoint } from '../backend';

interface SensoryCortexPanelProps {
  isRunning: boolean;
}

export default function SensoryCortexPanel({ isRunning }: SensoryCortexPanelProps) {
  const { data: pricePoints, refetch } = useGetAllPoolPrices();
  const addPricePoint = useAddPricePoint();
  const [deltaSpread, setDeltaSpread] = useState<number>(0);
  const [volatility, setVolatility] = useState<number>(0);
  const [isArbitrageViable, setIsArbitrageViable] = useState<boolean>(false);
  const [icpSwapPrice, setIcpSwapPrice] = useState<number>(0);
  const [kongSwapPrice, setKongSwapPrice] = useState<number>(0);

  // Simulate DEX price fetching (in production, these would be real inter-canister calls)
  const simulateDEXPrices = () => {
    // Mock ICPSwap price (ICP/ckBTC)
    const basePrice = 0.00025;
    const icpPrice = basePrice + (Math.random() - 0.5) * 0.00001;
    
    // Mock KongSwap price with potential spread
    const spreadVariation = (Math.random() - 0.5) * 0.015; // -0.75% to +0.75%
    const kongPrice = icpPrice * (1 + spreadVariation);
    
    return { icpPrice, kongPrice };
  };

  // Calculate volatility from price points
  const calculateVolatility = (points: PricePoint[]): number => {
    if (points.length < 2) return 0;
    
    const prices = points.map(p => p.price);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    // Return as percentage of mean
    return (stdDev / mean) * 100;
  };

  // Polling effect - runs every 2 seconds when agent is running
  useEffect(() => {
    if (!isRunning) return;

    const pollInterval = setInterval(async () => {
      try {
        // Simulate fetching prices from ICPSwap and KongSwap
        const { icpPrice, kongPrice } = simulateDEXPrices();
        
        setIcpSwapPrice(icpPrice);
        setKongSwapPrice(kongPrice);
        
        // Calculate Delta-Spread
        const spread = ((kongPrice - icpPrice) / icpPrice) * 100;
        setDeltaSpread(spread);
        
        // Store average price in buffer
        const avgPrice = (icpPrice + kongPrice) / 2;
        await addPricePoint.mutateAsync(avgPrice);
        
        // Refetch all prices to get updated buffer
        const result = await refetch();
        const points = result.data || [];
        
        // Calculate volatility from last 10 points
        const vol = calculateVolatility(points);
        setVolatility(vol);
        
        // Determine if arbitrage is viable (spread > 0.8%)
        const viable = Math.abs(spread) > 0.8;
        setIsArbitrageViable(viable);
        
      } catch (error) {
        console.error('Error polling DEX prices:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [isRunning, addPricePoint, refetch]);

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString();
  };

  const formatPrice = (price: number) => {
    return price.toFixed(8);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Sensory Cortex Monitor
            </CardTitle>
            <CardDescription>ICP/ckBTC price monitoring across ICPSwap and KongSwap</CardDescription>
          </div>
          <Badge variant={isRunning ? 'default' : 'secondary'}>
            {isRunning ? 'Polling (2s)' : 'Idle'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isRunning && (
          <Alert>
            <AlertDescription>
              Start the agent to begin monitoring DEX prices and calculating arbitrage signals.
            </AlertDescription>
          </Alert>
        )}

        {isRunning && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">ICPSwap Price</p>
                  <Badge variant="outline">DEX 1</Badge>
                </div>
                <p className="mt-2 font-mono text-2xl font-bold">{formatPrice(icpSwapPrice)}</p>
                <p className="text-xs text-muted-foreground">ICP/ckBTC</p>
              </div>

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">KongSwap Price</p>
                  <Badge variant="outline">DEX 2</Badge>
                </div>
                <p className="mt-2 font-mono text-2xl font-bold">{formatPrice(kongSwapPrice)}</p>
                <p className="text-xs text-muted-foreground">ICP/ckBTC</p>
              </div>
            </div>

            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <p className="font-semibold">Delta-Spread</p>
                </div>
                <Badge variant={Math.abs(deltaSpread) > 0.8 ? 'default' : 'secondary'}>
                  {deltaSpread >= 0 ? '+' : ''}{deltaSpread.toFixed(3)}%
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Spread between KongSwap and ICPSwap (threshold: 0.8%)
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground">Short-term Volatility</p>
                <p className="mt-2 font-mono text-xl font-bold">{volatility.toFixed(4)}%</p>
                <p className="text-xs text-muted-foreground">Calculated from last {pricePoints?.length || 0}/10 points</p>
              </div>

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Arbitrage Signal</p>
                  {isArbitrageViable && <AlertTriangle className="h-4 w-4 text-warning" />}
                </div>
                <p className="mt-2 font-mono text-xl font-bold">
                  {isArbitrageViable ? 'VIABLE' : 'NO SIGNAL'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isArbitrageViable 
                    ? 'Spread exceeds 0.8% threshold (0.3% fees × 2 + margin)'
                    : 'Spread below threshold for profitable arbitrage'}
                </p>
              </div>
            </div>

            {pricePoints && pricePoints.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="mb-3 text-sm font-semibold">Price Buffer (Last 10 Points)</p>
                <div className="space-y-2">
                  {pricePoints.slice(-10).reverse().map((point, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-muted-foreground">
                        {formatTimestamp(point.timestamp)}
                      </span>
                      <span className="font-mono font-medium">{formatPrice(point.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
