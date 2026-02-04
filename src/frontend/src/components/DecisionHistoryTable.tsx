import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye } from 'lucide-react';
import type { DecisionEvent } from '../backend';

interface DecisionHistoryTableProps {
  history: DecisionEvent[];
  isLoading: boolean;
}

export default function DecisionHistoryTable({ history, isLoading }: DecisionHistoryTableProps) {
  const [filterStep, setFilterStep] = useState<string>('all');

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

  // Extract unique steps for filter
  const uniqueSteps = Array.from(new Set(history.map((e) => e.step)));

  // Filter history
  const filteredHistory = filterStep === 'all' ? history : history.filter((e) => e.step === filterStep);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Filter by step:</label>
        <Select value={filterStep} onValueChange={setFilterStep}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Steps</SelectItem>
            {uniqueSteps.map((step) => (
              <SelectItem key={step} value={step}>
                {step}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
            {filteredHistory.map((event, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-mono text-xs">{formatTimestamp(event.timestamp)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{event.step}</Badge>
                </TableCell>
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
                    <DialogContent className="max-w-2xl">
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
                          <Badge variant="outline">{event.step}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Result</p>
                          <Badge variant={getResultBadgeVariant(event.result)}>{event.result}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Details</p>
                          <div className="mt-2 rounded-md border border-border bg-muted/50 p-3">
                            <pre className="whitespace-pre-wrap font-mono text-xs">{event.details}</pre>
                          </div>
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
    </div>
  );
}
