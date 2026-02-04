import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import type { LatencyMetric } from '../backend';

interface LatencySignalsPanelProps {
  metrics: LatencyMetric[];
}

export default function LatencySignalsPanel({ metrics }: LatencySignalsPanelProps) {
  const formatDuration = (durationNs: bigint) => {
    const ms = Number(durationNs) / 1_000_000;
    return `${ms.toFixed(2)}ms`;
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString();
  };

  // Calculate derived signals
  const recentMetrics = metrics.slice(-10);
  const avgLatency =
    recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + Number(m.durationNs), 0) / recentMetrics.length / 1_000_000
      : 0;

  const latestMetric = metrics[metrics.length - 1];
  const latestLatency = latestMetric ? Number(latestMetric.durationNs) / 1_000_000 : 0;
  const isSpike = latestLatency > avgLatency * 1.5;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Latency Signals
        </CardTitle>
        <CardDescription>Asynchronous delay monitoring and derived heuristics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Latest Latency</p>
            <p className="text-2xl font-bold">{latestLatency.toFixed(2)}ms</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Rolling Average (10)</p>
            <p className="text-2xl font-bold">{avgLatency.toFixed(2)}ms</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Spike Detection</p>
            <div className="flex items-center gap-2">
              {isSpike ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <Badge variant="destructive">Spike Detected</Badge>
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 text-success" />
                  <Badge variant="outline">Normal</Badge>
                </>
              )}
            </div>
          </div>
        </div>

        {metrics.length === 0 ? (
          <Alert>
            <AlertDescription>No latency metrics recorded yet. Start the agent to begin monitoring.</AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMetrics.reverse().map((metric, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs">{formatTimestamp(metric.timestamp)}</TableCell>
                    <TableCell className="text-sm">{metric.operation}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{metric.stage}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{formatDuration(metric.durationNs)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
