import React, { useState, useEffect, useRef } from 'react';

interface SpeedometerGaugeProps {
  score: number;
  rating: string;
  color?: string;
  marketName?: string;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  score,
  rating,
  color = '#e07a14',
}) => {
  const targetAngle = -90 + (Math.max(0, Math.min(100, score)) / 100) * 180;
  const [currentAngle, setCurrentAngle] = useState(targetAngle);
  const angleRef = useRef(targetAngle);

  useEffect(() => {
    let animId: number;
    const start = angleRef.current;
    const end = targetAngle;
    const delta = end - start;

    if (Math.abs(delta) < 0.05) {
      angleRef.current = end;
      setCurrentAngle(end);
      return;
    }

    const duration = 600;
    let startTime: number | null = null;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (time: number) => {
      if (startTime === null) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const nextAngle = start + delta * eased;
      angleRef.current = nextAngle;
      setCurrentAngle(nextAngle);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        angleRef.current = end;
        setCurrentAngle(end);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [targetAngle]);

  const segments = [
    { from: 0, to: 25, color: '#e53e3e', label: '极度恐慌' },
    { from: 25, to: 45, color: '#e07a14', label: '恐慌' },
    { from: 45, to: 55, color: '#ecc94b', label: '中性' },
    { from: 55, to: 75, color: '#38a169', label: '贪婪' },
    { from: 75, to: 100, color: '#2b6cb0', label: '极度贪婪' },
  ];

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  function describeArc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  }

  return (
    <div id="gauge-container" className="relative flex flex-col items-center justify-center pt-2 pb-0">
      <div className="relative w-[300px] flex flex-col items-center">
        <svg viewBox="0 0 300 114" className="w-full h-[114px] overflow-visible">
          <defs>
            <filter id="needle-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Color Segments */}
          {segments.map((seg, i) => {
            const startAngle = (seg.from / 100) * 180 + (i > 0 ? 1 : 0);
            const endAngle = (seg.to / 100) * 180 - (i < segments.length - 1 ? 1 : 0);
            return (
              <path
                key={i}
                d={describeArc(150, 104, 90, startAngle, endAngle)}
                fill="none"
                stroke={seg.color}
                strokeWidth={15}
                strokeLinecap={i === 0 || i === segments.length - 1 ? 'round' : 'butt'}
                className="transition-all duration-500"
              />
            );
          })}

          {/* Tick Dividers */}
          {[25, 45, 55, 75].map((val) => {
            const angle = (val / 100) * 180;
            const p1 = polarToCartesian(150, 104, 90 - 15 / 2 - 2, angle);
            const p2 = polarToCartesian(150, 104, 90 + 15 / 2 + 2, angle);
            return (
              <line
                key={val}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {/* Min and Max Labels */}
          <text x={60 - 15 / 2 - 6} y={108} fill="#9ca3af" fontSize="10" fontWeight="600" textAnchor="end">
            0
          </text>
          <text x={240 + 15 / 2 + 6} y={108} fill="#9ca3af" fontSize="10" fontWeight="600" textAnchor="start">
            100
          </text>

          {/* Needle */}
          <g filter="url(#needle-shadow)">
            <g transform={`rotate(${currentAngle.toFixed(2)}, 150, 104)`}>
              <polygon
                points={`${150 - 2.5},104 ${150 - 0.8},32 ${150 + 0.8},32 ${150 + 2.5},104`}
                fill="#18181b"
              />
            </g>
            <circle cx={150} cy={104} r={8} fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <circle cx={150} cy={104} r={3} fill="#ffffff" />
          </g>
        </svg>

        {/* Score & Rating */}
        <div className="flex flex-col items-center justify-center pt-2 pb-1 select-none">
          <div
            key={score}
            className="text-5xl font-black text-neutral-900 tracking-tight leading-none transition-transform duration-300"
          >
            {score}
          </div>
          <div className="text-base font-extrabold mt-1.5 tracking-wide" style={{ color }}>
            {rating}
          </div>
        </div>
      </div>
    </div>
  );
};
