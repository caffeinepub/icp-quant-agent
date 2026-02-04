import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { DecisionEvent } from '../backend';

interface DecisionHistoryTableProps {
  history: DecisionEvent[];
  isLoading: boolean;
}

export default function DecisionHistoryTable({ history, isLoading }: DecisionHistoryTableProps) {
  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading decision history...</div>;
  }

  if (history.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No decisions recorded yet</div>;
  }

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const getResultBadgeVariant = (result: string) => {
    if (result.toLowerCase().includes('actionable')) return 'default';
    if (result.toLowerCase().includes('started')) return 'default';
    if (result.toLowerCase().includes('stopped')) return 'secondary';
    return 'outline';
  };

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Step</TableHead>
            <TableHead>Result</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((event, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-mono text-xs">{formatTimestamp(event.timestamp)}</TableCell>
              <TableCell>{event.step}</TableCell>
              <TableCell>
                <Badge variant={getResultBadgeVariant(event.result)}>{event.result}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Decision Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Timestamp</p>
                        <p className="font-mono text-sm">{formatTimestamp(event.timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Step</p>
                        <p className="text-sm">{event.step}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Result</p>
                        <Badge variant={getResultBadgeVariant(event.result)}>{event.result}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Details</p>
                        <p className="text-sm">{event.details}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
