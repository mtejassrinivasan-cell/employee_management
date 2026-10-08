import React from 'react';

export const BarChart = ({
  values = [72, 78, 81, 85, 88],
  labels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  subtitles = [],
  colors = [],
  targetBenchmark = 80,
  showTargetLine = true,
  maxBarWidth = 46,
  minBarWidth = 24
}) => {
  const w = 480;
  const h = 185;
  const padLeft = 36;
  const padRight = 20;
  const padTop = 28;
  const padBottom = subtitles.length ? 44 : 32;
  const plotW = w - padLeft - padRight;
  const plotH = h - padTop - padBottom;

  const n = values.length || 1;
  // If fewer bars, cap total width so bars don't stretch into massive bricks
  const maxSpan = Math.min(plotW, Math.max(130, n * 86));
  const startX = padLeft + (plotW - maxSpan) / 2;
  const slotW = maxSpan / n;
  const barW = Math.min(maxBarWidth, Math.max(minBarWidth, slotW * 0.52));

  const getY = (val) => padTop + plotH - (Math.min(100, Math.max(0, val)) / 100) * plotH;
  const targetY = getY(targetBenchmark);
  const gridTicks = [25, 50, 75, 100];

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="barGradPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--p2)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--p)" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="barGradBenchmark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
          </linearGradient>
          <filter id="barShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Horizontal Gridlines */}
        {gridTicks.map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={padLeft + plotW}
                y2={y}
                stroke="var(--line)"
                strokeDasharray="3 3"
                strokeWidth="1"
                opacity={0.65}
              />
              <text
                x={padLeft - 6}
                y={y + 3.5}
                textAnchor="end"
                fontSize="9.5"
                fill="var(--mute)"
                fontWeight="500"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Baseline (0) */}
        <line
          x1={padLeft}
          y1={padTop + plotH}
          x2={padLeft + plotW}
          y2={padTop + plotH}
          stroke="var(--line)"
          strokeWidth="1.2"
        />

        {/* Target Benchmark Reference Line */}
        {showTargetLine && (
          <g>
            <line
              x1={padLeft}
              y1={targetY}
              x2={padLeft + plotW}
              y2={targetY}
              stroke="#f59e0b"
              strokeDasharray="5 4"
              strokeWidth="1.5"
              opacity={0.9}
            />
            <rect
              x={padLeft + plotW - 68}
              y={targetY - 9}
              width={68}
              height={16}
              rx={4}
              fill="#f59e0b"
              fillOpacity={0.16}
              stroke="#f59e0b"
              strokeWidth="0.8"
            />
            <text
              x={padLeft + plotW - 34}
              y={targetY + 2.5}
              textAnchor="middle"
              fontSize="8.5"
              fill="#f59e0b"
              fontWeight="700"
              letterSpacing="0.4"
            >
              TARGET {targetBenchmark}%
            </text>
          </g>
        )}

        {/* Bars */}
        {values.map((v, i) => {
          const barHeight = Math.max(4, (Math.min(100, Math.max(0, v)) / 100) * plotH);
          const barX = startX + i * slotW + (slotW - barW) / 2;
          const barY = padTop + plotH - barHeight;
          const isTargetComparison =
            labels[i]?.toLowerCase().includes('target') ||
            labels[i]?.toLowerCase().includes('benchmark');
          const isAboveTarget = v >= targetBenchmark;
          const barFill =
            colors[i] || (isTargetComparison ? 'url(#barGradBenchmark)' : 'url(#barGradPrimary)');

          return (
            <g key={i}>
              {/* Background slot pill track */}
              <rect
                x={barX}
                y={padTop}
                width={barW}
                height={plotH}
                rx={6}
                fill="var(--line)"
                opacity={0.2}
              />

              {/* Active Bar */}
              <rect
                x={barX}
                y={barY}
                width={barW}
                height={barHeight}
                rx={6}
                fill={barFill}
                filter="url(#barShadow)"
              >
                <title>{`${labels[i]}: ${v}%`}</title>
              </rect>

              {/* Score Badge on top */}
              <rect
                x={barX + barW / 2 - 15}
                y={barY - 19}
                width={30}
                height={15}
                rx={4}
                fill="var(--surface)"
                stroke={isAboveTarget ? 'var(--p2)' : 'var(--line)'}
                strokeWidth="1"
              />
              <text
                x={barX + barW / 2}
                y={barY - 8}
                textAnchor="middle"
                fontSize="9.5"
                fill="var(--ink)"
                fontWeight="800"
              >
                {v}
              </text>

              {/* Label */}
              <text
                x={barX + barW / 2}
                y={padTop + plotH + 16}
                textAnchor="middle"
                fontSize="11"
                fill="var(--ink)"
                fontWeight="600"
              >
                {labels[i]}
              </text>

              {/* Subtitle if provided */}
              {subtitles[i] && (
                <text
                  x={barX + barW / 2}
                  y={padTop + plotH + 28}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="var(--mute)"
                  fontWeight="500"
                >
                  {subtitles[i]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const RadarChart = ({
  values = [85, 70, 90, 65, 80],
  labels = ['Backend', 'Security', 'SQL', 'System', 'Teamwork']
}) => {
  const c = 90;
  const r = 70;
  const n = values.length;

  const pt = (i, k) => [
    c + Math.sin((i * 2 * Math.PI) / n) * r * k,
    c - Math.cos((i * 2 * Math.PI) / n) * r * k
  ];

  const ring = (k) => values.map((_, i) => pt(i, k).join(',')).join(' ');
  const polygonPoints = values.map((x, i) => pt(i, x / 100).join(',')).join(' ');

  return (
    <svg viewBox="0 0 180 180" style={{ width: '100%', maxWidth: '260px', display: 'block', margin: 'auto' }}>
      {[0.33, 0.66, 1].map((k, idx) => (
        <polygon key={idx} points={ring(k)} fill="none" stroke="var(--line)" strokeWidth="1.2" />
      ))}
      <polygon
        points={polygonPoints}
        fill="var(--p2)"
        fillOpacity="0.25"
        stroke="var(--p2)"
        strokeWidth="2"
      />
      {labels.map((t, i) => {
        const [x, y] = pt(i, 1.22);
        return (
          <text key={i} x={x} y={y} fontSize="9.5" textAnchor="middle" fill="var(--mute)" fontWeight="600">
            {t}
          </text>
        );
      })}
    </svg>
  );
};
