import React, { useState, useEffect } from 'react';
import { OptimizedTelemetryChart } from '../analytics/OptimizedTelemetryChart';
import { UserProfilePanel } from '../profile/UserProfilePanel';
import { SkeletonCard } from '../ui/SkeletonCard';
import { ProductionErrorBoundary } from '../ui/ProductionErrorBoundary';

export const TelemetryGrid: React.FC = () => {
  const [isAssembling, setIsAssembling] = useState<boolean>(true);

  useEffect(() => {
    const delayFrame = setTimeout(() => setIsAssembling(false), 500);
    return () => clearTimeout(delayFrame);
  }, []);

  return (
    <ProductionErrorBoundary>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-black min-h-screen text-white antialiased max-w-(screen-2xl) mx-auto">
        <UserProfilePanel />

        <div className="space-y-2">
          <h2 className="text-xs font-bold text-neutral-500 tracking-widest font-mono uppercase">Optimized Core Telemetry Node Array</h2>
          <hr className="border-neutral-900" />
        </div>

        {isAssembling ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <OptimizedTelemetryChart nodeId="PR1" metric="heartRate" strokeColor="#f43f5e" fillColor="#f43f5e" yAxisDomain={[40, 180]} accessibleLabel="Primary Node Vital Array Tracker" />
            <OptimizedTelemetryChart nodeId="PR2" metric="heartRate" strokeColor="#3b82f6" fillColor="#3b82f6" yAxisDomain={[40, 180]} accessibleLabel="Secondary Node Vital Array Tracker" />
          </div>
        )}
      </div>
    </ProductionErrorBoundary>
  );
};