import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock } from 'lucide-react';
import ExecutionBlockedPanel from '../components/ExecutionBlockedPanel';

export default function ExecutionPage() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Execution</h2>
        <p className="text-muted-foreground">Trade execution controls (disabled by default)</p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning: Execution Mode</AlertTitle>
        <AlertDescription>
          Enabling execution mode will allow the agent to submit real trades to DEXes. This feature is disabled by
          default and requires explicit acknowledgement.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Execution Acknowledgement
          </CardTitle>
          <CardDescription>You must acknowledge the risks before enabling execution mode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox id="acknowledge" checked={acknowledged} onCheckedChange={(checked) => setAcknowledged(!!checked)} />
            <label htmlFor="acknowledge" className="cursor-pointer text-sm leading-relaxed">
              I understand that enabling execution mode will allow the agent to submit real trades using configured DEX
              endpoints. I acknowledge the risks including potential loss of funds due to market volatility, smart
              contract bugs, or incorrect configuration.
            </label>
          </div>
          <Button disabled={!acknowledged} variant={acknowledged ? 'default' : 'secondary'}>
            Enable Execution Mode
          </Button>
        </CardContent>
      </Card>

      {acknowledged && <ExecutionBlockedPanel />}
    </div>
  );
}
