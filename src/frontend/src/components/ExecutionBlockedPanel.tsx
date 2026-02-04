import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function ExecutionBlockedPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Not Implemented</CardTitle>
        <CardDescription>Required DEX integration details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Integration Required</AlertTitle>
          <AlertDescription>
            Trade execution is not yet implemented. The following DEX integration details are required:
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <h4 className="mb-2 font-semibold">ICPSwap Integration</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Swap function signature and canister method name</li>
              <li>Required parameters: token addresses, amounts, slippage tolerance</li>
              <li>Authentication and approval flow</li>
              <li>Transaction confirmation and error handling</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <h4 className="mb-2 font-semibold">KongSwap Integration</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Swap function signature and canister method name</li>
              <li>Required parameters: pool ID, token pair, amounts</li>
              <li>Authentication and approval flow</li>
              <li>Transaction confirmation and error handling</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <h4 className="mb-2 font-semibold">General Requirements</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Token approval mechanisms for both DEXes</li>
              <li>Gas/cycle estimation and management</li>
              <li>Transaction status monitoring</li>
              <li>Rollback and error recovery strategies</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
