'use client';

import { getAppStateStore } from './app-state-store';

export type WorkflowActionType = 
  | 'move' 
  | 'click' 
  | 'doubleClick' 
  | 'type' 
  | 'wait' 
  | 'drag' 
  | 'moveToDock' 
  | 'moveToApp'
  | 'typeInApp'        // Type in a specific app input
  | 'selectCell'       // Select spreadsheet cell
  | 'sendMessage'      // Send message in Messages app
  | 'sendEmail'        // Send email in Gmail
  | 'executeCommand';  // Execute terminal command

export interface WorkflowAction {
  type: WorkflowActionType;
  target?: string; // Element selector or app ID
  position?: { x: number; y: number }; // Absolute position
  text?: string; // For typing
  duration?: number; // For wait actions (ms)
  speed?: number; // Typing speed (ms per character)
  appId?: string; // For app-specific actions
  data?: any; // Additional data for complex actions
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  actions: WorkflowAction[];
}

interface AgentState {
  x: number;
  y: number;
  isClicking: boolean;
  isTyping: boolean;
  workflowName: string;
}

export class AgentController {
  private state: AgentState = {
    x: 0,
    y: 0,
    isClicking: false,
    isTyping: false,
    workflowName: ''
  };
  
  private updateCallback?: (state: AgentState) => void;
  private containerRef?: HTMLElement;
  private isRunning = false;
  private appStateStore = getAppStateStore();
  
  constructor() {}
  
  setContainer(container: HTMLElement) {
    this.containerRef = container;
  }
  
  onUpdate(callback: (state: AgentState) => void) {
    this.updateCallback = callback;
  }
  
