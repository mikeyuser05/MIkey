import React from 'react';

export interface IPromptPreviewPanelProps {
  promptText: string;
  isPreviewing: boolean;
  isExporting: boolean;
  onTogglePreview: () => void;
  onCopyPrompt: () => void;
  onExportPrompt: () => void;
}

/**
 * Presentation-only component responsible for rendering raw prompt previews,
 * clipboard interaction hooks, and local file exports.
 */
export const PromptPreviewPanel: React.FC<IPromptPreviewPanelProps> = ({
  promptText,
  isPreviewing,
  isExporting,
  onTogglePreview,
  onCopyPrompt,
  onExportPrompt
}) => {
  return (
    <div className="hpo-prompt-preview-panel" style={{ color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Control Action Header Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#1a1a1a',
          border: '1px solid #222',
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '16px'
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>AI Prompt Pipeline Compilation</h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#666' }}>
            Deterministic context formatting for external LLM parsing operations
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onTogglePreview}
            style={{
              padding: '6px 12px',
              backgroundColor: isPreviewing ? '#262626' : 'transparent',
              border: '1px solid #444',
              borderRadius: '4px',
              color: isPreviewing ? '#00ff66' : '#aaa',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {isPreviewing ? 'Hide Context Preview' : 'Show Context Preview'}
          </button>
          
          <button
            onClick={onCopyPrompt}
            style={{
              padding: '6px 12px',
              backgroundColor: '#00ff66',
              border: 'none',
              borderRadius: '4px',
              color: '#000',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00cc55'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00ff66'}
          >
            Copy Clipboard Payload
          </button>
          
          <button
            onClick={onExportPrompt}
            disabled={isExporting}
            style={{
              padding: '6px 12px',
              backgroundColor: '#1c1c1c',
              border: '1px solid #333',
              borderRadius: '4px',
              color: isExporting ? '#555' : '#fff',
              fontSize: '12px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {isExporting ? 'Exporting...' : 'Export Raw TXT'}
          </button>
        </div>
      </div>

      {/* Conditional Collapsible Markdown Preview View Box */}
      {isPreviewing && (
        <div 
          style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid #222',
            borderRadius: '6px',
            padding: '16px',
            position: 'relative'
          }}
        >
          <span 
            style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '12px', 
              fontSize: '10px', 
              color: '#444', 
              textTransform: 'uppercase',
              fontFamily: 'monospace' 
            }}
          >
            IMMUTABLE BUFFER LOOKAHEAD
          </span>
          <pre 
            style={{
              margin: 0,
              fontSize: '12px',
              color: '#ccc',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              lineHeight: '1.6',
              maxHeight: '300px',
              overflowY: 'auto',
              paddingRight: '10px'
            }}
          >
            {promptText}
          </pre>
        </div>
      )}
    </div>
  );
};\n