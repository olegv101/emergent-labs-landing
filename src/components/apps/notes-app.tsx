'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Search, Trash2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotesAppProps {
  className?: string;
}

export const NotesApp: React.FC<NotesAppProps> = ({ className }) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Welcome to Notes',
      content: 'This is your first note. Double-click to edit!',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);
  const [selectedNote, setSelectedNote] = useState<string | null>('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentNote = notes.find(note => note.id === selectedNote);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote === id) {
      setSelectedNote(notes[0]?.id || null);
    }
  };

  return (
    <div className={cn('h-full flex bg-gray-50', className)}>
      {/* Sidebar */}
      <div className='w-64 bg-gray-100 border-r border-gray-300 flex flex-col'>
        {/* Search Bar */}
        <div className='p-3 border-b border-gray-300'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search notes...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md'
            />
          </div>
        </div>

        {/* Notes List */}
        <div className='flex-1 overflow-auto'>
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note.id)}
              className={cn(
                'p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors',
                selectedNote === note.id && 'bg-yellow-100'
              )}
            >
              <h3 className='font-medium text-sm text-gray-800 truncate'>
                {note.title}
              </h3>
              <p className='text-xs text-gray-500 mt-1'>
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
              <p className='text-xs text-gray-600 mt-1 line-clamp-2'>
                {note.content}
              </p>
            </div>
          ))}
        </div>

        {/* New Note Button */}
        <div className='p-3 border-t border-gray-300'>
          <button
            onClick={createNewNote}
            className='w-full flex items-center justify-center gap-2 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-md transition-colors'
          >
            <Plus className='w-4 h-4' />
            <span className='text-sm font-medium'>New Note</span>
          </button>
        </div>
      </div>

      {/* Note Editor */}
      {currentNote ? (
        <div className='flex-1 flex flex-col'>
          {/* Note Header */}
          <div className='p-4 border-b border-gray-300 flex items-center justify-between'>
            {editingTitle ? (
              <input
                type='text'
                value={currentNote.title}
                onChange={(e) => updateNote(currentNote.id, { title: e.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                className='text-xl font-semibold bg-transparent outline-none'
                autoFocus
              />
            ) : (
              <h2
                className='text-xl font-semibold cursor-pointer'
                onDoubleClick={() => setEditingTitle(true)}
              >
                {currentNote.title}
              </h2>
            )}
            
            <button
              onClick={() => deleteNote(currentNote.id)}
              className='p-2 text-gray-500 hover:text-red-500 transition-colors'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </div>

          {/* Note Content */}
          <textarea
            value={currentNote.content}
            onChange={(e) => updateNote(currentNote.id, { content: e.target.value })}
            placeholder='Start typing...'
            className='flex-1 p-4 resize-none outline-none bg-white text-gray-800'
          />

          {/* Note Footer */}
          <div className='p-2 border-t border-gray-300 text-xs text-gray-500 text-center'>
            {currentNote.content.length} characters
          </div>
        </div>
      ) : (
        <div className='flex-1 flex items-center justify-center text-gray-400'>
          <p>Create a new note to get started</p>
        </div>
      )}
    </div>
  );
};