import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function SelfImprovementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Self-Improvement</h2>
        <p className="text-muted-foreground">Strategy versioning and backtesting</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Self-improvement features are under development. This module will support strategy parameter versioning and
          backtesting over recorded decision history.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Versions</CardTitle>
            <CardDescription>Save and manage strategy parameter sets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Store named strategy configurations with versioning to track parameter evolution over time.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backtesting</CardTitle>
            <CardDescription>Evaluate strategies against historical data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Run simulations using stored decision history to evaluate strategy performance and optimize parameters.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planned Features</CardTitle>
          <CardDescription>Roadmap for self-improvement capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Parameter optimization based on historical performance</li>
            <li>Strategy comparison and A/B testing</li>
            <li>Performance metrics and visualization</li>
            <li>Automated parameter tuning within safe bounds</li>
            <li>Learning from successful and failed decisions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
