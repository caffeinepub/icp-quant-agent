import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DEXConfig, PairConfig, DecisionEvent, PriceSnapshot, LatencyMetric, PricePoint, DEXConfigIdentifiers, SignalDetectionEvent, ShadowExecutionMetrics, TradeLogEntry } from '../backend';
import { notificationCenter, WARNING_IDS } from '../lib/notificationCenter';

// Local type definitions for Version 10 (until backend implements and generates these)
export interface SystemStatus {
  isMainnet: boolean;
  liveSourceEnabled: boolean;
  timerRunning: boolean;
  systemReady: boolean;
  lastUpdateId: bigint;
}

export interface StartAgentResult {
  success: boolean;
  timerStarted: boolean;
  errorMessage?: string;
}

// Local type definition for Live Data Source status (until backend implements it)
export interface LiveDataSourceStatus {
  enabled: boolean;
  timerRunning: boolean;
  statusMessage: string;
}

export function useGetDEXConfigs() {
  const { actor, isFetching } = useActor();

  return useQuery<DEXConfig[]>({
    queryKey: ['dexConfigs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSortedDEXConfigs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDEXConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      canisterId,
      tradingPairs,
    }: {
      name: string;
      canisterId: string;
      tradingPairs: PairConfig[];
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addDEXConfig(name, canisterId, tradingPairs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dexConfigs'] });
    },
  });
}

export function useUpdateTradingPairs() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dexId, tradingPairs }: { dexId: bigint; tradingPairs: PairConfig[] }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateTradingPairs(dexId, tradingPairs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dexConfigs'] });
    },
  });
}

export function useSetDEXConfigStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dexId, isActive }: { dexId: bigint; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.setDEXConfigStatus(dexId, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dexConfigs'] });
    },
  });
}

export function useGetDexConfigIdentifiers() {
  const { actor, isFetching } = useActor();

  return useQuery<DEXConfigIdentifiers>({
    queryKey: ['dexConfigIdentifiers'],
    queryFn: async () => {
      if (!actor) return { icpSwapCanisterId: undefined, kongSwapCanisterId: undefined };
      return actor.getDexConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetDexConfigIdentifiers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: DEXConfigIdentifiers) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.setDexConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dexConfigIdentifiers'] });
    },
  });
}

export function useGetDecisionHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<DecisionEvent[]>({
    queryKey: ['decisionHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDecisionHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStartAgent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      
      // Check if Version 10 method exists
      if ('startAgentV10' in actor && typeof (actor as any).startAgentV10 === 'function') {
        const result: StartAgentResult = await (actor as any).startAgentV10();
        
        // Handle timer start failure
        if (!result.success || !result.timerStarted) {
          notificationCenter.addWarning(
            WARNING_IDS.CANISTER_TIMEOUT,
            'Canister Timeout',
            true
          );
          if (result.errorMessage) {
            throw new Error(result.errorMessage);
          }
        } else {
          // Clear any existing timeout warnings on success
          notificationCenter.removeWarning(WARNING_IDS.CANISTER_TIMEOUT);
        }
        
        return result;
      }
      
      // Fallback to old method
      return actor.startAgent();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisionHistory'] });
      queryClient.invalidateQueries({ queryKey: ['systemStatus'] });
      queryClient.invalidateQueries({ queryKey: ['lastUpdateId'] });
    },
    onError: () => {
      // Add persistent warning on any error
      notificationCenter.addWarning(
        WARNING_IDS.CANISTER_TIMEOUT,
        'Canister Timeout',
        true
      );
    },
  });
}

export function useStopAgent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.stopAgent();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisionHistory'] });
      queryClient.invalidateQueries({ queryKey: ['systemStatus'] });
    },
  });
}

export function useRecordSnapshot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (snapshot: PriceSnapshot) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.recordPriceSnapshot(snapshot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snapshots'] });
    },
  });
}

export function useGetLatencyMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery<LatencyMetric[]>({
    queryKey: ['latencyMetrics'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLatencyMetrics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFetchBinancePrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.fetchUSDTPriceFromBinance();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latencyMetrics'] });
    },
  });
}

