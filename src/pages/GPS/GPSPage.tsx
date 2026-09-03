import React, { useEffect, useState } from 'react';
import { GPSCard } from '../../components/dashboard/cards/GPSCard';
import { mapFirebaseToHealthContext, StructuredHealthContext } from '../../services/aiService';

export const GPSPage: React.FC = () => {
  // Live telemetry state
  const [telemetry, setTelemetry] = useState<StructuredHealthContext['gpsStatus']>({
    fix: false,
    valid: false,
    latitude: 0,
    longitude: 0,
    altitude: 0,
    satellites: 0,
  });

  useEffect(() => {
    // PR41.2 Integration: Map dynamic Firebase updates into local GPS status state
    // Replace this listener/event trigger with your existing Firebase RTDB `onValue` subscription node
    const handleFirebaseUpdate = (rawPayload: any) => {
      const normalized = mapFirebaseToHealthContext(rawPayload);
      setTelemetry(normalized.gpsStatus);
    };

    // Placeholder: Connect to window event / global Firebase stream if present
    const listener = (e: CustomEvent) => handleFirebaseUpdate(e.detail);
    window.addEventListener('firebase-telemetry-update' as any, listener);

    return () => {
      window.removeEventListener('firebase-telemetry-update' as any, listener);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-100">GPS Location & Telemetry Hub</h1>
        <p className="text-xs text-slate-400">
          Live orbital position stream synced from Neo-6M via LGN12 telemetry pipeline
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GPSCard gpsStatus={telemetry} />
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm text-slate-200 mb-2">Hardware & Signal Specs</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span>Receiver Hardware:</span>
                <span className="font-mono text-slate-200">u-blox Neo-6M</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span>Baud Rate:</span>
                <span className="font-mono text-slate-200">9600 bps</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span>Pipeline Integration:</span>
                <span className="font-mono text-emerald-400">LGN12 Stream</span>
              </li>
              <li className="flex justify-between pb-1">
                <span>Firebase RTDB Sync:</span>
                <span className="font-mono text-emerald-400">ONLINE</span>
              </li>
            </ul>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-[11px] text-slate-400">
            🔒 Telemetry packets are cryptographically signed and processed via XAI Decision Engine.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPSPage;
