import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DEXConfig, PairConfig, DecisionEvent, PriceSnapshot } from '../backend';

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
      return actor.startAgent();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisionHistory'] });
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
    },
  });
}

export function useRecordSnapshot() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (snapshot: PriceSnapshot) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.recordPriceSnapshot(snapshot);
    },
  });
}
