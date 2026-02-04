import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { PriceSnapshot } from '../backend';

interface SnapshotDetailsDialogProps {
  snapshot: PriceSnapshot;
}

export default function SnapshotDetailsDialog({ snapshot }: SnapshotDetailsDialogProps) {
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(snapshot.rawResponse);
    toast.success('Raw response copied to clipboard');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Snapshot Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Source</p>
              <Badge variant="outline">{snapshot.dexName}</Badge>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Pair ID</p>
              <p className="font-mono text-sm">{snapshot.pairId}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Price</p>
              <p className="text-lg font-bold">{snapshot.price.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Timestamp</p>
              <p className="font-mono text-xs">{formatTimestamp(snapshot.timestamp)}</p>
            </div>
          </div>
          {snapshot.reserves && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Reserves</p>
              <p className="font-mono text-sm">
                Base: {snapshot.reserves[0].toFixed(2)} / Quote: {snapshot.reserves[1].toFixed(2)}
              </p>
            </div>
          )}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">Raw Response</p>
              <Button variant="ghost" size="sm" onClick={handleCopyRaw}>
                <Copy className="mr-2 h-3 w-3" />
                Copy
              </Button>
            </div>
            <ScrollArea className="h-48 rounded-md border border-border bg-muted/50 p-3">
              <pre className="font-mono text-xs">{snapshot.rawResponse || 'No raw response data'}</pre>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
