/**
 * NOEXCUSE HPO V2: PR4.9 AI Experience Layer Domain Types
 */

export type AIWorkspaceTab = 'SUMMARY' | 'RECOMMENDATIONS' | 'PROMPT_BUILDER';

export interface IAIWorkspaceState {
  activeTab: AIWorkspaceTab;
  isPreviewingPrompt: boolean;
  selectedReportType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  isExporting: boolean;
}

export interface IAIWorkspaceController {
  getState(): IAIWorkspaceState;
  setActiveTab(tab: AIWorkspaceTab): void;
  setReportType(type: 'DAILY' | 'WEEKLY' | 'MONTHLY'): void;
  togglePromptPreview(): void;
  exportPromptAsFile(promptText: string, filename: string): Promise<boolean>;
}

export interface IFileExporter {
  exportTxt(content: string, filename: string): boolean;
}\n