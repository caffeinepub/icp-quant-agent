import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Activity } from 'lucide-react';
import { useGetSignalDetectionEvents } from '../hooks/useQueries';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LiveDetectionsPanel() {
  const { data: events = [], isLoading, error } = useGetSignalDetectionEvents();

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Live Detections
            </CardTitle>
            <CardDescription>Latest 20 signal detection events with risk assessment</CardDescription>
          </div>
          {events.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load signal detection events</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Loading live detections...
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-12">
            <Activity className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No signal detections yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Events will appear here when price deviations exceed the 0.5% threshold
            </p>
          </div>
        )}

        {!isLoading && !error && events.length > 0 && (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead className="text-right">Fluctuation %</TableHead>
                  <TableHead className="text-right">Max Safe Order Size</TableHead>
                  <TableHead className="text-center">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event, index) => (
                  <TableRow key={`${event.timestamp}-${index}`}>
                    <TableCell className="font-mono text-xs">{formatTimestamp(event.timestamp)}</TableCell>
                    <TableCell className="font-medium">{event.pairId}</TableCell>
                    <TableCell
                      className={`text-right font-mono ${
                        event.priceDelta > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {formatPercent(event.priceDelta)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatUSD(event.safeOrderSize)}</TableCell>
                    <TableCell className="text-center">
                      {event.highRisk ? (
                        <Badge variant="destructive" className="text-xs">
                          Red-Risk
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
                          Safe
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && !error && events.length > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Risk Classification:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                  Red-Risk
                </Badge>
                <span>TVL &lt; $50k or &gt;5 signals/hour for this pool/pair</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-4 px-1.5 text-[10px] text-green-600 dark:text-green-400">
                  Safe
                </Badge>
                <span>Adequate liquidity and normal signal frequency</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
