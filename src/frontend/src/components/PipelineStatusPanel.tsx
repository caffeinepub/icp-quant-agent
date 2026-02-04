import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { DecisionEvent, LatencyMetric } from '../backend';

interface PipelineStatusPanelProps {
  isRunning: boolean;
  latestDecision?: DecisionEvent;
  latencyMetrics: LatencyMetric[];
}

export default function PipelineStatusPanel({ isRunning, latestDecision, latencyMetrics }: PipelineStatusPanelProps) {
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString();
  };

  const getStepStatus = (stepName: string) => {
    if (!latestDecision) return 'pending';
    if (latestDecision.step.toLowerCase().includes(stepName.toLowerCase())) {
      return 'active';
    }
    return 'pending';
  };

  const steps = [
    { name: 'Sense', description: 'Multi-source data collection', key: 'sense' },
    { name: 'Analyze Routes', description: 'Arbitrage path computation', key: 'analysis' },
    { name: 'Risk Sandbox', description: 'Pre-execution simulation', key: 'sandbox' },
    { name: 'Schedule', description: 'Optimal timing calculation', key: 'schedule' },
  ];

  const renderStepIcon = (status: string) => {
    if (status === 'active') {
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    }
    if (status === 'pending') {
      return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
    return <Clock className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>HCQ Pipeline Status</CardTitle>
            <CardDescription>Sensory Cortex → Executive Engine (dry-run)</CardDescription>
          </div>
          <Badge variant={isRunning ? 'default' : 'secondary'}>{isRunning ? 'Running' : 'Stopped'}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const status = getStepStatus(step.key);
            return (
              <div key={step.key} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  {renderStepIcon(status)}
                  {idx < steps.length - 1 && <div className="my-1 h-8 w-px bg-border" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{step.name}</p>
                    {status === 'active' && latestDecision && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatTimestamp(latestDecision.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        {latencyMetrics.length > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-xs font-semibold text-muted-foreground">Last Latency Summary</p>
            <p className="font-mono text-sm">
              {latencyMetrics.length} metrics recorded, avg:{' '}
              {(
                latencyMetrics.reduce((sum, m) => sum + Number(m.durationNs), 0) /
                latencyMetrics.length /
                1_000_000
              ).toFixed(2)}
              ms
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
