import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, CheckCircle2, RotateCcw, Info } from 'lucide-react';

export default function StrategyParametersPanel() {
  // Mock data for demonstration
  const mockVersions = [
    { id: 1, name: 'Conservative v1', active: true, created: '2026-02-04 10:30' },
    { id: 2, name: 'Aggressive v1', active: false, created: '2026-02-03 15:20' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Parameter Versions</CardTitle>
        <CardDescription>Manage and version strategy configurations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Strategy versioning allows you to save, activate, and rollback parameter configurations. Backend API
            integration pending.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create New Version (Coming Soon)
          </Button>
        </div>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockVersions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell className="font-medium">{version.name}</TableCell>
                  <TableCell className="font-mono text-xs">{version.created}</TableCell>
                  <TableCell>
                    {version.active ? (
                      <Badge variant="default">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
          <p className="mb-2 text-sm font-semibold">Parameter Categories:</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Slippage tolerance thresholds</li>
            <li>Minimum profit triggers</li>
            <li>Fee assumptions and buffers</li>
            <li>Polling interval bounds</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
