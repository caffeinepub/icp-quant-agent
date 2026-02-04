export function validateCanisterId(canisterId: string): { valid: boolean; error?: string } {
  if (!canisterId || canisterId.trim().length === 0) {
    return { valid: false, error: 'Canister ID cannot be empty' };
  }

  // Basic validation: should contain alphanumeric characters and hyphens
  const canisterIdPattern = /^[a-z0-9-]+$/i;
  if (!canisterIdPattern.test(canisterId.trim())) {
    return { valid: false, error: 'Canister ID contains invalid characters' };
  }

  return { valid: true };
}

export function validatePairConfig(config: {
  baseSymbol: string;
  quoteSymbol: string;
  poolId: string;
  feeBps: string;
}): { valid: boolean; error?: string } {
  if (!config.baseSymbol || config.baseSymbol.trim().length === 0) {
    return { valid: false, error: 'Base symbol is required' };
  }

  if (!config.quoteSymbol || config.quoteSymbol.trim().length === 0) {
    return { valid: false, error: 'Quote symbol is required' };
  }

  if (!config.poolId || config.poolId.trim().length === 0) {
    return { valid: false, error: 'Pool ID is required' };
  }

  const feeBps = parseInt(config.feeBps);
  if (isNaN(feeBps) || feeBps < 0) {
    return { valid: false, error: 'Fee must be a non-negative number' };
  }

  return { valid: true };
}