export function useGetPoolPrice() {
  const { actor, isFetching } = useActor();

  return useQuery<PricePoint | null>({
    queryKey: ['poolPrice'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPoolPrice();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPoolPrices() {
  const { actor, isFetching } = useActor();

  return useQuery<PricePoint[]>({
    queryKey: ['allPoolPrices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPoolPrices();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 2000,
  });
}

export function useAddPricePoint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (price: number) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addPricePoint(price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poolPrice'] });
      queryClient.invalidateQueries({ queryKey: ['allPoolPrices'] });
    },
  });
}

// Version 10: System Status hook (polls every 10 seconds)
export function useGetSystemStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<SystemStatus>({
    queryKey: ['systemStatus'],
    queryFn: async () => {
      if (!actor) {
        return {
          isMainnet: false,
          liveSourceEnabled: false,
          timerRunning: false,
          systemReady: false,
          lastUpdateId: BigInt(0),
        };
      }
      
      // Check if Version 10 method exists
      if ('getSystemStatus' in actor && typeof (actor as any).getSystemStatus === 'function') {
        return (actor as any).getSystemStatus();
      }
      
      // Fallback for older backend
      return {
        isMainnet: false,
        liveSourceEnabled: false,
        timerRunning: false,
        systemReady: false,
        lastUpdateId: BigInt(0),
      };
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

// Version 10: Last Update ID hook (polls every 10 seconds for tick sync)
export function useGetLastUpdateId() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['lastUpdateId'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      
      // Check if Version 10 method exists
      if ('getSystemStatus' in actor && typeof (actor as any).getSystemStatus === 'function') {
        const status: SystemStatus = await (actor as any).getSystemStatus();
        return status.lastUpdateId;
      }
      
      return BigInt(0);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Poll every 10 seconds to sync with backend timer
  });
}

// New hook for ckBTC/ICP ratio data (now keyed off lastUpdateId changes)
export function useGetCkBtcIcpRatio() {
  const { actor, isFetching } = useActor();
  const { data: lastUpdateId } = useGetLastUpdateId();

  return useQuery<{
    timestamp: bigint;
    ratio: number;
    avg24h: number;
    reserve0: number;
    reserve1: number;
  } | null>({
    queryKey: ['ckBtcIcpRatio', lastUpdateId?.toString()],
    queryFn: async () => {
      if (!actor) return null;
      // This will call a backend method that fetches from ICPSwap and calculates ratio
      // For now, we'll simulate with existing data
      const poolPrice = await actor.getPoolPrice();
      if (!poolPrice) return null;
      
      // Simulate ratio calculation (in production, backend will fetch real reserves)
      const ratio = poolPrice.price * 27930; // Approximate current ratio
      const avg24h = ratio * 0.99; // Simulate 24h average
      
      return {
        timestamp: poolPrice.timestamp,
        ratio,
        avg24h,
        reserve0: 100.5, // Simulated ckBTC reserve
        reserve1: 2793000, // Simulated ICP reserve
      };
    },
    enabled: !!actor && !isFetching,
  });
}

// Live Data Source hooks (with fallback until backend implements the methods)
export function useGetLiveDataSourceStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<LiveDataSourceStatus>({
    queryKey: ['liveDataSourceStatus'],
    queryFn: async () => {
      if (!actor) {
        return { 
          enabled: false, 
          timerRunning: false, 
          statusMessage: 'Actor not initialized' 
        };
      }
      
      // Check if the method exists on the actor
      if ('getLiveDataSourceStatus' in actor && typeof (actor as any).getLiveDataSourceStatus === 'function') {
        return (actor as any).getLiveDataSourceStatus();
      }
      
      // Fallback response when backend method doesn't exist yet
      return {
        enabled: false,
        timerRunning: false,
        statusMessage: 'Backend Live Data Source API not yet implemented - awaiting deployment'
      };
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000, // Poll every 3 seconds to keep status fresh
  });
}

export function useSetLiveDataSource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // Check if the method exists on the actor
      if ('setLiveDataSource' in actor && typeof (actor as any).setLiveDataSource === 'function') {
        return (actor as any).setLiveDataSource(enabled);
      }
      
      // Throw error if backend method doesn't exist yet
      throw new Error('Backend Live Data Source API not yet implemented - please deploy updated backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveDataSourceStatus'] });
      queryClient.invalidateQueries({ queryKey: ['allPoolPrices'] });
      queryClient.invalidateQueries({ queryKey: ['poolPrice'] });
      queryClient.invalidateQueries({ queryKey: ['systemStatus'] });
    },
  });
}

// Signal Detection Events hooks
export function useGetSignalDetectionEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<SignalDetectionEvent[]>({
    queryKey: ['signalDetectionEvents'],
    queryFn: async () => {
      if (!actor) return [];
      
      // The backend stores all events; we fetch and take the latest 20 on the frontend
      // In a production system, the backend would have a dedicated query for this
      const allEvents = await actor.getSafeOptimizerDataset();
      
      // Sort by timestamp descending and take the latest 20
      const sortedEvents = [...allEvents].sort((a, b) => {
        return Number(b.timestamp - a.timestamp);
      });
      
      return sortedEvents.slice(0, 20);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
}

// Safe Optimizer Dataset hook (excludes High Risk events)
export function useGetSafeOptimizerDataset() {
  const { actor, isFetching } = useActor();

  return useQuery<SignalDetectionEvent[]>({
    queryKey: ['safeOptimizerDataset'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSafeOptimizerDataset();
    },
    enabled: !!actor && !isFetching,
  });
}

// Shadow Execution Metrics hook
export function useGetShadowExecutionMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery<{
    totalOpportunities: number;
    successRate: number;
    avgSpreadCaptured: number;
  }>({
    queryKey: ['shadowExecutionMetrics'],
    queryFn: async () => {
      if (!actor) {
        return {
          totalOpportunities: 0,
          successRate: 0,
          avgSpreadCaptured: 0,
        };
      }
      const metrics = await actor.getShadowExecutionMetrics();
      return {
        totalOpportunities: Number(metrics.totalOpportunities),
        successRate: metrics.successRate,
        avgSpreadCaptured: metrics.avgSpreadCaptured,
      };
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Poll every 10 seconds to match timer evaluation
  });
}

// Shadow Execution Log hook
export function useGetShadowExecutionLog() {
  const { actor, isFetching } = useActor();

  return useQuery<TradeLogEntry[]>({
    queryKey: ['shadowExecutionLog'],
    queryFn: async () => {
      if (!actor) return [];
      const metrics = await actor.getShadowExecutionMetrics();
      // Sort by timestamp descending and take the latest 20 entries
      const sortedLog = [...metrics.shadowExecutionLog].sort((a, b) => {
        return Number(b.timestamp - a.timestamp);
      });
      return sortedLog.slice(0, 20);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Poll every 10 seconds to match timer evaluation
  });
}
