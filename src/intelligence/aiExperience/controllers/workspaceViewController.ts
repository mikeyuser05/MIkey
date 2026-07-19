import { IAIWorkspaceState, IAIWorkspaceController, AIWorkspaceTab, IFileExporter } from '../types/aiExperience';

/**
 * Pure architectural controller managing UI state transitions for the AI Workspace.
 * Keeps business logic entirely separated from presentation-only React components.
 */
export class WorkspaceViewController implements IAIWorkspaceController {
  private state: IAIWorkspaceState;
  private fileExporter: IFileExporter;
  private stateListener: ((state: IAIWorkspaceState) => void) | null = null;

  constructor(fileExporter?: IFileExporter) {
    this.state = {
      activeTab: 'SUMMARY',
      isPreviewingPrompt: false,
      selectedReportType: 'DAILY',
      isExporting: false
    };
    
    // Fallback file exporter using pure browser anchor tricks
    this.fileExporter = fileExporter || {
      exportTxt: (content: string, filename: string): boolean => {
        try {
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return true;
        } catch {
          return false;
        }
      }
    };
  }

  public registerStateListener(listener: (state: IAIWorkspaceState) => void): void {
    this.stateListener = listener;
    this.stateListener({ ...this.state });
  }

  private updateState(updates: Partial<IAIWorkspaceState>): void {
    this.state = { ...this.state, ...updates };
    if (this.stateListener) {
      this.stateListener({ ...this.state });
    }
  }

  public getState(): IAIWorkspaceState {
    return { ...this.state };
  }

  public setActiveTab(tab: AIWorkspaceTab): void {
    this.updateState({ activeTab: tab });
  }

  public setReportType(type: 'DAILY' | 'WEEKLY' | 'MONTHLY'): void {
    this.updateState({ selectedReportType: type });
  }

  public togglePromptPreview(): void {
    this.updateState({ isPreviewingPrompt: !this.state.isPreviewingPrompt });
  }

  public async exportPromptAsFile(promptText: string, filename: string): Promise<boolean> {
    if (!promptText || promptText.trim().length === 0) {
      return false;
    }
    this.updateState({ isExporting: true });
    const success = this.fileExporter.exportTxt(promptText, filename);
    this.updateState({ isExporting: false });
    return success;
  }
}