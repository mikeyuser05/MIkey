import React from 'react';

export interface IActionRecommendation {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  actionItem: string;
  rationale: string;
}

export interface IRecommendationPayload {
  primaryActionCode: string;
  recommendations: IActionRecommendation[];
}

export interface IExplainableAIPayload {
  targetRecommendationCode: string;
  underlyingDirectives: string[];
  systemLogicJustification: string;
}

export interface IRecommendationExplainabilityPanelProps {
  recommendationData: IRecommendationPayload | null;
  explainableData: IExplainableAIPayload | null;
}

/**
 * Presentation-only component displaying systemic directives, action strategies,
 * and high-context local Explainable AI (XAI) deep-dive rationales.
 */
export const RecommendationExplainabilityPanel: React.FC<IRecommendationExplainabilityPanelProps> = ({
  recommendationData,
  explainableData
}) => {
  
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return { color: '#ff3333', border: '1px solid #ff3333', backgroundColor: 'rgba(255,51,51,0.05)' };
      case 'HIGH':
        return { color: '#ffaa00', border: '1px solid #ffaa00', backgroundColor: 'rgba(255,170,0,0.05)' };
      case 'MEDIUM':
        return { color: '#00bfff', border: '1px solid #00bfff', backgroundColor: 'rgba(0,191,255,0.05)' };
      default:
        return { color: '#888', border: '1px solid #444', backgroundColor: 'rgba(24,24,24,0.5)' };
    }
  };

  return (
    <div className="hpo-directives-panel" style={{ color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Upper Grid Split: Recommendations and Explainability Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Left Column: Local Engine Optimization Recommendations */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #222', borderRadius: '6px', padding: '16px' }}>
          <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '14px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#00ff66' }}>
              Optimization Directives (PR4.4)
            </h4>
            {recommendationData && (
              <span style={{ fontSize: '11px', color: '#666', display: 'block', marginTop: '2px' }}>
                Primary Code Cluster: <code>{recommendationData.primaryActionCode}</code>
              </span>
            )}
          </div>

          {!recommendationData || recommendationData.recommendations.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#555', textAlign: 'center', padding: '20px 0' }}>
              No active operational optimizations issued by local telemetry blocks.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommendationData.recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  style={{ 
                    backgroundColor: '#222', 
                    border: '1px solid #2d2d2d', 
                    borderRadius: '4px', 
                    padding: '12px' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '14px', color: '#fff' }}>{rec.actionItem}</strong>
                    <span 
                      style={{ 
                        fontSize: '10px', 
                        padding: '2px 6px', 
                        borderRadius: '3px', 
                        fontWeight: 600,
                        ...getPriorityStyle(rec.priority)
                      }}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#aaa', lineHeight: '1.4' }}>
                    {rec.rationale}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Local Explainable AI Traceability Layer */}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #222', borderRadius: '6px', padding: '16px' }}>
          <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '14px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#00bfff' }}>
              Explainable AI Evidence Tree (PR4.5)
            </h4>
            <span style={{ fontSize: '11px', color: '#666', display: 'block', marginTop: '2px' }}>
              Trace Validation Pipeline Justification
            </span>
          </div>

          {!explainableData ? (
            <p style={{ fontSize: '13px', color: '#555', textAlign: 'center', padding: '20px 0' }}>
              No analytical trace logs populated for active context validation metrics.
            </p>
          ) : (
            <div>
              {/* Strategic Risk Framework Directives */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', color: '#666', uppercase: true, display: 'block', marginBottom: '6px' }}>
                  Systemic Constraints & Hazards
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {explainableData.underlyingDirectives.map((dir, dIdx) => (
                    <div 
                      key={dIdx} 
                      style={{ 
                        fontSize: '12px', 
                        color: '#ffdd77', 
                        backgroundColor: 'rgba(255,221,119,0.04)',
                        borderLeft: '2px solid #ffdd77',
                        padding: '6px 10px',
                        borderRadius: '0 4px 4px 0'
                      }}
                    >
                      {dir}
                    </div>
                  ))}
                </div>
              </div>

              {/* Underlying System Rationale Log */}
              <div>
                <span style={{ fontSize: '11px', color: '#666', uppercase: true, display: 'block', marginBottom: '6px' }}>
                  Mathematical & Core Inductive Logic
                </span>
                <blockquote 
                  style={{ 
                    margin: 0, 
                    backgroundColor: '#141414', 
                    border: '1px dashed #333', 
                    borderRadius: '4px', 
                    padding: '12px',
                    fontSize: '12px',
                    color: '#ccc',
                    lineHeight: '1.5',
                    fontFamily: 'monospace'
                  }}
                >
                  {explainableData.systemLogicJustification}
                </blockquote>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};\n