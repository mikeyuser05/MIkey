import React from 'react';

export interface IAIMetricsFrame {
  min: number;
  max: number;
  average: number;
}

export interface IAISummaryData {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  timestamp: number;
  dataPointsEvaluated: number;
  metrics: {
    heartRate: IAIMetricsFrame;
    spo2: IAIMetricsFrame;
    gas: IAIMetricsFrame;
  };
  healthScores: {
    cardiovascularScore: number;
    respiratoryScore: number;
    environmentalSafetyScore: number;
    overallHealthScore: number;
  };
  criticalAlertCount: number;
}

export interface IAISummaryViewerProps {
  selectedType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  onTypeChange: (type: 'DAILY' | 'WEEKLY' | 'MONTHLY') => void;
  summaryData: IAISummaryData | null;
}

/**
 * Presentation-only React component for reviewing historical analytics data summaries.
 * Provides granular visualization of biometric systems, aggregated telemetry blocks, and health score sub-grids.
 */
export const AISummaryViewer: React.FC<IAISummaryViewerProps> = ({
  selectedType,
  onTypeChange,
  summaryData
}) => {
  const typeOptions: Array<'DAILY' | 'WEEKLY' | 'MONTHLY'> = ['DAILY', 'WEEKLY', 'MONTHLY'];

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#00ff66'; // Optimal state
    if (score >= 70) return '#ffaa00'; // Guarded state
    return '#ff3333'; // Critical condition
  };

  return (
    <div className="hpo-summary-viewer" style={{ color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Interval Scope Configuration Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid #222',
          paddingBottom: '16px'
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Historical Summary Context Selection</h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#888' }}>Select target calculation window scope for evaluation display</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#1c1c1c', padding: '4px', borderRadius: '4px' }}>
          {typeOptions.map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              style={{
                padding: '6px 12px',
                backgroundColor: selectedType === type ? '#2a2a2a' : 'transparent',
                border: 'none',
                borderRadius: '3px',
                color: selectedType === type ? '#00ff66' : '#666',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: selectedType === type ? 600 : 400,
                transition: 'all 0.15s ease'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {!summaryData ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666', fontSize: '14px' }}>
          No historical evaluation data blocks loaded for the selected interval scope context.
        </div>
      ) : (
        <div>
          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#1a1a1a', padding: '12px 16px', borderRadius: '4px', border: '1px solid #222' }}>
              <span style={{ fontSize: '11px', color: '#666', display: 'block', textTransform: 'uppercase' }}>Window Type Scope</span>
              <strong style={{ fontSize: '16px', color: '#00ff66' }}>{summaryData.type} EVALUATION</strong>
            </div>
            <div style={{ backgroundColor: '#1a1a1a', padding: '12px 16px', borderRadius: '4px', border: '1px solid #222' }}>
              <span style={{ fontSize: '11px', color: '#666', display: 'block', textTransform: 'uppercase' }}>Data Blocks Evaluated</span>
              <strong style={{ fontSize: '16px', color: '#fff' }}>{summaryData.dataPointsEvaluated} Base Epochs</strong>
            </div>
          </div>

          {/* Subsystem Score Matrix */}
          <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#aaa' }}>Core Subsystem Score Performance</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Cardiovascular', val: summaryData.healthScores.cardiovascularScore },
              { label: 'Respiratory', val: summaryData.healthScores.respiratoryScore },
              { label: 'Environmental Safety', val: summaryData.healthScores.environmentalSafetyScore },
              { label: 'Composite Health Score', val: summaryData.healthScores.overallHealthScore, highlight: true }
            ].map((scoreItem, idx) => (
              <div 
                key={idx} 
                style={{ 
                  backgroundColor: scoreItem.highlight ? '#1c281f' : '#1a1a1a', 
                  padding: '16px', 
                  borderRadius: '6px', 
                  border: scoreItem.highlight ? '1px solid #00ff66' : '1px solid #222',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '12px', color: scoreItem.highlight ? '#00ff66' : '#888', marginBottom: '8px' }}>{scoreItem.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: getScoreColor(scoreItem.val) }}>
                  {scoreItem.val}<span style={{ fontSize: '14px', fontWeight: 400, color: '#555' }}>/100</span>
                </div>
              </div>
            ))}
          </div>

          {/* Aggregated Biometric Summary Tables */}
          <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#aaa' }}>Telemetry Aggregation Metrics Matrix</h5>
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #222', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#222', color: '#888' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Biometric System Frame</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Minimum Limit</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Maximum Target</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Averaged Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Heart Rate Intensity', unit: 'bpm', data: summaryData.metrics.heartRate },
                  { name: 'Oxygen Saturation (SpO2)', unit: '%', data: summaryData.metrics.spo2 },
                  { name: 'Environmental Gas Vector', unit: 'ppm', data: summaryData.metrics.gas }
                ].map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#fff' }}>{row.name}</td>
                    <td style={{ padding: '12px 16px', color: '#aaa' }}>{row.data.min} {row.unit}</td>
                    <td style={{ padding: '12px 16px', color: '#aaa' }}>{row.data.max} {row.unit}</td>
                    <td style={{ padding: '12px 16px', color: '#00ff66', fontWeight: 600 }}>{row.data.average} {row.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alert Counter Shield Component */}
          {summaryData.criticalAlertCount > 0 && (
            <div 
              style={{ 
                marginTop: '16px', 
                backgroundColor: 'rgba(255,51,51,0.06)', 
                border: '1px solid #ff3333', 
                borderRadius: '4px', 
                padding: '12px 16px',
                fontSize: '13px',
                color: '#ff6666',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ⚠️ <strong>Engine Advisory Warning:</strong> {summaryData.criticalAlertCount} extreme threshold violation markers caught during window parsing operations.
            </div>
          )}
        </div>
      )}
    </div>
  );
};