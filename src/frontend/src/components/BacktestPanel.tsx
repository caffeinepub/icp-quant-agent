import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { useGetShadowExecutionMetrics, useGetShadowExecutionLog } from '@/hooks/useQueries';
import { ShadowTradeStatus } from '@/backend';

export default function BacktestPanel() {
  const { data: metrics, isLoading: metricsLoading } = useGetShadowExecutionMetrics();
  const { data: log, isLoading: logLoading } = useGetShadowExecutionLog();

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getStatusBadge = (status: ShadowTradeStatus) => {
    switch (status) {
      case ShadowTradeStatus.success:
        return <Badge variant="default" className="bg-success text-success-foreground">SUCCESS</Badge>;
      case ShadowTradeStatus.failed:
        return <Badge variant="destructive">FAILED</Badge>;
      case ShadowTradeStatus.timeout:
        return <Badge variant="secondary">TIMEOUT</Badge>;
      case ShadowTradeStatus.active:
        return <Badge variant="outline">ACTIVE</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backtesting Engine</CardTitle>
        <CardDescription>Real-time Shadow Execution performance metrics and trade log</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Expected Metrics Section */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Expected Metrics</p>
          </div>
          
          {metricsLoading ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Loading metrics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Total Opportunities</p>
                <p className="mt-1 text-2xl font-bold">{metrics?.totalOpportunities ?? 0}</p>
              </div>
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-2xl font-bold">
                    {metrics?.successRate ? metrics.successRate.toFixed(1) : '0.0'}%
                  </p>
                  {metrics && metrics.successRate > 50 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Avg Spread Captured</p>
                <p className="mt-1 text-2xl font-bold">
                  {metrics?.avgSpreadCaptured ? metrics.avgSpreadCaptured.toFixed(2) : '0.00'}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Backtesting Engine Log Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Backtesting Engine Log</p>
            <Badge variant="outline" className="ml-auto text-xs">
              Auto-refresh: 10s
            </Badge>
          </div>

          {logLoading ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading trade log...</p>
            </div>
          ) : !log || log.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No shadow trades recorded yet. Safe signals will trigger shadow execution automatically.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Time</TableHead>
                    <TableHead>Pair</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Entry</TableHead>
                    <TableHead className="text-right">Exit</TableHead>
                    <TableHead className="text-right">Return</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">
                        {formatTimestamp(entry.timestamp)}
                      </TableCell>
                      <TableCell className="font-medium">{entry.pairId}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {entry.entryPrice.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {entry.exitPrice ? entry.exitPrice.toFixed(4) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {entry.realizedReturn !== undefined && entry.realizedReturn !== null ? (
                          <span className={entry.realizedReturn >= 0 ? 'text-success' : 'text-destructive'}>
                            {entry.realizedReturn >= 0 ? '+' : ''}
                            {entry.realizedReturn.toFixed(2)}%
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {entry.resolutionReason || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
