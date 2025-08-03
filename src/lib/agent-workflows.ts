import { Workflow } from './agent-controller';

export const DEMO_WORKFLOWS: Workflow[] = [
  {
    id: 'research-workflow',
    name: 'Research Assistant',
    description: 'Gather data from web and organize in spreadsheet',
    actions: [
      // Open Safari from dock
      { type: 'moveToDock', target: 'safari' },
      { type: 'wait', duration: 500 },
      { type: 'click', target: 'safari' },
      { type: 'wait', duration: 2000 },
      
      // Simulate searching
      { type: 'move', position: { x: 400, y: 200 } },
      { type: 'click' },
      { type: 'type', text: 'emergent labs AI agents', speed: 60 },
      { type: 'wait', duration: 1500 },
      
      // Open spreadsheet
      { type: 'moveToApp', target: 'numbers' },
      { type: 'wait', duration: 500 },
      { type: 'doubleClick', target: 'numbers' },
      { type: 'wait', duration: 1500 },
      
      // Click on cell A1
      { type: 'move', target: '[data-cell-id="A1"]' },
      { type: 'click' },
      { type: 'type', text: 'Company', speed: 80 },
      { type: 'wait', duration: 300 },
      
      // Move to B1
      { type: 'move', target: '[data-cell-id="B1"]' },
      { type: 'click' },
      { type: 'type', text: 'AI Focus', speed: 80 },
      { type: 'wait', duration: 300 },
      
      // Add data
      { type: 'move', target: '[data-cell-id="A2"]' },
      { type: 'click' },
      { type: 'type', text: 'Emergent Labs', speed: 80 },
      { type: 'wait', duration: 300 },
      
      { type: 'move', target: '[data-cell-id="B2"]' },
      { type: 'click' },
      { type: 'type', text: 'Autonomous Agents', speed: 80 },
      { type: 'wait', duration: 1000 },
    ]
  },
  
  {
    id: 'content-creation',
    name: 'Content Creator',
    description: 'Write and format a document',
    actions: [
      // Open TextEdit
      { type: 'moveToApp', target: 'textedit' },
      { type: 'wait', duration: 500 },
      { type: 'doubleClick', target: 'textedit' },
      { type: 'wait', duration: 1500 },
      
      // Start typing
      { type: 'move', position: { x: 400, y: 300 } },
      { type: 'click' },
      { type: 'type', text: 'The Future of AI Agents', speed: 70 },
      { type: 'wait', duration: 500 },
      
      // Format title (select and bold)
      { type: 'move', target: '[data-format-bold]' },
      { type: 'click' },
      { type: 'wait', duration: 300 },
      
      // Continue writing
      { type: 'move', position: { x: 400, y: 350 } },
      { type: 'click' },
      { type: 'type', text: '\\n\\nAI agents are transforming how we work...', speed: 60 },
      { type: 'wait', duration: 1000 },
    ]
  },
  
  {
    id: 'data-analysis',
    name: "Hari's Workflow",
    description: 'Analyze data across multiple apps',
    actions: [
      // Open Terminal
      { type: 'moveToDock', target: 'terminal' },
      { type: 'wait', duration: 500 },
      { type: 'click', target: 'terminal' },
      { type: 'wait', duration: 1500 },
      
      // Type command
      { type: 'move', position: { x: 400, y: 300 } },
      { type: 'click' },
      { type: 'type', text: 'python analyze_data.py', speed: 50 },
      { type: 'wait', duration: 1000 },
      
      // Open Notes
      { type: 'moveToApp', target: 'notes' },
      { type: 'wait', duration: 500 },
      { type: 'doubleClick', target: 'notes' },
      { type: 'wait', duration: 1500 },
      
      // Take notes
      { type: 'move', position: { x: 400, y: 250 } },
      { type: 'click' },
      { type: 'type', text: 'Analysis Results:\\n- Data shows 45% improvement\\n- Key metrics trending up', speed: 65 },
      { type: 'wait', duration: 1500 },
      
      // Back to spreadsheet
      { type: 'moveToDock', target: 'numbers' },
      { type: 'click', target: 'numbers' },
      { type: 'wait', duration: 1000 },
    ]
  },
  
  {
    id: 'communication-workflow',
    name: 'Team Coordinator',
    description: 'Check calendar and send messages',
    actions: [
      // Open Calendar
      { type: 'moveToApp', target: 'calendar' },
      { type: 'wait', duration: 500 },
      { type: 'doubleClick', target: 'calendar' },
      { type: 'wait', duration: 2000 },
      
      // Check schedule
      { type: 'move', position: { x: 500, y: 300 } },
      { type: 'wait', duration: 1000 },
      
      // Open Messages
      { type: 'moveToApp', target: 'messages' },
      { type: 'wait', duration: 500 },
      { type: 'doubleClick', target: 'messages' },
      { type: 'wait', duration: 1500 },
      
      // Type message
      { type: 'move', position: { x: 400, y: 400 } },
      { type: 'click' },
      { type: 'type', text: 'Team meeting at 3pm today!', speed: 70 },
      { type: 'wait', duration: 1000 },
      
      // Open Mail
      { type: 'moveToDock', target: 'mail' },
      { type: 'click', target: 'mail' },
      { type: 'wait', duration: 1500 },
    ]
  }
];