import React from 'react';

export const ChartHeader: React.FC<{ title: string; subtitle?: string; unit?: string }> = ({ title, subtitle, unit }) => (
  <div className="flex flex-col gap-0.5 select-none mb-4">
    <div className="flex items-baseline gap-2">
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      {unit && <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">({unit})</span>}
    </div>
    {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
  </div>
);