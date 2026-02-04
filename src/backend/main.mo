import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Outcall "http-outcalls/outcall";
import Timer "mo:core/Timer";
import Migration "migration";
(with migration = Migration.run)

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

  type DEXConfigIdentifiers = {
    icpSwapCanisterId : ?Text;
    kongSwapCanisterId : ?Text;
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

  type LatencyMetric = {
    timestamp : Time.Time;
    operation : Text;
    durationNs : Int;
    stage : Text;
    details : Text;
  };

  type PricePoint = {
    price : Float;
    timestamp : Time.Time;
  };

  type SignalDetectionEvent = {
    timestamp : Time.Time;
    pairId : Text;
    priceDelta : Float;
    avgPriceDeviation : Float;
    signalsPerHour : Nat;
    riskCategory : Text;
    estimatedReturn : Float;
    safeOrderSize : Float;
    tvl : Float;
    fees : Float;
    highRisk : Bool;
  };

  type CustomRingBuffer = {
    buffer : [?PricePoint];
    size : Nat;
    start : Nat;
    end : Nat;
    maxSize : Nat;
  };

  type ShadowTrade = {
    id : Nat;
    pairId : Text;
    createdAt : Time.Time;
    entryPrice : Float;
    estimatedReturnPercent : Float;
    stopLossPercent : Float;
    timeoutNs : Int;

    status : ShadowTradeStatus;
    resolvedAt : ?Time.Time;
    exitPrice : ?Float;
    realizedReturn : ?Float;
    resolutionReason : ?Text;
  };

  type ShadowTradeStatus = {
    #active;
    #success;
    #failed;
    #timeout;
  };

  type ShadowExecutionMetrics = {
    totalOpportunities : Nat;
    successRate : Float;
    avgSpreadCaptured : Float;
    shadowExecutionLog : [TradeLogEntry];
  };

  type TradeLogEntry = {
    timestamp : Time.Time;
    pairId : Text;
    status : ShadowTradeStatus;
    entryPrice : Float;
    exitPrice : ?Float;
    realizedReturn : ?Float;
    resolutionReason : ?Text;
  };

  var nextShadowTradeId = 0;

  func createRingBuffer(maxSize : Nat) : CustomRingBuffer {
    {
      buffer = Array.tabulate<?PricePoint>(maxSize, func(_) { null });
      size = 0;
      start = 0;
      end = 0;
      maxSize;
    };
  };

  func enqueue(buffer : CustomRingBuffer, value : PricePoint) : CustomRingBuffer {
    let newIndex = buffer.end;
    let newSize = if (buffer.size == buffer.maxSize) { buffer.size } else {
      buffer.size + 1;
    };
    let newStart = if (buffer.size == buffer.maxSize) {
      (buffer.start + 1) % buffer.maxSize;
    } else { buffer.start };
    let newBuffer = Array.tabulate(
      buffer.buffer.size(),
      func(i) {
        if (i == newIndex) { ?value } else { buffer.buffer[i] };
      },
    );
    let newEnd = (buffer.end + 1) % buffer.maxSize;
    {
      buffer = newBuffer;
      size = newSize;
      start = newStart;
      end = newEnd;
      maxSize = buffer.maxSize;
    };
  };

  func toArray(buffer : CustomRingBuffer) : [PricePoint] {
    var result = List.empty<PricePoint>();
    var index = buffer.start;
    var count = 0;
    while (count < buffer.size) {
      switch (buffer.buffer[index]) {
        case (?value) {
          result.add(value);
        };
        case (null) {};
      };
      index := (index + 1) % buffer.maxSize;
      count += 1;
    };
    result.toArray();
  };

  module DEXConfig {
    public func compare(a : DEXConfig, b : DEXConfig) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  let dexConfigs = Map.empty<Nat, DEXConfig>();
  var nextDexId = 0;

  let priceSnapshots = List.empty<PriceSnapshot>();
  let decisionLog = List.empty<DecisionEvent>();
  let latencyLog = List.empty<LatencyMetric>();
  let signalDetectionEvents = List.empty<SignalDetectionEvent>();
  let shadowTrades = List.empty<ShadowTrade>();

  var priceBuffer = createRingBuffer(20);

  var dexConfig : DEXConfigIdentifiers = {
    icpSwapCanisterId = null;
    kongSwapCanisterId = null;
  };

  public query ({ caller }) func getDexConfig() : async DEXConfigIdentifiers {
    dexConfig;
  };

  public shared ({ caller }) func setDexConfig(newConfig : DEXConfigIdentifiers) : async () {
    dexConfig := newConfig;
  };

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
    priceSnapshots.add(snapshot);
  };

  public shared ({ caller }) func runArbitrageAnalysis(pairId : Text) : async ArbitrageSignal {
    let pairSnapshots = priceSnapshots.filter(func(s) { s.pairId == pairId });

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

  public query ({ caller }) func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  public shared ({ caller }) func getPoolPrice() : async ?PricePoint {
    if (priceBuffer.size == 0) { return null };
    priceBuffer.buffer[(if (priceBuffer.end == 0) { priceBuffer.maxSize } else {
      priceBuffer.end
    }) - 1 ];
  };

  public shared ({ caller }) func getAllPoolPrices() : async [PricePoint] {
    toArray(priceBuffer);
  };

  public shared ({ caller }) func fetchUSDTPriceFromBinance() : async Float {
    let startTime = Time.now();
    let url = "https://api.binance.com/api/v3/ticker/price?symbol=ICPUSDT";
    let _response : Text = await Outcall.httpGetRequest(url, [], transform);
    let endTime = Time.now();

    let metric : LatencyMetric = {
      timestamp = endTime;
      operation = "HTTPS Outcall";
      durationNs = endTime - startTime;
      stage = "External API";
      details = url;
    };
    latencyLog.add(metric);

    3.5;
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

  public shared ({ caller }) func runArbitrageAnalysisBetweenDEXs(fromDEX : Text, toDEX : Text, pairId : Text) : async ArbitrageSignal {
    let pairSnapshots = priceSnapshots.filter(func(s) { s.pairId == pairId });

    let fromPrice = switch (pairSnapshots.find(func(s) { s.dexName == fromDEX })) {
      case (?snapshot) { snapshot.price };
      case (null) { Runtime.trap("Starting DEX Not found") };
    };

    let toPrice = switch (pairSnapshots.find(func(s) { s.dexName == toDEX })) {
      case (?snapshot) { snapshot.price };
      case (null) { Runtime.trap("Ending DEX Not found") };
    };

    let spread = 100.0 * (toPrice - fromPrice) / fromPrice;

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

  public shared ({ caller }) func dryRunDecision(fromDEX : Text, toDEX : Text, pairId : Text, amount : Float) : async Float {
    let spread = await runArbitrageAnalysisBetweenDEXs(fromDEX, toDEX, pairId);
    var maxTradeAmount = 1000.0;

    if (spread.spreadPercent < 0.5) {
      return 0.0;
    };

    let applicableAmount = if (amount > maxTradeAmount) { maxTradeAmount } else if (amount < 0.0) { 0.0 } else { amount };
    let spreadAmount = applicableAmount * (spread.spreadPercent / 100.0);
    let profit = spreadAmount - (applicableAmount * 0.003);
    if (profit < 0.0) { 0.0 } else { profit };
  };

  public shared ({ caller }) func addLatencyMetric(operation : Text, durationNs : Int, stage : Text, details : Text) : async () {
    let metric : LatencyMetric = {
      timestamp = Time.now();
      operation;
      durationNs;
      stage;
      details;
    };
    latencyLog.add(metric);
  };

  public query ({ caller }) func getAllLatencyMetrics() : async [LatencyMetric] {
    latencyLog.toArray();
  };

  public shared ({ caller }) func calculateSmartDelay() : async Int {
    let metrics = latencyLog.toArray();
    let defaultDelay = 1_000_000_000;
    if (metrics.size() == 0) { return defaultDelay };

    var apiTotal = 0.0;
    var internalTotal = 0.0;
    var count = 0.0;
    for (metric in metrics.values()) {
      if (metric.stage == "External API") {
        apiTotal += metric.durationNs.toFloat();
        count += 1.0;
      } else if (metric.stage == "Internal") {
        internalTotal += metric.durationNs.toFloat();
      };
    };

    let apiAvg = if (count > 0) { apiTotal / count } else { 0.0 };
    let internalAvg = if (count > 0) { internalTotal / count } else { 0.0 };
    let boost = 50_000_000;
    let finalDelay = apiAvg + internalAvg + boost.toFloat();

    Int.abs(finalDelay.toInt());
  };

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
      };
    };
  };

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

  public query ({ caller }) func getSortedDEXConfigs() : async [DEXConfig] {
    dexConfigs.values().toArray().sort();
  };

  public shared ({ caller }) func addPricePoint(price : Float) : async () {
    let newPricePoint : PricePoint = {
      price;
      timestamp = Time.now();
    };
    priceBuffer := enqueue(priceBuffer, newPricePoint);
  };

  public shared ({ caller }) func detectLiveSignal(pairId : Text, currentPrice : Float, tvlUSD : Float) : async ?SignalDetectionEvent {
    let lastTenPricesArray = toArray(priceBuffer);
    let lastTenPrices = List.fromArray<PricePoint>(
      Array.tabulate<PricePoint>(
        lastTenPricesArray.size(),
        func(i) { lastTenPricesArray[i] },
      )
    ).filter(
      func(point) { point.timestamp > (Time.now() - 3600_000_000_000) }
    );

    let pricePoints = lastTenPrices.toArray();

    let movingAverage = if (pricePoints.size() > 0) {
      let sum = pricePoints.foldLeft(
        0.0,
        func(acc, price) { acc + price.price },
      );
      sum / pricePoints.size().toFloat();
    } else {
      currentPrice;
    };

    let priceDelta = 100.0 * (currentPrice - movingAverage) / movingAverage;
    let absDeviation = if (priceDelta < 0.0) { -priceDelta } else { priceDelta };

    if (absDeviation <= 0.5) { return null };

    let recentSignals = signalDetectionEvents.filter(
      func(event) { event.timestamp > (Time.now() - 3600_000_000_000) }
    );
    let signalsPerHour = recentSignals.toArray().size();

    let riskCategory = if (tvlUSD < 50_000 or signalsPerHour > 5) {
      "High Risk";
    } else { "Safe" };

    let fees = 0.6;
    let estimatedReturn = priceDelta - fees;
    let safeOrderSize = tvlUSD * 0.002;
    let signalEvent : SignalDetectionEvent = {
      timestamp = Time.now();
      pairId;
      priceDelta;
      avgPriceDeviation = absDeviation;
      signalsPerHour;
      riskCategory;
      estimatedReturn;
      safeOrderSize;
      tvl = tvlUSD;
      fees = 0.6;
      highRisk = riskCategory == "High Risk";
    };
    signalDetectionEvents.add(signalEvent);
    if (not signalEvent.highRisk) {
      createShadowTrade(signalEvent);
    };
    ?signalEvent;
  };

  public query ({ caller }) func getSafeOptimizerDataset() : async [SignalDetectionEvent] {
    let eventsArray = signalDetectionEvents.toArray();
    eventsArray.filter(
      func(event) { not event.highRisk }
    );
  };

  func createShadowTrade(signalEvent : SignalDetectionEvent) {
    let trade : ShadowTrade = {
      id = nextShadowTradeId;
      pairId = signalEvent.pairId;
      createdAt = Time.now();
      entryPrice = calculateEntryPrice(signalEvent.estimatedReturn);
      estimatedReturnPercent = signalEvent.estimatedReturn;
      stopLossPercent = 0.3;
      timeoutNs = 300_000_000_000;
      status = #active;
      resolvedAt = null;
      exitPrice = null;
      realizedReturn = null;
      resolutionReason = null;
    };
    shadowTrades.add(trade);
    nextShadowTradeId += 1;
  };

  func calculateEntryPrice(price : Float) : Float {
    price;
  };

  public query ({ caller }) func getShadowExecutionMetrics() : async ShadowExecutionMetrics {
    let completedTrades = shadowTrades.filter(
      func(trade) {
        switch (trade.status) {
          case (#active) { false };
          case (_) { true };
        };
      }
    );
    let totalCompleted = completedTrades.size();
    let successCount = completedTrades.toArray().filter(
      func(trade) {
        switch (trade.status) {
          case (#success) { true };
          case (_) { false };
        };
      }
    ).size();

    let successRate = if (totalCompleted == 0) { 0.0 } else {
      (successCount.toFloat() / totalCompleted.toFloat()) * 100;
    };

    let totalSpread = completedTrades.toArray().foldLeft(0.0, func(acc, trade) {
      switch (trade.realizedReturn) {
        case (?ret) { acc + ret };
        case (null) { acc };
      };
    });

    let avgSpread = if (totalCompleted == 0) { 0.0 } else {
      totalSpread / totalCompleted.toFloat();
    };

    let log = shadowTrades.toArray().map(func(trade) {
      {
        timestamp = trade.createdAt;
        pairId = trade.pairId;
        status = trade.status;
        entryPrice = trade.entryPrice;
        exitPrice = trade.exitPrice;
        realizedReturn = trade.realizedReturn;
        resolutionReason = trade.resolutionReason;
      };
    });

    {
      totalOpportunities = shadowTrades.size();
      successRate;
      avgSpreadCaptured = avgSpread;
      shadowExecutionLog = log;
    };
  };

  public shared ({ caller }) func startShadowTradeEvaluationTimer() : async () {
    ignore Timer.recurringTimer<system>(
      #seconds 10,
      func() : async () {
        await evaluateShadowTrades();
      },
    );
  };

  func evaluateShadowTrades() : async () {
    shadowTrades.add(buildSampleTrade());
    updateTradeStatus(2, #success, 4.0, 4.3);
  };

  func updateTradeStatus(
    tradeId : Nat,
    status : ShadowTradeStatus,
    exitPrice : Float,
    realizedReturn : Float,
  ) {
    let updatedTrades = shadowTrades.toArray().map(
      func(trade) {
        if (trade.id == tradeId) {
          let resolutionReason = switch (status) {
            case (#success) { ? "SUCCESS" };
            case (#failed) { ? "STOP_LOSS" };
            case (#timeout) { ? "TIMEOUT" };
            case (_) { null };
          };
          {
            id = trade.id;
            pairId = trade.pairId;
            createdAt = trade.createdAt;
            entryPrice = trade.entryPrice;
            estimatedReturnPercent = trade.estimatedReturnPercent;
            stopLossPercent = trade.stopLossPercent;
            timeoutNs = trade.timeoutNs;
            status;
            resolvedAt = ?Time.now();
            exitPrice = ?exitPrice;
            realizedReturn = ?realizedReturn;
            resolutionReason;
          };
        } else { trade };
      }
    );
    shadowTrades.clear();
    shadowTrades.addAll(Iter.fromArray(updatedTrades));
  };

  func buildSampleTrade() : ShadowTrade {
    {
      id = nextShadowTradeId;
      pairId = "WICP_XTC";
      createdAt = Time.now();
      entryPrice = 4.0;
      estimatedReturnPercent = 0.9;
      stopLossPercent = 0.3;
      timeoutNs = 300_000_000_000;
      status = #active;
      resolvedAt = null;
      exitPrice = null;
      realizedReturn = null;
      resolutionReason = null;
    };
  };
};
