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
      
      // Select and fill cells with actual data
      { type: 'selectCell', target: 'A1' },
      { type: 'typeInApp', appId: 'numbers', target: 'A1', text: 'Company', speed: 80 },
      { type: 'wait', duration: 300 },
      
      { type: 'selectCell', target: 'B1' },
      { type: 'typeInApp', appId: 'numbers', target: 'B1', text: 'AI Focus', speed: 80 },
      { type: 'wait', duration: 300 },
      
      { type: 'selectCell', target: 'C1' },
      { type: 'typeInApp', appId: 'numbers', target: 'C1', text: 'Funding', speed: 80 },
      { type: 'wait', duration: 300 },
      
      // Add actual company data
      { type: 'selectCell', target: 'A2' },
      { type: 'typeInApp', appId: 'numbers', target: 'A2', text: 'Emergent Labs', speed: 80 },
      { type: 'wait', duration: 300 },
      
      { type: 'selectCell', target: 'B2' },
      { type: 'typeInApp', appId: 'numbers', target: 'B2', text: 'Autonomous Agents', speed: 80 },
      { type: 'wait', duration: 300 },
      
      { type: 'selectCell', target: 'C2' },
      { type: 'typeInApp', appId: 'numbers', target: 'C2', text: '$5M Series A', speed: 80 },
      { type: 'wait', duration: 300 },
      
      // Add more rows
      { type: 'selectCell', target: 'A3' },
      { type: 'typeInApp', appId: 'numbers', target: 'A3', text: 'OpenAI', speed: 80 },
      { type: 'wait', duration: 300 },
      
      { type: 'selectCell', target: 'B3' },
      { type: 'typeInApp', appId: 'numbers', target: 'B3', text: 'General AI', speed: 80 },
      { type: 'wait', duration: 300 },
      
      { type: 'selectCell', target: 'C3' },
      { type: 'typeInApp', appId: 'numbers', target: 'C3', text: '$13B+', speed: 80 },
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
      
      // Start typing document
      { type: 'move', position: { x: 400, y: 300 } },
      { type: 'click' },
      { type: 'typeInApp', appId: 'textedit', text: 'The Future of AI Agents\n\n', speed: 70 },
      { type: 'wait', duration: 500 },
      
      // Format title (simulate bold button click)
      { type: 'move', target: '[data-format-bold]' },
      { type: 'click' },
      { type: 'wait', duration: 300 },
      
      // Continue writing the document
      { type: 'typeInApp', appId: 'textedit', text: 'AI agents are transforming how we work by automating complex tasks across multiple applications. These intelligent systems can:\n\n• Navigate between different software applications\n• Extract and analyze data\n• Generate reports and insights\n• Communicate findings to team members\n\nAt Emergent Labs, we\'re building the next generation of autonomous agents that can handle entire workflows independently.', speed: 60 },
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
      
      // Execute analysis command
      { type: 'move', position: { x: 400, y: 300 } },
      { type: 'click' },
      { type: 'typeInApp', appId: 'terminal', text: 'python analyze_data.py', speed: 50 },
      { type: 'wait', duration: 500 },
      { type: 'executeCommand', text: 'python analyze_data.py' },
      { type: 'wait', duration: 2000 },
      
      // Open Notes
      { type: 'moveToApp', target: 'notes' },
      { type: 'wait', duration: 500 },
      { type: 'doubleClick', target: 'notes' },
      { type: 'wait', duration: 1500 },
      
      // Take notes about analysis
      { type: 'move', position: { x: 400, y: 250 } },
      { type: 'click' },
      { type: 'typeInApp', appId: 'notes', text: 'Analysis Results:\n\n- Data shows 45% improvement in agent efficiency\n- Key metrics trending up across all categories\n- Customer satisfaction increased by 32%\n- Processing time reduced by 68%\n\nRecommendations:\n1. Scale agent deployment to more workflows\n2. Implement advanced learning algorithms\n3. Expand to additional application integrations', speed: 65 },
      { type: 'wait', duration: 1500 },
      
      // Back to spreadsheet to update with results
      { type: 'moveToDock', target: 'numbers' },
      { type: 'click', target: 'numbers' },
      { type: 'wait', duration: 1000 },
      
      // Add analysis results to spreadsheet
      { type: 'selectCell', target: 'D1' },
      { type: 'typeInApp', appId: 'numbers', target: 'D1', text: 'Efficiency', speed: 80 },
      { type: 'wait', duration: 300 },
      
      { type: 'selectCell', target: 'D2' },
      { type: 'typeInApp', appId: 'numbers', target: 'D2', text: '95.2%', speed: 80 },
      { type: 'wait', duration: 300 },
      
      { type: 'selectCell', target: 'D3' },
      { type: 'typeInApp', appId: 'numbers', target: 'D3', text: '87.3%', speed: 80 },
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
      
      // Type and send message
      { type: 'move', position: { x: 400, y: 400 } },
      { type: 'click' },
      { type: 'typeInApp', appId: 'messages', text: 'Team meeting at 3pm today! Please confirm attendance.', speed: 70 },
      { type: 'wait', duration: 500 },
      { type: 'sendMessage', text: 'Team meeting at 3pm today! Please confirm attendance.', data: { type: 'message', conversationId: 'team' } },
      { type: 'wait', duration: 1000 },
      
      // Open Gmail
      { type: 'moveToDock', target: 'mail' },
      { type: 'click', target: 'mail' },
      { type: 'wait', duration: 1500 },
      
      // Compose email
      { type: 'move', position: { x: 300, y: 250 } },
      { type: 'click' },
      { type: 'wait', duration: 1000 },
      
      // Send meeting reminder email
      { type: 'sendEmail', data: { 
        type: 'email',
        email: {
          subject: 'Team Meeting Reminder - 3pm Today',
          body: 'Hi team,\\n\\nThis is a reminder about our team meeting at 3pm today. We\'ll be discussing:\\n- Q4 roadmap\\n- AI agent integration progress\\n- Customer feedback\\n\\nSee you there!\\n\\nBest,\\nAI Agent'
        }
      }},
      { type: 'wait', duration: 1500 },
    ]
  }
];