  private updateState(updates: Partial<AgentState>) {
    this.state = { ...this.state, ...updates };
    this.updateCallback?.(this.state);
  }
  
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private getElementPosition(selector: string): { x: number; y: number } | null {
    if (!this.containerRef) return null;
    
    const element = this.containerRef.querySelector(selector);
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    const containerRect = this.containerRef.getBoundingClientRect();
    
    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2
    };
  }
  
  private async moveTo(x: number, y: number, duration: number = 1000): Promise<void> {
    const startX = this.state.x;
    const startY = this.state.y;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-in-out cubic
      const easeProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      const currentX = startX + (x - startX) * easeProgress;
      const currentY = startY + (y - startY) * easeProgress;
      
      this.updateState({ x: currentX, y: currentY });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    return new Promise(resolve => {
      animate();
      setTimeout(resolve, duration);
    });
  }
  
  private async simulateClick(): Promise<void> {
    this.updateState({ isClicking: true });
    await this.sleep(150);
    this.updateState({ isClicking: false });
    await this.sleep(150);
  }
  
  private async simulateTyping(text: string, speed: number = 80): Promise<void> {
    this.updateState({ isTyping: true });
    
    // Simulate typing by waiting
    const typingDuration = text.length * speed;
    await this.sleep(typingDuration);
    
    this.updateState({ isTyping: false });
  }
  
  async executeWorkflow(workflow: Workflow, callbacks?: {
    onAppOpen?: (appId: string) => void;
    onType?: (selector: string, text: string) => void;
    onAppClick?: (appId: string) => void;
  }): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.updateState({ workflowName: workflow.name });
    
    for (const action of workflow.actions) {
      if (!this.isRunning) break;
      
      switch (action.type) {
        case 'move':
          if (action.position) {
            await this.moveTo(action.position.x, action.position.y);
          } else if (action.target) {
            const pos = this.getElementPosition(action.target);
            if (pos) await this.moveTo(pos.x, pos.y);
          }
          break;
          
        case 'moveToApp':
          if (action.target) {
            // Move to desktop app icon
            const selector = `[data-app-id="${action.target}"]`;
            const pos = this.getElementPosition(selector);
            if (pos) await this.moveTo(pos.x, pos.y);
          }
          break;
          
        case 'moveToDock':
          if (action.target) {
            // Move to dock app icon
            const selector = `[data-dock-app-id="${action.target}"]`;
            const pos = this.getElementPosition(selector);
            if (pos) await this.moveTo(pos.x, pos.y);
          }
          break;
          
        case 'click':
          await this.simulateClick();
          if (action.target && callbacks?.onAppClick) {
            callbacks.onAppClick(action.target);
          }
          break;
          
        case 'doubleClick':
          await this.simulateClick();
          await this.sleep(100);
          await this.simulateClick();
          if (action.target && callbacks?.onAppOpen) {
            callbacks.onAppOpen(action.target);
          }
          break;
          
        case 'type':
          if (action.text) {
            await this.simulateTyping(action.text, action.speed);
            if (action.target && callbacks?.onType) {
              callbacks.onType(action.target, action.text);
            }
          }
          break;
          
        case 'wait':
          await this.sleep(action.duration || 1000);
          break;
          
        case 'drag':
          // TODO: Implement drag functionality
          break;
          
        case 'typeInApp':
          if (action.appId && action.text) {
            await this.simulateTyping(action.text, action.speed);
            // Update app state based on app type
            this.handleAppContentUpdate(action.appId, action.text, action.target);
          }
          break;
          
        case 'selectCell':
          if (action.target) {
            const pos = this.getElementPosition(`[data-cell-id="${action.target}"]`);
            if (pos) {
              await this.moveTo(pos.x, pos.y);
              await this.simulateClick();
              this.appStateStore.selectCell(action.target);
            }
          }
          break;
          
        case 'sendMessage':
          if (action.data?.conversationId && action.text) {
            const message = {
              id: Date.now().toString(),
              sender: 'AI Agent',
              content: action.text,
              timestamp: new Date(),
              isFromAgent: true
            };
            this.appStateStore.sendMessage(action.data.conversationId, message);
          }
          break;
          
        case 'sendEmail':
          if (action.data?.email) {
            const email = {
              id: Date.now().toString(),
              from: 'agent@emergentlabs.ai',
              subject: action.data.email.subject || '',
              body: action.data.email.body || '',
              timestamp: new Date(),
              isRead: false
            };
            this.appStateStore.sendEmail(email);
          }
          break;
          
        case 'executeCommand':
          if (action.text) {
            // Simulate command output based on command
            const output = this.simulateTerminalCommand(action.text);
            this.appStateStore.executeCommand(action.text, output);
          }
          break;
      }
      
      // Small delay between actions for realism
      await this.sleep(300);
    }
    
    this.isRunning = false;
  }
  
  private handleAppContentUpdate(appId: string, text: string, target?: string): void {
    switch (appId) {
      case 'gmail':
        if (target === 'subject') {
          this.appStateStore.updateComposingEmail({ subject: text });
        } else if (target === 'body') {
          this.appStateStore.updateComposingEmail({ body: text });
        } else if (target === 'to') {
          this.appStateStore.updateComposingEmail({ to: text } as any);
        }
        break;
        
      case 'numbers':
        if (target) {
          this.appStateStore.updateCell(target, text);
        }
        break;
        
      case 'textedit':
        this.appStateStore.updateDocument('default', text);
        break;
        
      case 'messages':
        this.appStateStore.updateComposingMessage(text);
        break;
        
      case 'notes':
        if (this.appStateStore.getState().notes.selectedNoteId) {
          this.appStateStore.updateNote(
            this.appStateStore.getState().notes.selectedNoteId,
            text
          );
        }
        break;
    }
  }
  
  private simulateTerminalCommand(command: string): string {
    // Simulate some common command outputs
    if (command === 'ls') {
      return 'agent-controller.ts  app-state-store.ts  utils.ts';
    } else if (command === 'pwd') {
      return '/Users/agent/projects/emergent-labs';
    } else if (command.startsWith('cd ')) {
      return ''; // cd doesn't output anything
    } else if (command === 'python analyze_data.py') {
      return `Analyzing data...
Processing 1000 records...
Analysis complete:
- Average performance: 87.3%
- Peak efficiency: 95.2%
- Optimization potential: 12.7%`;
    } else if (command.startsWith('echo ')) {
      return command.substring(5);
    } else {
      return `${command}: command executed successfully`;
    }
  }
  
  stop() {
    this.isRunning = false;
  }
  
  reset() {
    this.stop();
    this.updateState({
      x: 0,
      y: 0,
      isClicking: false,
      isTyping: false,
      workflowName: ''
    });
  }
}