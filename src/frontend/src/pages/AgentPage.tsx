import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square } from 'lucide-react';
import { useGetDecisionHistory, useStartAgent, useStopAgent, useGetLatencyMetrics } from '../hooks/useQueries';
import DecisionHistoryTable from '../components/DecisionHistoryTable';
import LatencySignalsPanel from '../components/LatencySignalsPanel';
import PipelineStatusPanel from '../components/PipelineStatusPanel';
import SensoryCortexPanel from '../components/SensoryCortexPanel';
import LiveDataSourceControl from '../components/LiveDataSourceControl';
import { toast } from 'sonner';

export default function AgentPage() {
  const { data: history, isLoading, refetch } = useGetDecisionHistory();
  const { data: latencyMetrics } = useGetLatencyMetrics();
  const startAgent = useStartAgent();
  const stopAgent = useStopAgent();
  const [isRunning, setIsRunning] = useState(false);

  const handleStart = async () => {
    try {
      await startAgent.mutateAsync();
      setIsRunning(true);
      toast.success('Agent started - Version 10 pipeline activated with smart start logic');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start agent');
    }
  };

  const handleStop = async () => {
    try {
      await stopAgent.mutateAsync();
      setIsRunning(false);
      toast.success('Agent stopped - Sensory Cortex polling halted');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to stop agent');
    }
  };

  const latestDecision = history && history.length > 0 ? history[history.length - 1] : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Control</h2>
          <p className="text-muted-foreground">Executive Engine: Autonomous decision pipeline (dry-run)</p>
        </div>
        <Badge variant={isRunning ? 'default' : 'secondary'} className="text-sm">
          {isRunning ? 'Running' : 'Stopped'}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Decision Loop</CardTitle>
            <CardDescription>Start or stop the autonomous agent decision loop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button onClick={handleStart} disabled={isRunning || startAgent.isPending}>
                <Play className="mr-2 h-4 w-4" />
                {startAgent.isPending ? 'Starting...' : 'Start Agent'}
              </Button>
              <Button onClick={handleStop} disabled={!isRunning || stopAgent.isPending} variant="outline">
                <Square className="mr-2 h-4 w-4" />
                {stopAgent.isPending ? 'Stopping...' : 'Stop Agent'}
              </Button>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Version 10:</strong> Smart Start logic activates based on environment. On Mainnet, forces Live Data Source ON and starts the 10s timer. On Dev, respects current toggle state but ensures timer is running.
              </p>
            </div>
          </CardContent>
        </Card>

        <PipelineStatusPanel
          isRunning={isRunning}
          latestDecision={latestDecision}
          latencyMetrics={latencyMetrics || []}
        />
      </div>

      <LiveDataSourceControl />

      <SensoryCortexPanel isRunning={isRunning} />

      <LatencySignalsPanel metrics={latencyMetrics || []} />

      <Card>
        <CardHeader>
          <CardTitle>Decision History</CardTitle>
          <CardDescription>
            Complete agent decision log including sandbox simulations and scheduling steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DecisionHistoryTable history={history || []} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
