import React from 'react';

export type AIProviderType = 'CHATGPT' | 'GEMINI' | 'CLAUDE';

export interface IAIProviderItem {
  id: AIProviderType;
  name: string;
  description: string;
  badgeText: string;
}

export interface IAIProviderSelectionPanelProps {
  onSelectProvider: (providerId: AIProviderType) => void;
  isProcessing?: boolean;
}

/**
 * Presentation-only component rendering external AI vendor routing cards.
 * Provides explicit launch vector triggers for ChatGPT, Gemini, and Claude platform interfaces.
 */
export const AIProviderSelectionPanel: React.FC<IAIProviderSelectionPanelProps> = ({
  onSelectProvider,
  isProcessing = false
}) => {
  const providers: IAIProviderItem[] = [
    {
      id: 'CHATGPT',
      name: 'OpenAI ChatGPT',
      description: 'Redirects context to OpenAI conversational processing environment.',
      badgeText: 'gpt-4o default optimized'
    },
    {
      id: 'GEMINI',
      name: 'Google Gemini',
      description: 'Dispatches aggregated telemetry frames into the Google Advanced sandbox ecosystem.',
      badgeText: 'gemini-1.5 multimodal native'
    },
    {
      id: 'CLAUDE',
      name: 'Anthropic Claude',
      description: 'Instantiates analytical structural data within Anthropic long-context pipelines.',
      badgeText: 'claude-3.5 sonnet compliant'
    }
  ];

  return (
    <div className="hpo-provider-selection" style={{ color: '#fff', fontFamily: 'system-ui, sans-serif', marginTop: '20px' }}>
      <div style={{ borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#00ff66' }}>
          Select External AI Launch Vector Destination
        </h4>
        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#888' }}>
          Executing a card copies compiled prompt payloads to your clipboard buffer before deep-linking.
        </p>
      </div>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '14px' 
        }}
      >
        {providers.map((prov) => (
          <div
            key={prov.id}
            onClick={() => !isProcessing && onSelectProvider(prov.id)}
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '16px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease-in-out',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '130px',
              opacity: isProcessing ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isProcessing) {
                e.currentTarget.style.borderColor = '#00ff66';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,255,102,0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isProcessing) {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#fff' }}>{prov.name}</strong>
                <span style={{ fontSize: '9px', color: '#888', backgroundColor: '#262626', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace' }}>
                  {prov.id}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#aaa', lineHeight: '1.4' }}>
                {prov.description}
              </p>
            </div>
            
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #242424', paddingTop: '8px' }}>
              <span style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>
                {prov.badgeText}
              </span>
              <span style={{ fontSize: '12px', color: '#00ff66' }}>&rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};\n