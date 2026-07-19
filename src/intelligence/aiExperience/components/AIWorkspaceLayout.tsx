import React from 'react';
import { AIWorkspaceTab } from '../types/aiExperience';

export interface IAIWorkspaceLayoutProps {
  activeTab: AIWorkspaceTab;
  onTabChange: (tab: AIWorkspaceTab) => void;
  children: React.ReactNode;
}

/**
 * Presentation-only structural component for the AI Workspace Dashboard layout.
 * Enforces standardized navigation tab wrappers, visual state splits, and strict style isolate containment.
 */
export const AIWorkspaceLayout: React.FC<IAIWorkspaceLayoutProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  const tabs: Array<{ id: AIWorkspaceTab; label: string }> = [
    { id: 'SUMMARY', label: 'Intelligence Summaries' },
    { id: 'RECOMMENDATIONS', label: 'Directives & Explainability' },
    { id: 'PROMPT_BUILDER', label: 'External AI Sandbox Hub' }
  ];

  return (
    <div 
      className="hpo-ai-workspace" 
      style={{
        backgroundColor: '#121212',
        border: '1px solid #222',
        borderRadius: '8px',
        padding: '20px',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        marginTop: '20px'
      }}
    >
      {/* Workspace Header Banner Section */}
      <div 
        className="hpo-workspace-header" 
        style={{
          borderBottom: '1px solid #222',
          paddingBottom: '16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#00ff66' }}>
            NOEXCUSE Integrated AI Workspace
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#888' }}>
            Local Telemetry Engine Pipelines (PR4.1-PR4.8) Integration Control Panel
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#00ff66', border: '1px solid #00ff66', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,255,102,0.05)' }}>
          ● ENGINE STATUS: SECURE STABLE
        </div>
      </div>

      {/* Workspace Subphase Navigation Framework */}
      <div 
        className="hpo-workspace-tabs" 
        style={{
          display: 'flex',
          gap: '4px',
          backgroundColor: '#1c1c1c',
          padding: '4px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: isActive ? '#262626' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: isActive ? '#00ff66' : '#888',
                fontWeight: isActive ? 600 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = '#bbb';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = '#888';
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Structural Workspace Child Slot Component Boundary Container */}
      <div 
        className="hpo-workspace-body"
        style={{
          backgroundColor: '#161616',
          border: '1px solid #242424',
          borderRadius: '6px',
          padding: '20px',
          minHeight: '350px'
        }}
      >
        {children}
      </div>
    </div>
  );
};\n