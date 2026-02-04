import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Info, Database } from 'lucide-react';
import { useGetSafeOptimizerDataset } from '../hooks/useQueries';

export default function OptimizerPanel() {
  const { data: safeDataset = [], isLoading } = useGetSafeOptimizerDataset();

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMostRecentTimestamp = () => {
    if (safeDataset.length === 0) return 'N/A';
    const sorted = [...safeDataset].sort((a, b) => Number(b.timestamp - a.timestamp));
    return formatTimestamp(sorted[0].timestamp);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>On-Chain Optimizer</CardTitle>
        <CardDescription>Automated parameter tuning based on backtest results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The optimizer runs on-chain heuristics (no external ML/LLM) to propose improved parameter versions based on
            historical performance. High-Risk signals are excluded from the training dataset.
          </AlertDescription>
        </Alert>

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Safe Optimizer Dataset</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {isLoading ? 'Loading...' : `${safeDataset.length} events`}
            </Badge>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Total safe signals:</span>
              <span className="font-mono font-medium text-foreground">{safeDataset.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Most recent:</span>
              <span className="font-mono font-medium text-foreground">{getMostRecentTimestamp()}</span>
            </div>
            <div className="mt-3 rounded border border-dashed border-border bg-background p-2">
              <p className="text-[10px] font-medium text-muted-foreground">
                ✓ High-Risk signals (TVL &lt; $50k or &gt;5 signals/hour) are automatically excluded
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Optimization Strategy</label>
            <p className="text-sm text-muted-foreground">
              Simple genetic algorithm or grid search within safe parameter bounds
            </p>
          </div>

          <Button disabled className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Run Optimization Pass (Coming Soon)
          </Button>
        </div>

        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
          <p className="mb-2 text-sm font-semibold">Optimization Output:</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Proposed parameter version</li>
            <li>Expected performance improvement</li>
            <li>Reasoning based on backtest metrics</li>
            <li>Risk assessment and confidence score</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Last Optimization Run</p>
            <Badge variant="outline">No runs yet</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Optimization results will appear here after the first successful run
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
