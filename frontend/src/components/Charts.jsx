import React from 'react';

export const BarChart = ({ values = [72, 78, 81, 85, 88], labels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'] }) => {
  const w = 380;
  const h = 150;
  const bw = w / values.length;

  return (
    <svg viewBox={`0 0 ${w} ${h + 24}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <g>
        {values.map((v, i) => (
          <React.Fragment key={i}>
            <rect
              x={i * bw + 10}
              y={h - v * 1.35}
              width={bw - 20}
              height={v * 1.35}
              rx={5}
              fill="var(--p2)"
              opacity={0.5 + i / (values.length * 1.8)}
            >
              <title>{`${labels[i]}: ${v}`}</title>
            </rect>
            <text
              x={i * bw + bw / 2}
              y={h + 16}
              textAnchor="middle"
              fontSize="11"
              fill="var(--mute)"
              fontWeight="600"
            >
              {labels[i]}
            </text>
            <text
              x={i * bw + bw / 2}
              y={h - v * 1.35 - 6}
              textAnchor="middle"
              fontSize="11"
              fill="var(--ink)"
              fontWeight="700"
            >
              {v}
            </text>
          </React.Fragment>
        ))}
      </g>
    </svg>
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
