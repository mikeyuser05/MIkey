import React, { useState, useEffect } from 'react';
import { AIWorkspaceLayout } from './AIWorkspaceLayout';
import { AISummaryViewer, IAISummaryData } from './AISummaryViewer';
import { RecommendationExplainabilityPanel, IRecommendationPayload, IExplainableAIPayload } from './RecommendationExplainabilityPanel';
import { PromptPreviewPanel } from './PromptPreviewPanel';
import { AIProviderSelectionPanel, AIProviderType } from './AIProviderSelectionPanel';
import { WorkspaceViewController } from '../controllers/workspaceViewController';
import { IAIWorkspaceState } from '../types/aiExperience';
import { createAIIntegrationController } from '../../aiIntegration/engine/aiIntegratorHooks';
import { PromptBuilder } from '../../aiIntegration/engine/promptBuilder';
import { ContextBuilder } from '../../aiIntegration/engine/contextBuilder';

export interface IAIIntegratedWorkspaceHubProps {
  recommendationPayload: IRecommendationPayload;
  explainablePayload: IExplainableAIPayload;
  dailyReportPayload: IAISummaryData;
  weeklyReportPayload: IAISummaryData;
  monthlyReportPayload: IAISummaryData;
  onToastMessage: (msg: string) => void;
}

/**
 * High-performance state integration hub coordinating UI controllers with isolated execution hooks.
 * Maintains zero core business logic within the presentation layout, acting purely as an orchestration layer.
 */
export const AIIntegratedWorkspaceHub: React.FC<IAIIntegratedWorkspaceHubProps> = ({
  recommendationPayload,
  explainablePayload,
  dailyReportPayload,
  weeklyReportPayload,
  monthlyReportPayload,
  onToastMessage
}) => {
  // Instantiate ViewController instance to drive layout adjustments deterministically
  const [viewController] = useState(() => new WorkspaceViewController());
  const [viewState, setViewState] = useState<IAIWorkspaceState>(() => viewController.getState());

  // Listen to pure state changes flowing down from the controller
  useEffect(() => {
    viewController.registerStateListener((updatedState: IAIWorkspaceState) => {
      setViewState(updatedState);
    });
  }, [viewController]);

  // Hook up the underlying infrastructure integration controllers from PR4.8
  const integrationController = createAIIntegrationController({
    recommendationPayload,
    reportPayload: viewState.selectedReportType === 'DAILY' 
      ? dailyReportPayload 
      : viewState.selectedReportType === 'WEEKLY' 
        ? weeklyReportPayload 
        : monthlyReportPayload,
    onNotify: (msg: string) => onToastMessage(msg)
  });

  // Calculate standard preview text parameters dynamically using low-level deterministic engines
  const currentActiveReport = viewState.selectedReportType === 'DAILY' 
    ? dailyReportPayload 
    : viewState.selectedReportType === 'WEEKLY' 
      ? weeklyReportPayload 
      : monthlyReportPayload;

  const promptBuilder = new PromptBuilder();
  const compiledPromptText = promptBuilder.buildPrompt(
    ContextBuilder.assembleContext(recommendationPayload, currentActiveReport)
  );

  const handleProviderDispatch = async (providerId: AIProviderType) => {
    await integrationController.handleProviderSelection(providerId as any);
  };

  const handleExportFileDispatch = async () => {
    const filename = `NOEXCUSE_HPO_V2_${viewState.selectedReportType}_INTELLIGENCE_SNAPSHOT.txt`;
    await viewController.exportPromptAsFile(compiledPromptText, filename);
  };

  return (
    <AIWorkspaceLayout 
      activeTab={viewState.activeTab} 
      onTabChange={(tab) => viewController.setActiveTab(tab)}
    >
      {viewState.activeTab === 'SUMMARY' && (
        <AISummaryViewer
          selectedType={viewState.selectedReportType}
          onTypeChange={(type) => viewController.setReportType(type)}
          summaryData={currentActiveReport}
        />
      )}

      {viewState.activeTab === 'RECOMMENDATIONS' && (
        <RecommendationExplainabilityPanel
          recommendationData={recommendationPayload}
          explainableData={explainablePayload}
        />
      )}

      {viewState.activeTab === 'PROMPT_BUILDER' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <PromptPreviewPanel
            promptText={compiledPromptText}
            isPreviewing={viewState.isPreviewingPrompt}
            isExporting={viewState.isExporting}
            onTogglePreview={() => viewController.togglePromptPreview()}
            onCopyPrompt={() => integrationController.handleProviderSelection('CHATGPT' as any)}
            onExportPrompt={handleExportFileDispatch}
          />
          
          <AIProviderSelectionPanel 
            onSelectProvider={handleProviderDispatch}
            isProcessing={viewState.isExporting}
          />
        </div>
      )}
    </AIWorkspaceLayout>
  );
};\n