import React, { useState, useEffect } from 'react';
import { YSHConfig } from '../types/location';
import { updateYSHConfig, subscribeYSHConfig } from '../services/yshService';

export const YSHControlPanel: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [latitude, setLatitude] = useState<string>('26.912400');
  const [longitude, setLongitude] = useState<string>('75.787300');
  const [altitude, setAltitude] = useState<string>('431');
  const [satellites, setSatellites] = useState<string>('0');
  const [label, setLabel] = useState<string>('YSH Fallback Location');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeYSHConfig((config) => {
      if (config) {
        setEnabled(config.enabled);
        setLatitude(config.latitude.toString());
        setLongitude(config.longitude.toString());
        setAltitude(config.altitude.toString());
        if (config.satellites !== undefined) {
          setSatellites(config.satellites.toString());
        }
        setLabel(config.label || 'YSH Fallback Location');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      const altNum = parseFloat(altitude);
      const satNum = parseInt(satellites, 10);

      if (isNaN(latNum) || isNaN(lngNum) || isNaN(altNum)) {
        throw new Error('Coordinates and altitude must be valid numbers.');
      }

      await updateYSHConfig({
        enabled,
        latitude: latNum,
        longitude: lngNum,
        altitude: altNum,
        satellites: isNaN(satNum) ? 0 : satNum,
        label,
      });

      setStatusMessage('YSH Location updated successfully!');
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-md max-w-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <h3 className="font-semibold text-base text-slate-200">LOCATION SOURCE</h3>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
          CUSTOM LOCATION
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Enable YSH Fallback</label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Altitude (m)</label>
              <input
                type="number"
                step="any"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Satellites</label>
              <input
                type="number"
                value={satellites}
                onChange={(e) => setSatellites(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm rounded transition-colors"
        >
          {isSaving ? 'Updating Firebase...' : 'Update Custom Location'}
        </button>

        {statusMessage && (
          <p className={`text-xs mt-2 ${statusMessage.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
};
