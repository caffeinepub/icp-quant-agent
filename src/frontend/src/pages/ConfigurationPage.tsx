import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, AlertCircle, RotateCcw } from 'lucide-react';
import { useGetDEXConfigs, useAddDEXConfig, useUpdateTradingPairs, useGetDexConfigIdentifiers, useSetDexConfigIdentifiers } from '../hooks/useQueries';
import { validateCanisterId, validatePairConfig } from '../lib/validation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { PairConfig } from '../backend';

const DEFAULT_ICPSWAP_CANISTER = 'xmiu5-jqaaa-aaaag-qbz7q-cai';

export default function ConfigurationPage() {
  const { data: configs, isLoading } = useGetDEXConfigs();
  const { data: dexConfigIds } = useGetDexConfigIdentifiers();
  const addDEXConfig = useAddDEXConfig();
  const updateTradingPairs = useUpdateTradingPairs();
  const setDexConfigIds = useSetDexConfigIdentifiers();

  const [newDEX, setNewDEX] = useState({ name: '', canisterId: '' });
  const [newPair, setNewPair] = useState({
    baseSymbol: '',
    quoteSymbol: '',
    poolId: '',
    feeBps: '30',
  });
  const [error, setError] = useState<string | null>(null);
  const [icpSwapCanisterId, setIcpSwapCanisterId] = useState('');
  const [kongSwapCanisterId, setKongSwapCanisterId] = useState('');

  useEffect(() => {
    if (dexConfigIds) {
      setIcpSwapCanisterId(dexConfigIds.icpSwapCanisterId || '');
      setKongSwapCanisterId(dexConfigIds.kongSwapCanisterId || '');
    }
  }, [dexConfigIds]);

  const handleAddDEX = async () => {
    setError(null);
    const validation = validateCanisterId(newDEX.canisterId);
    if (!validation.valid) {
      setError(validation.error || 'Invalid canister ID');
      return;
    }

    if (!newDEX.name.trim()) {
      setError('DEX name is required');
      return;
    }

    try {
      await addDEXConfig.mutateAsync({
        name: newDEX.name,
        canisterId: newDEX.canisterId,
        tradingPairs: [],
      });
      setNewDEX({ name: '', canisterId: '' });
      toast.success('DEX configuration added successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add DEX configuration');
    }
  };

  const handleSaveDexConfigIds = async () => {
    setError(null);
    
    if (icpSwapCanisterId && !validateCanisterId(icpSwapCanisterId).valid) {
      setError('Invalid ICPSwap canister ID');
      return;
    }
    
    if (kongSwapCanisterId && !validateCanisterId(kongSwapCanisterId).valid) {
      setError('Invalid KongSwap canister ID');
      return;
    }

    try {
      await setDexConfigIds.mutateAsync({
        icpSwapCanisterId: icpSwapCanisterId || undefined,
        kongSwapCanisterId: kongSwapCanisterId || undefined,
      });
      toast.success('DEX canister IDs saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save DEX canister IDs');
    }
  };

  const handleResetToDefault = (field: 'icpswap' | 'kongswap') => {
    if (field === 'icpswap') {
      setIcpSwapCanisterId('');
      toast.info(`ICPSwap will use default: ${DEFAULT_ICPSWAP_CANISTER}`);
    }
  };

  const handleAddPair = async (dexId: bigint, existingPairs: PairConfig[]) => {
    setError(null);
    const validation = validatePairConfig(newPair);
    if (!validation.valid) {
      setError(validation.error || 'Invalid pair configuration');
      return;
    }

    const pairConfig: PairConfig = {
      baseSymbol: newPair.baseSymbol.trim(),
      quoteSymbol: newPair.quoteSymbol.trim(),
      poolId: newPair.poolId.trim(),
      feeBps: BigInt(parseInt(newPair.feeBps)),
    };

    try {
      await updateTradingPairs.mutateAsync({
        dexId,
        tradingPairs: [...existingPairs, pairConfig],
      });
      setNewPair({ baseSymbol: '', quoteSymbol: '', poolId: '', feeBps: '30' });
      toast.success('Trading pair added successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add trading pair');
    }
  };

  const handleRemovePair = async (dexId: bigint, existingPairs: PairConfig[], indexToRemove: number) => {
    try {
      const updatedPairs = existingPairs.filter((_, idx) => idx !== indexToRemove);
      await updateTradingPairs.mutateAsync({
        dexId,
        tradingPairs: updatedPairs,
      });
      toast.success('Trading pair removed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove trading pair');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading configurations...</div>
      </div>
    );
  }

  const effectiveIcpSwapCanister = icpSwapCanisterId || DEFAULT_ICPSWAP_CANISTER;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuration</h2>
        <p className="text-muted-foreground">Manage DEX endpoints and trading pairs</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>DEX Canister IDs</CardTitle>
          <CardDescription>Configure ICPSwap and KongSwap canister IDs for the ckBTC/ICP pool</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="icpswap-canister">ICPSwap Canister ID</Label>
              <div className="flex gap-2">
                <Input
                  id="icpswap-canister"
                  placeholder={`Default: ${DEFAULT_ICPSWAP_CANISTER}`}
                  value={icpSwapCanisterId}
                  onChange={(e) => setIcpSwapCanisterId(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleResetToDefault('icpswap')}
                  title="Use default canister"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Leave blank to use default ckBTC/ICP pool: <span className="font-mono">{DEFAULT_ICPSWAP_CANISTER}</span>
              </p>
              {!icpSwapCanisterId && (
                <Badge variant="secondary" className="text-xs">
                  Using default
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kongswap-canister">KongSwap Canister ID</Label>
              <Input
                id="kongswap-canister"
                placeholder="e.g., bbbbb-bb"
                value={kongSwapCanisterId}
                onChange={(e) => setKongSwapCanisterId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Configure KongSwap pool canister
              </p>
            </div>
          </div>
          <Button onClick={handleSaveDexConfigIds} disabled={setDexConfigIds.isPending} className="mt-4">
            <Save className="mr-2 h-4 w-4" />
            {setDexConfigIds.isPending ? 'Saving...' : 'Save Canister IDs'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New DEX</CardTitle>
          <CardDescription>Configure a new DEX endpoint for monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dex-name">DEX Name</Label>
              <Input
                id="dex-name"
                placeholder="e.g., ICPSwap"
                value={newDEX.name}
                onChange={(e) => setNewDEX({ ...newDEX, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="canister-id">Canister ID</Label>
              <Input
                id="canister-id"
                placeholder="e.g., aaaaa-aa"
                value={newDEX.canisterId}
                onChange={(e) => setNewDEX({ ...newDEX, canisterId: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddDEX} disabled={addDEXConfig.isPending} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            {addDEXConfig.isPending ? 'Adding...' : 'Add DEX'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {configs?.map((config) => (
          <Card key={config.id.toString()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle>{config.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">{config.canisterId}</CardDescription>
                </div>
                <Badge variant={config.canisterId ? 'default' : 'secondary'}>
                  {config.canisterId ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-3 text-sm font-semibold">Trading Pairs</h4>
                {config.tradingPairs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No trading pairs configured</p>
                ) : (
                  <div className="space-y-2">
                    {config.tradingPairs.map((pair, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {pair.baseSymbol}/{pair.quoteSymbol}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Pool: {pair.poolId}</span>
                          <span className="text-xs text-muted-foreground">
                            Fee: {Number(pair.feeBps) / 100}%
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePair(config.id, config.tradingPairs, idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="mb-3 text-sm font-semibold">Add Trading Pair</h4>
                <div className="grid gap-3 md:grid-cols-4">
                  <Input
                    placeholder="Base (e.g., ICP)"
                    value={newPair.baseSymbol}
                    onChange={(e) => setNewPair({ ...newPair, baseSymbol: e.target.value })}
                  />
                  <Input
                    placeholder="Quote (e.g., ckBTC)"
                    value={newPair.quoteSymbol}
                    onChange={(e) => setNewPair({ ...newPair, quoteSymbol: e.target.value })}
                  />
                  <Input
                    placeholder="Pool ID"
                    value={newPair.poolId}
                    onChange={(e) => setNewPair({ ...newPair, poolId: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Fee (bps)"
                    value={newPair.feeBps}
                    onChange={(e) => setNewPair({ ...newPair, feeBps: e.target.value })}
                  />
                </div>
                <Button
                  onClick={() => handleAddPair(config.id, config.tradingPairs)}
                  disabled={updateTradingPairs.isPending}
                  className="mt-3"
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateTradingPairs.isPending ? 'Saving...' : 'Add Pair'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
