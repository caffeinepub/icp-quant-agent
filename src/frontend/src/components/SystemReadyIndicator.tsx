import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, ShieldAlert } from 'lucide-react';
import { useGetSystemStatus } from '../hooks/useQueries';

export default function SystemReadyIndicator() {
  const { data: status, isLoading } = useGetSystemStatus();

  if (isLoading || !status) {
    return (
      <Badge variant="outline" className="gap-2">
        <Shield className="h-4 w-4 animate-pulse" />
        Checking...
      </Badge>
    );
  }

  const { systemReady, isMainnet, liveSourceEnabled, timerRunning } = status;

  // Build tooltip message explaining missing conditions
  const getMissingConditions = (): string[] => {
    const missing: string[] = [];
    if (!isMainnet) missing.push('Not running on IC Mainnet');
    if (!liveSourceEnabled) missing.push('Live Data Source is disabled');
    if (!timerRunning) missing.push('10s Timer is not running');
    return missing;
  };

  const missingConditions = getMissingConditions();

  if (systemReady) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="default" className="gap-2 bg-green-500 hover:bg-green-600">
              <Shield className="h-4 w-4" />
              System Ready
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">All conditions met:</p>
              <ul className="text-xs">
                <li>✓ Running on IC Mainnet</li>
                <li>✓ Live Data Source enabled</li>
                <li>✓ 10s Timer running</li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-2 border-warning text-warning">
            <ShieldAlert className="h-4 w-4" />
            Not Ready
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">Missing conditions:</p>
            <ul className="text-xs">
              {missingConditions.map((condition, idx) => (
                <li key={idx}>✗ {condition}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
