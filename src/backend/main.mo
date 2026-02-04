import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  type DEXConfig = {
    id : Nat;
    name : Text;
    canisterId : Text;
    tradingPairs : [PairConfig];
  };

  type PairConfig = {
    baseSymbol : Text;
    quoteSymbol : Text;
    poolId : Text;
    feeBps : Nat;
  };

  type PriceSnapshot = {
    timestamp : Time.Time;
    dexName : Text;
    pairId : Text;
    price : Float;
    reserves : ?(Float, Float);
    rawResponse : Text;
  };

  type ArbitrageSignal = {
    timestamp : Time.Time;
    pairId : Text;
    action : Text;
    spreadPercent : Float;
    feesConsidered : Float;
    reasoning : Text;
  };

  type DecisionEvent = {
    timestamp : Time.Time;
    step : Text;
    result : Text;
    details : Text;
  };

  let dexConfigs = Map.empty<Nat, DEXConfig>();
  var nextDexId = 0;

  let snapshots = List.empty<PriceSnapshot>();
  let decisionLog = List.empty<DecisionEvent>();

  public shared ({ caller }) func addDEXConfig(name : Text, canisterId : Text, tradingPairs : [PairConfig]) : async Nat {
    let config : DEXConfig = {
      id = nextDexId;
      name;
      canisterId;
      tradingPairs;
    };
    dexConfigs.add(nextDexId, config);
    nextDexId += 1;
    nextDexId - 1;
  };

  public shared ({ caller }) func getAllDEXConfigs() : async [DEXConfig] {
    dexConfigs.values().toArray();
  };

  public shared ({ caller }) func recordPriceSnapshot(snapshot : PriceSnapshot) : async () {
    snapshots.add(snapshot);
  };

  public shared ({ caller }) func runArbitrageAnalysis(pairId : Text) : async ArbitrageSignal {
    let pairSnapshots = snapshots.filter(func(s) { s.pairId == pairId });

    let icpSwapPrice = switch (pairSnapshots.find(func(s) { s.dexName == "ICPSwap" })) {
      case (?snapshot) { snapshot.price };
      case (null) { Runtime.trap("ICPSwap price snapshot not found") };
    };

    let kongSwapPrice = switch (pairSnapshots.find(func(s) { s.dexName == "KongSwap" })) {
      case (?snapshot) { snapshot.price };
      case (null) { Runtime.trap("KongSwap price snapshot not found") };
    };

    let spread = 100.0 * (kongSwapPrice - icpSwapPrice) / icpSwapPrice;

    let signal : ArbitrageSignal = {
      timestamp = Time.now();
      pairId;
      action = if (spread > 0.5) { "Actionable" } else { "No Signal" };
      spreadPercent = spread;
      feesConsidered = 0.3;
      reasoning = "Spread > 0.5% is actionable after 0.3% fees";
    };

    decisionLog.add({
      timestamp = Time.now();
      step = "Analysis";
      result = signal.action;
      details = "Spread: " # spread.toText() # "%";
    });

    signal;
  };

  public query ({ caller }) func getDecisionHistory() : async [DecisionEvent] {
    decisionLog.toArray();
  };

  public shared ({ caller }) func startAgent() : async () {
    decisionLog.add({
      timestamp = Time.now();
      step = "Start";
      result = "Started";
      details = "Agent started polling";
    });
  };

  public shared ({ caller }) func stopAgent() : async () {
    decisionLog.add({
      timestamp = Time.now();
      step = "Stop";
      result = "Stopped";
      details = "Agent stopped polling";
    });
  };

  // Entry point for updating individual trading pairs in a DEX config
  public shared ({ caller }) func updateTradingPairs(dexId : Nat, newTradingPairs : [PairConfig]) : async () {
    switch (dexConfigs.get(dexId)) {
      case (null) {
        Runtime.trap("DEX config not found. Did you mean another canister?");
      };
      case (?currentConfig) {
        let updatedConfig : DEXConfig = {
          id = currentConfig.id;
          name = currentConfig.name;
          canisterId = currentConfig.canisterId;
          tradingPairs = newTradingPairs;
        };
        dexConfigs.add(dexId, updatedConfig);
        // Instead of trap, now replaces all trading pairs for that DEX
      };
    };
  };

  // Enable/disable a DEX config
  public shared ({ caller }) func setDEXConfigStatus(dexId : Nat, isActive : Bool) : async () {
    switch (dexConfigs.get(dexId)) {
      case (null) { Runtime.trap("DEX config not found") };
      case (?config) {
        let updatedConfig : DEXConfig = {
          id = config.id;
          name = config.name;
          canisterId = if (isActive) { config.canisterId } else { "" };
          tradingPairs = config.tradingPairs;
        };
        dexConfigs.add(dexId, updatedConfig);
      };
    };
  };

  module DEXConfig {
    public func compare(a : DEXConfig, b : DEXConfig) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Get DEX configs sorted by id
  public query ({ caller }) func getSortedDEXConfigs() : async [DEXConfig] {
    dexConfigs.values().toArray().sort();
  };
};
