import React from 'react';
import { ResponsiveContainer } from 'recharts';

export const ChartContainer: React.FC<{ children: React.ReactElement; height: number | string }> = ({ children, height }) => (
  <div className="w-full relative min-h-[180px]" style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
  </div>
);