import React from 'react';
import { AIProviderType, IProviderConfig } from '../types/aiIntegration';

export interface IAIIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: IProviderConfig[];
  onSelectProvider: (providerId: AIProviderType) => void;
  isProcessing?: boolean;
}

/**
 * Presentation-only, stateless React component for the AI Provider Selection Dashboard Interface.
 * Adheres strictly to layout rules: zero internal state, pure UI styling rendering, and isolated event bubbling.
 */
export const AIIntegrationModal: React.FC<IAIIntegrationModalProps> = ({
  isOpen,
  onClose,
  providers,
  onSelectProvider,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="hpo-modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5000,
        backdropFilter: 'blur(4px)'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
    >
      <div 
        className="hpo-modal-container"
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '24px',
          width: '420px',
          maxWidth: '90%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div 
          className="hpo-modal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid #222',
            paddingBottom: '12px'
          }}
        >
          <h3 
            id="ai-modal-title" 
            style={{ margin: 0, fontSize: '18px', fontWeight: 600, letterSpacing: '0.5px' }}
          >
            NOEXCUSE External AI Analytics Routing
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '20px',
              padding: '4px'
            }}
            aria-label="Close dialog window"
          >
            &times;
          </button>
        </div>

        <p style={{ fontSize: '14px', color: '#aaa', lineHeight: '1.5', marginBottom: '20px' }}>
          Select an AI provider destination platform below. The system will compile a deterministic analytical summary 
          payload from local engine states, securely copy it to your clipboard context, and redirect you to the chosen interface sandbox.
        </p>

        <div className="hpo-provider-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {providers.map((provider) => (
            <button
              key={provider.id}
              disabled={isProcessing}
              onClick={() => onSelectProvider(provider.id)}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#242424',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 500,
                textAlign: 'left',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s, border-color 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = '#2c2c2c';
                  e.currentTarget.style.borderColor = '#00ff66';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = '#242424';
                  e.currentTarget.style.borderColor = '#444';
                }
              }}
            >
              <span>{provider.name}</span>
              <span style={{ fontSize: '12px', color: '#888' }}>Launch Vector &rarr;</span>
            </button>
          ))}
        </div>

        <div 
          className="hpo-modal-footer"
          style={{
            marginTop: '24px',
            borderTop: '1px solid #222',
            paddingTop: '12px',
            textAlign: 'right'
          }}
        >
          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#aaa',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};\n