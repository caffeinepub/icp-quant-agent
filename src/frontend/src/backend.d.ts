import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ArbitrageSignal {
    action: string;
    reasoning: string;
    timestamp: Time;
    feesConsidered: number;
    spreadPercent: number;
    pairId: string;
}
export interface PairConfig {
    feeBps: bigint;
    quoteSymbol: string;
    baseSymbol: string;
    poolId: string;
}
export interface DEXConfig {
    id: bigint;
    tradingPairs: Array<PairConfig>;
    name: string;
    canisterId: string;
}
export type Time = bigint;
export interface DecisionEvent {
    result: string;
    step: string;
    timestamp: Time;
    details: string;
}
export interface PriceSnapshot {
    reserves?: [number, number];
    timestamp: Time;
    price: number;
    rawResponse: string;
    pairId: string;
    dexName: string;
}
export interface backendInterface {
    addDEXConfig(name: string, canisterId: string, tradingPairs: Array<PairConfig>): Promise<bigint>;
    getAllDEXConfigs(): Promise<Array<DEXConfig>>;
    getDecisionHistory(): Promise<Array<DecisionEvent>>;
    getSortedDEXConfigs(): Promise<Array<DEXConfig>>;
    recordPriceSnapshot(snapshot: PriceSnapshot): Promise<void>;
    runArbitrageAnalysis(pairId: string): Promise<ArbitrageSignal>;
    setDEXConfigStatus(dexId: bigint, isActive: boolean): Promise<void>;
    startAgent(): Promise<void>;
    stopAgent(): Promise<void>;
    updateTradingPairs(dexId: bigint, newTradingPairs: Array<PairConfig>): Promise<void>;
}
