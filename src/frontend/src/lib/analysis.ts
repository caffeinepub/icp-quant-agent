export interface AnalysisParams {
  feePercent: number;
  slippagePercent: number;
  minProfitPercent: number;
}

export interface SpreadAnalysis {
  spreadPercent: number;
  netProfitPercent: number;
  signal: 'No Signal' | 'Watch' | 'Actionable';
  reasoning: string;
  hasLiquidityData: boolean;
}

export function analyzeSpread(
  price1: number,
  price2: number,
  params: AnalysisParams,
  hasReserves: boolean = false
): SpreadAnalysis {
  const spreadPercent = Math.abs(((price2 - price1) / price1) * 100);
  const totalCostPercent = params.feePercent + params.slippagePercent;
  const netProfitPercent = spreadPercent - totalCostPercent;

  let signal: 'No Signal' | 'Watch' | 'Actionable' = 'No Signal';
  let reasoning = '';

  if (!hasReserves) {
    reasoning = 'Reduced confidence: liquidity data unavailable. ';
  }

  if (netProfitPercent >= params.minProfitPercent) {
    signal = 'Actionable';
    reasoning += `Net profit ${netProfitPercent.toFixed(2)}% exceeds minimum threshold ${params.minProfitPercent}%.`;
  } else if (spreadPercent >= params.feePercent) {
    signal = 'Watch';
    reasoning += `Spread ${spreadPercent.toFixed(2)}% covers fees but below profit threshold.`;
  } else {
    reasoning += `Spread ${spreadPercent.toFixed(2)}% insufficient to cover costs ${totalCostPercent.toFixed(2)}%.`;
  }

  return {
    spreadPercent,
    netProfitPercent,
    signal,
    reasoning,
    hasLiquidityData: hasReserves,
  };
}
