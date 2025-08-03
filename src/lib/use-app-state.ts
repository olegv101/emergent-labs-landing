'use client';

import { useEffect, useState } from 'react';
import { AppState, getAppStateStore } from './app-state-store';

// Custom hook to use app state in components
// This keeps components as thin wrappers over data
export function useAppState() {
  const store = getAppStateStore();
  const [state, setState] = useState<AppState>(store.getState());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = store.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  return {
    state,
    store
  };
}

// Specialized hooks for each app
export function useGmailState() {
  const { state, store } = useAppState();
  return {
    emails: state.gmail.emails,
    selectedEmailId: state.gmail.selectedEmailId,
    composing: state.gmail.composing,
    sendEmail: store.sendEmail.bind(store),
    updateComposingEmail: store.updateComposingEmail.bind(store)
  };
}

export function useSpreadsheetState() {
  const { state, store } = useAppState();
  return {
    cells: state.spreadsheet.cells,
    selectedCell: state.spreadsheet.selectedCell,
    updateCell: store.updateCell.bind(store),
    selectCell: store.selectCell.bind(store)
  };
}

export function useTextEditState() {
  const { state, store } = useAppState();
  return {
    documents: state.textEdit.documents,
    activeDocumentId: state.textEdit.activeDocumentId,
    updateDocument: store.updateDocument.bind(store)
  };
}

export function useMessagesState() {
  const { state, store } = useAppState();
  return {
    conversations: state.messages.conversations,
    activeConversationId: state.messages.activeConversationId,
    composingMessage: state.messages.composingMessage,
    sendMessage: store.sendMessage.bind(store),
    updateComposingMessage: store.updateComposingMessage.bind(store)
  };
}

export function useCalendarState() {
  const { state, store } = useAppState();
  return {
    events: state.calendar.events,
    selectedDate: state.calendar.selectedDate,
    addEvent: store.addEvent.bind(store)
  };
}

export function useNotesState() {
  const { state, store } = useAppState();
  return {
    notes: state.notes.notes,
    selectedNoteId: state.notes.selectedNoteId,
    updateNote: store.updateNote.bind(store)
  };
}

export function useTerminalState() {
  const { state, store } = useAppState();
  return {
    commands: state.terminal.commands,
    currentDirectory: state.terminal.currentDirectory,
    executeCommand: store.executeCommand.bind(store)
  };
}