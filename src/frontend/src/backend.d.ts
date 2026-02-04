import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DEXConfigIdentifiers {
    icpSwapCanisterId?: string;
    kongSwapCanisterId?: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface DecisionEvent {
    result: string;
    step: string;
    timestamp: Time;
    details: string;
}
export interface ArbitrageSignal {
    action: string;
    reasoning: string;
    timestamp: Time;
    feesConsidered: number;
    spreadPercent: number;
    pairId: string;
}
export interface LatencyMetric {
    stage: string;
    operation: string;
    timestamp: Time;
    details: string;
    durationNs: bigint;
}
export interface DEXConfig {
    id: bigint;
    tradingPairs: Array<PairConfig>;
    name: string;
    canisterId: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface ShadowExecutionMetrics {
    successRate: number;
    totalOpportunities: bigint;
    shadowExecutionLog: Array<TradeLogEntry>;
    avgSpreadCaptured: number;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TradeLogEntry {
    status: ShadowTradeStatus;
    resolutionReason?: string;
    timestamp: Time;
    entryPrice: number;
    exitPrice?: number;
    pairId: string;
    realizedReturn?: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface PriceSnapshot {
    reserves?: [number, number];
    timestamp: Time;
    price: number;
    rawResponse: string;
    pairId: string;
    dexName: string;
}
export interface PricePoint {
    timestamp: Time;
    price: number;
}
export interface PairConfig {
    feeBps: bigint;
    quoteSymbol: string;
    baseSymbol: string;
    poolId: string;
}
export interface SignalDetectionEvent {
    tvl: number;
    estimatedReturn: number;
    riskCategory: string;
    fees: number;
    priceDelta: number;
    safeOrderSize: number;
    highRisk: boolean;
    signalsPerHour: bigint;
    timestamp: Time;
    avgPriceDeviation: number;
    pairId: string;
}
export enum ShadowTradeStatus {
    active = "active",
    success = "success",
    timeout = "timeout",
    failed = "failed"
}
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
export interface backendInterface {
    addDEXConfig(name: string, canisterId: string, tradingPairs: Array<PairConfig>): Promise<bigint>;
    addLatencyMetric(operation: string, durationNs: bigint, stage: string, details: string): Promise<void>;
    addPricePoint(price: number): Promise<void>;
    calculateSmartDelay(): Promise<bigint>;
    detectLiveSignal(pairId: string, currentPrice: number, tvlUSD: number): Promise<SignalDetectionEvent | null>;
    dryRunDecision(fromDEX: string, toDEX: string, pairId: string, amount: number): Promise<number>;
    fetchUSDTPriceFromBinance(): Promise<number>;
    getAllDEXConfigs(): Promise<Array<DEXConfig>>;
    getAllLatencyMetrics(): Promise<Array<LatencyMetric>>;
    getAllPoolPrices(): Promise<Array<PricePoint>>;
    getDecisionHistory(): Promise<Array<DecisionEvent>>;
    getDexConfig(): Promise<DEXConfigIdentifiers>;
    getPoolPrice(): Promise<PricePoint | null>;
    getSafeOptimizerDataset(): Promise<Array<SignalDetectionEvent>>;
    getShadowExecutionMetrics(): Promise<ShadowExecutionMetrics>;
    getSortedDEXConfigs(): Promise<Array<DEXConfig>>;
    recordPriceSnapshot(snapshot: PriceSnapshot): Promise<void>;
    runArbitrageAnalysis(pairId: string): Promise<ArbitrageSignal>;
    runArbitrageAnalysisBetweenDEXs(fromDEX: string, toDEX: string, pairId: string): Promise<ArbitrageSignal>;
    setDEXConfigStatus(dexId: bigint, isActive: boolean): Promise<void>;
    setDexConfig(newConfig: DEXConfigIdentifiers): Promise<void>;
    startAgent(): Promise<void>;
    startShadowTradeEvaluationTimer(): Promise<void>;
    stopAgent(): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateTradingPairs(dexId: bigint, newTradingPairs: Array<PairConfig>): Promise<void>;
    getSystemStatus(): Promise<SystemStatus>;
    startAgentV10(): Promise<StartAgentResult>;
}
