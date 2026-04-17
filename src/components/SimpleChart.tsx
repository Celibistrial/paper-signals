'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useMemo } from 'react';
import { format } from 'date-fns';

interface SimpleChartProps {
  data: { date: Date; close: number; open?: number; high?: number; low?: number; volume?: number }[];
  color?: string;
  indicators: {
    ma: boolean;
    bb: boolean;
    vol: boolean;
    rsi: boolean;
  };
  viewMode?: 'line' | 'candle';
}

export default function SimpleChart({ data, color = '#1a1a1a', indicators, viewMode = 'line' }: SimpleChartProps) {
  const [hoverData, setHoverData] = useState<{ x: number; y: number; price: number; date: Date; ma?: number; bbUpper?: number; bbLower?: number; rsi?: number; open?: number; high?: number; low?: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const width = 800;
  const mainHeight = 400;
  const indicatorHeight = indicators.rsi ? 100 : 0;
  const totalHeight = mainHeight + indicatorHeight + (indicators.rsi ? 20 : 0);

  const minPrice = data && data.length > 0 ? Math.min(...data.map(d => d.low ?? d.close)) : 0;
  const maxPrice = data && data.length > 0 ? Math.max(...data.map(d => d.high ?? d.close)) : 0;
  const range = maxPrice - minPrice;
  const paddingY = range === 0 ? 10 : range * 0.15;

  const calculateRSI = (period = 14) => {
    if (!data || data.length <= period) return [];
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
      const diff = data[i].close - (data[i - 1]?.close || 0);
      if (diff >= 0) gains += diff; else losses -= diff;
    }
    const rsi = [null as any];
    let avgGain = gains / period;
    let avgLoss = losses / period;
    for (let i = period + 1; i < data.length; i++) {
      const diff = data[i].close - (data[i - 1]?.close || 0);
      avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
      avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi[i] = 100 - (100 / (1 + rs));
    }
    return rsi;
  };

  const rsiValues = calculateRSI();

  const points = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = mainHeight - ((d.close - (minPrice - paddingY)) / (range + paddingY * 2)) * mainHeight;
      
      let maValue, bbUpper, bbLower;
      
      if (i >= 19) {
        const window = data.slice(i - 19, i + 1);
        const validCloses = window.map(w => w.close).filter(c => typeof c === 'number' && !isNaN(c));
        
        if (validCloses.length === 20) {
          const mean = validCloses.reduce((sum, curr) => sum + curr, 0) / 20;
          if (indicators.ma) maValue = mean;
          
          if (indicators.bb) {
            const stdDev = Math.sqrt(validCloses.reduce((sum, curr) => sum + Math.pow(curr - mean, 2), 0) / 20);
            bbUpper = mean + stdDev * 2;
            bbLower = mean - stdDev * 2;
          }
        }
      }
      return { x, y, price: d.close, open: d.open, high: d.high, low: d.low, date: d.date, maValue, bbUpper, bbLower, vol: d.volume, rsi: rsiValues[i] };
    });
  }, [data, indicators.ma, indicators.bb, minPrice, maxPrice, range, paddingY, rsiValues]);

  if (!data || data.length === 0) return (
    <div className="w-full h-48 flex items-center justify-center border-2 border-dashed border-ink/10 font-serif italic text-ink/40">
      No historical records for this period.
    </div>
  );

  const getPath = (vals: (number | undefined)[]) => {
    return points.map((p, i) => {
      if (vals[i] === undefined) return null;
      const vY = mainHeight - ((vals[i]! - (minPrice - paddingY)) / (range + paddingY * 2)) * mainHeight;
      return `${p.x},${vY}`;
    }).filter(p => p !== null).join(' ');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * width;
    let closest = points[0];
    let minDiff = Math.abs(svgX - points[0].x);
    for (const p of points) {
      const diff = Math.abs(svgX - p.x);
      if (diff < minDiff) { minDiff = diff; closest = p; }
    }
    setHoverData({ ...closest, ma: closest.maValue, bbUpper: closest.bbUpper, bbLower: closest.bbLower, rsi: closest.rsi });
  };

  const maxVol = Math.max(...data.map(d => d.volume || 0));

  return (
    <div className="w-full relative group">
      <svg ref={svgRef} viewBox={`0 0 ${width} ${totalHeight}`} className="w-full h-auto overflow-visible cursor-crosshair" preserveAspectRatio="none" onMouseMove={handleMouseMove} onMouseLeave={() => setHoverData(null)}>
        {/* Main Chart Area */}
        <rect x="0" y="0" width={width} height={mainHeight} fill="transparent" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="0" y1={(i / 4) * mainHeight} x2={width} y2={(i / 4) * mainHeight} stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
        ))}

        {/* Volume - Bigger */}
        {indicators.vol && maxVol > 0 && points.map((p, i) => (
          <rect key={i} x={p.x - (width/points.length)/4} y={mainHeight - ((p.vol || 0) / maxVol) * (mainHeight / 2.5)} width={(width/points.length)/2} height={((p.vol || 0) / maxVol) * (mainHeight / 2.5)} fill="currentColor" opacity="0.08" />
        ))}

        {/* Technicals */}
        {indicators.bb && <><motion.polyline fill="none" stroke="#4a4a4a" strokeWidth="1" strokeDasharray="1 4" points={getPath(points.map(p => p.bbUpper))} opacity={0.2} /><motion.polyline fill="none" stroke="#4a4a4a" strokeWidth="1" strokeDasharray="1 4" points={getPath(points.map(p => p.bbLower))} opacity={0.2} /></>}
        {indicators.ma && <motion.polyline fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="2 2" points={getPath(points.map(p => p.maValue))} opacity={0.4} />}

        {/* Price Action */}
        {viewMode === 'line' ? (
          <motion.polyline fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points.map(p => `${p.x},${p.y}`).join(' ')} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
        ) : (
          points.map((p, i) => {
            if (p.open === undefined || p.high === undefined || p.low === undefined) return null;
            const yOpen = mainHeight - ((p.open - (minPrice - paddingY)) / (range + paddingY * 2)) * mainHeight;
            const yClose = p.y;
            const yHigh = mainHeight - ((p.high - (minPrice - paddingY)) / (range + paddingY * 2)) * mainHeight;
            const yLow = mainHeight - ((p.low - (minPrice - paddingY)) / (range + paddingY * 2)) * mainHeight;
            const isUp = p.price >= p.open;
            return (
              <g key={i}>
                <line x1={p.x} y1={yHigh} x2={p.x} y2={yLow} stroke={isUp ? '#166534' : '#991b1b'} strokeWidth="1" />
                <rect x={p.x - 2} y={Math.min(yOpen, yClose)} width="4" height={Math.max(1, Math.abs(yOpen - yClose))} fill={isUp ? '#166534' : '#991b1b'} />
              </g>
            );
          })
        )}

        {/* RSI Section */}
        {indicators.rsi && (
          <g transform={`translate(0, ${mainHeight + 20})`}>
            <rect x="0" y="0" width={width} height={indicatorHeight} fill="currentColor" fillOpacity="0.02" />
            <line x1="0" y1={indicatorHeight * 0.3} x2={width} y2={indicatorHeight * 0.3} stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.1" />
            <line x1="0" y1={indicatorHeight * 0.7} x2={width} y2={indicatorHeight * 0.7} stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.1" />
            <motion.polyline fill="none" stroke="#6b21a8" strokeWidth="1.5" points={points.filter(p => p.rsi !== undefined).map(p => `${p.x},${indicatorHeight - (p.rsi! / 100) * indicatorHeight}`).join(' ')} />
            <text x={width - 5} y="10" textAnchor="end" fontSize="8" className="font-mono opacity-30">RSI(14)</text>
          </g>
        )}

        {hoverData && (
          <>
            <line x1={hoverData.x} y1="0" x2={hoverData.x} y2={totalHeight} stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.3" />
            <circle cx={hoverData.x} cy={hoverData.y} r="6" fill={color} stroke="white" strokeWidth="2" />
          </>
        )}
      </svg>
      {hoverData && (
        <div className="absolute z-20 pointer-events-none bg-paper-dark border-2 border-ink shadow-paper p-3 font-mono text-xs" style={{ left: `${(hoverData.x / width) * 100}%`, top: `${(hoverData.y / totalHeight) * 100}%`, transform: `translate(${hoverData.x > width / 2 ? '-110%' : '10%'}, -110%)` }}>
          <div className="font-bold text-sm">₹{hoverData.price.toLocaleString('en-IN')}</div>
          {hoverData.open && <div className="text-[9px] opacity-60">O: ₹{hoverData.open.toFixed(2)} H: ₹{hoverData.high?.toFixed(2)} L: ₹{hoverData.low?.toFixed(2)}</div>}
          <div className="text-[10px] opacity-60 mb-1">{format(hoverData.date, 'MMM dd, yyyy')}</div>
          {hoverData.ma && <div className="text-[9px] text-ink/50">MA(20): ₹{hoverData.ma.toFixed(2)}</div>}
          {hoverData.rsi && <div className="text-[9px] text-purple-800">RSI: {hoverData.rsi.toFixed(2)}</div>}
        </div>
      )}
    </div>
  );
}
