'use client';

export type WorkflowActionType = 'move' | 'click' | 'doubleClick' | 'type' | 'wait' | 'drag' | 'moveToDock' | 'moveToApp';

export interface WorkflowAction {
  type: WorkflowActionType;
  target?: string; // Element selector or app ID
  position?: { x: number; y: number }; // Absolute position
  text?: string; // For typing
  duration?: number; // For wait actions (ms)
  speed?: number; // Typing speed (ms per character)
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
      }
      
      // Small delay between actions for realism
      await this.sleep(300);
    }
    
    this.isRunning = false;
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