import BacktestPanel from '../components/BacktestPanel';
import StrategyParametersPanel from '../components/StrategyParametersPanel';
import OptimizerPanel from '../components/OptimizerPanel';
import LiveDetectionsPanel from '../components/LiveDetectionsPanel';

export default function SelfImprovementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Evolutionary Lab</h2>
        <p className="text-muted-foreground">Self-improvement through backtesting and parameter optimization</p>
      </div>

      <LiveDetectionsPanel />

      <div className="grid gap-6 lg:grid-cols-2">
        <BacktestPanel />
        <OptimizerPanel />
      </div>

      <StrategyParametersPanel />
    </div>
  );
}
