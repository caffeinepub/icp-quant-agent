import { useMemo } from 'react';

interface RatioSample {
  timestamp: number;
  ratio: number;
}

interface CkBtcIcpRatioSparklineProps {
  samples: RatioSample[];
}

export default function CkBtcIcpRatioSparkline({ samples }: CkBtcIcpRatioSparklineProps) {
  const { path, minRatio, maxRatio } = useMemo(() => {
    if (samples.length < 2) {
      return { path: '', minRatio: 0, maxRatio: 0 };
    }

    const ratios = samples.map(s => s.ratio);
    const minRatio = Math.min(...ratios);
    const maxRatio = Math.max(...ratios);
    const range = maxRatio - minRatio || 1;

    const width = 300;
    const height = 60;
    const padding = 4;

    const points = samples.map((sample, index) => {
      const x = (index / (samples.length - 1)) * (width - 2 * padding) + padding;
      const normalizedY = (sample.ratio - minRatio) / range;
      const y = height - padding - normalizedY * (height - 2 * padding);
      return `${x},${y}`;
    });

    const path = `M ${points.join(' L ')}`;

    return { path, minRatio, maxRatio };
  }, [samples]);

  if (samples.length < 2) {
    return (
      <div className="flex h-[60px] w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">Collecting samples...</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <svg
        width="100%"
        height="60"
        viewBox="0 0 300 60"
        className="rounded-lg border border-border bg-muted/30"
        preserveAspectRatio="none"
      >
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Min: {minRatio.toFixed(2)}</span>
        <span>Max: {maxRatio.toFixed(2)}</span>
      </div>
    </div>
  );
}
