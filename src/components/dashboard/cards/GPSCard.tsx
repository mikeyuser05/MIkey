import React from 'react';

interface GPSStatusProps {
  gpsStatus?: {
    fix?: boolean;
    valid?: boolean;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    satellites?: number;
  };
}

export const GPSCard: React.FC<GPSStatusProps> = ({ gpsStatus }) => {
  const rawLat = gpsStatus?.latitude ?? 0;
  const rawLng = gpsStatus?.longitude ?? 0;

  // PR41.4: Zero-Coordinate Safeguard Logic
  const isZeroCoords = rawLat === 0 && rawLng === 0;
  const isValidFix = Boolean((gpsStatus?.valid ?? gpsStatus?.fix) && !isZeroCoords);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="satellite">🛰️</span>
          <div>
            <h3 className="font-semibold text-base text-slate-100">
              GPS Location Stream (LGN12)
            </h3>
            <p className="text-xs text-slate-400">
              Real-time telemetry payload received from Neo-6M module via Firebase RTDB
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-md text-xs font-bold tracking-wider ${
          isValidFix 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
        }`}>
          {isValidFix ? 'FIXED' : 'NO GPS FIX'}
        </span>
      </div>

      <div className="py-6 space-y-4">
        {!isValidFix ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-center">
            <span className="text-xs font-semibold text-rose-400 block mb-1">
              ⚠️ ACQUIRING SATELLITE FIX
            </span>
            <p className="text-[11px] text-slate-400">
              Hardware connected. Waiting for valid orbital coordinate packet from Neo-6M array.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Latitude</span>
              <span className="font-mono text-lg text-slate-200 block select-all">
                {rawLat.toFixed(6)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Longitude</span>
              <span className="font-mono text-lg text-slate-200 block select-all">
                {rawLng.toFixed(6)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 block uppercase font-medium">Satellites</span>
            <span className="font-mono text-base font-semibold text-slate-200">{gpsStatus?.satellites ?? 0}</span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 block uppercase font-medium">Altitude</span>
            <span className="font-mono text-base font-semibold text-slate-200">
              {gpsStatus?.altitude !== undefined ? `${gpsStatus.altitude.toFixed(1)} m` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span>Neo-6M Hardware Stream</span>
        <span>{isValidFix ? '3D Satellite Fix' : 'Searching Satellites...'}</span>
      </div>
    </div>
  );
};
