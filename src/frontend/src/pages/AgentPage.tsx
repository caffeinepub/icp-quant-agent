import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square } from 'lucide-react';
import { useGetDecisionHistory, useStartAgent, useStopAgent } from '../hooks/useQueries';
import DecisionHistoryTable from '../components/DecisionHistoryTable';
import { toast } from 'sonner';

export default function AgentPage() {
  const { data: history, isLoading, refetch } = useGetDecisionHistory();
  const startAgent = useStartAgent();
  const stopAgent = useStopAgent();
  const [isRunning, setIsRunning] = useState(false);

  const handleStart = async () => {
    try {
      await startAgent.mutateAsync();
      setIsRunning(true);
      toast.success('Agent started successfully');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start agent');
    }
  };

  const handleStop = async () => {
    try {
      await stopAgent.mutateAsync();
      setIsRunning(false);
      toast.success('Agent stopped successfully');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to stop agent');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Control</h2>
          <p className="text-muted-foreground">Autonomous decision loop management</p>
        </div>
        <Badge variant={isRunning ? 'default' : 'secondary'} className="text-sm">
          {isRunning ? 'Running' : 'Stopped'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Decision Loop</CardTitle>
          <CardDescription>Start or stop the autonomous agent decision loop (dry-run mode)</CardDescription>
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
              <strong>Note:</strong> The agent operates in dry-run mode by default. It will analyze market conditions
              and record decisions without executing trades.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decision History</CardTitle>
          <CardDescription>View all agent decisions and analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          <DecisionHistoryTable history={history || []} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
