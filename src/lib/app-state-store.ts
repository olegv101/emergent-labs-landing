'use client';

// Centralized store for all app states
// This keeps UIs as thin wrappers over data, following best practices

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isDraft?: boolean;
}

export interface SpreadsheetCell {
  value: string;
  formula?: string;
}

export interface TextDocument {
  content: string;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    align?: 'left' | 'center' | 'right' | 'justify';
  };
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isFromAgent?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
}

export interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
}

export interface AppState {
  gmail: {
    emails: EmailMessage[];
    selectedEmailId?: string;
    composing?: EmailMessage;
  };
  spreadsheet: {
    cells: Record<string, SpreadsheetCell>;
    selectedCell?: string;
  };
  textEdit: {
    documents: Record<string, TextDocument>;
    activeDocumentId: string;
  };
  messages: {
    conversations: Record<string, Message[]>;
    activeConversationId?: string;
    composingMessage?: string;
  };
  calendar: {
    events: CalendarEvent[];
    selectedDate: Date;
  };
  notes: {
    notes: Note[];
    selectedNoteId?: string;
  };
  terminal: {
    commands: TerminalCommand[];
    currentDirectory: string;
  };
}

// Initial state with some demo data
const initialState: AppState = {
  gmail: {
    emails: [
      {
        id: '1',
        from: 'team@emergentlabs.ai',
        to: 'user@emergentlabs.ai',
        subject: 'Welcome to Emergent Labs!',
        body: 'We are excited to have you on board.',
        timestamp: new Date(),
        isRead: false
      },
      {
        id: '2',
        from: 'research@ai-conference.com',
        to: 'user@emergentlabs.ai',
        subject: 'AI Conference 202y - Speaker Invitation',
        body: 'We would be honored to have you speak at our upcoming conference about autonomous agents.',
        timestamp: new Date(Date.now() - 7200000),
        isRead: true
      }
    ],
    selectedEmailId: undefined,
    composing: undefined
  },
  spreadsheet: {
    cells: {
      'A1': { value: 'Company' },
      'B1': { value: 'AI Focus' },
      'C1': { value: 'Founded' },
      'A2': { value: 'Emergent Labs' },
      'B2': { value: 'Autonomous Agents' },
      'C2': { value: '2023' }
    },
    selectedCell: undefined
  },
  textEdit: {
    documents: {
      'default': {
        content: '',
        formatting: {}
      }
    },
    activeDocumentId: 'default'
  },
  messages: {
    conversations: {
      'team': [
        {
          id: '1',
          sender: 'Alex',
          content: 'Hey, have you seen the new AI agent demo?',
          timestamp: new Date(Date.now() - 1800000),
          isFromAgent: false
        },
        {
          id: '2',
          sender: 'Sarah',
          content: 'Yes! It\'s incredible how it can manage multiple apps.',
          timestamp: new Date(Date.now() - 1200000),
          isFromAgent: false
        }
      ]
    },
    activeConversationId: 'team',
    composingMessage: undefined
  },
  calendar: {
    events: [
      {
        id: '1',
        title: 'AI Agent Demo',
        startTime: new Date(Date.now() + 3600000),
        endTime: new Date(Date.now() + 7200000),
        description: 'Demonstrating the new autonomous agent capabilities'
      }
    ],
    selectedDate: new Date()
  },
  notes: {
    notes: [
      {
        id: '1',
        title: 'Agent Architecture',
        content: 'Key components:\n- State management\n- Action execution\n- Multi-app coordination',
        lastModified: new Date()
      }
    ],
    selectedNoteId: undefined
  },
  terminal: {
    commands: [],
    currentDirectory: '~/projects/emergent-labs'
  }
};

// State management class
export class AppStateStore {
  private state: AppState = initialState;
  private listeners: Set<(state: AppState) => void> = new Set();

  getState(): AppState {
    return this.state;
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Gmail actions
  sendEmail(email: EmailMessage): void {
    this.state = {
      ...this.state,
      gmail: {
        ...this.state.gmail,
        emails: [email, ...this.state.gmail.emails],
        composing: undefined
      }
    };
    this.notify();
  }

  updateComposingEmail(email: Partial<EmailMessage>): void {
    this.state = {
      ...this.state,
      gmail: {
        ...this.state.gmail,
        composing: {
          ...(this.state.gmail.composing || {
            id: Date.now().toString(),
            from: 'agent@emergentlabs.ai',
            subject: '',
            body: '',
            timestamp: new Date(),
            isRead: false,
            isDraft: true
          }),
          ...email
        } as EmailMessage
      }
    };
    this.notify();
  }

  // Spreadsheet actions
  updateCell(cellId: string, value: string, formula?: string): void {
    this.state = {
      ...this.state,
      spreadsheet: {
        ...this.state.spreadsheet,
        cells: {
          ...this.state.spreadsheet.cells,
          [cellId]: { value, formula }
        },
        selectedCell: cellId
      }
    };
    this.notify();
  }

  selectCell(cellId: string): void {
    this.state = {
      ...this.state,
      spreadsheet: {
        ...this.state.spreadsheet,
        selectedCell: cellId
      }
    };
    this.notify();
  }

  // Text editor actions
  updateDocument(documentId: string, content: string): void {
    this.state = {
      ...this.state,
      textEdit: {
        ...this.state.textEdit,
        documents: {
          ...this.state.textEdit.documents,
          [documentId]: {
            ...this.state.textEdit.documents[documentId],
            content
          }
        }
      }
    };
    this.notify();
  }

  // Messages actions
  sendMessage(conversationId: string, message: Message): void {
    this.state = {
      ...this.state,
      messages: {
        ...this.state.messages,
        conversations: {
          ...this.state.messages.conversations,
          [conversationId]: [
            ...(this.state.messages.conversations[conversationId] || []),
            message
          ]
        },
        composingMessage: undefined
      }
    };
    this.notify();
  }

  updateComposingMessage(content: string): void {
    this.state = {
      ...this.state,
      messages: {
        ...this.state.messages,
        composingMessage: content
      }
    };
    this.notify();
  }

  // Calendar actions
  addEvent(event: CalendarEvent): void {
    this.state = {
      ...this.state,
      calendar: {
        ...this.state.calendar,
        events: [...this.state.calendar.events, event]
      }
    };
    this.notify();
  }

  // Notes actions
  updateNote(noteId: string, content: string): void {
    this.state = {
      ...this.state,
      notes: {
        ...this.state.notes,
        notes: this.state.notes.notes.map(note =>
          note.id === noteId
            ? { ...note, content, lastModified: new Date() }
            : note
        )
      }
    };
    this.notify();
  }

  // Terminal actions
  executeCommand(command: string, output: string): void {
    const newCommand: TerminalCommand = {
      id: Date.now().toString(),
      command,
      output,
      timestamp: new Date()
    };
    
    this.state = {
      ...this.state,
      terminal: {
        ...this.state.terminal,
        commands: [...this.state.terminal.commands, newCommand]
      }
    };
    this.notify();
  }

  // Reset to initial state
  reset(): void {
    this.state = initialState;
    this.notify();
  }
}

// Singleton instance
let storeInstance: AppStateStore | null = null;

export function getAppStateStore(): AppStateStore {
  if (!storeInstance) {
    storeInstance = new AppStateStore();
  }
  return storeInstance;
}