'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Send, Plus, Search, ChevronRight, Camera, Mic, ThumbsUp, Heart, Laugh, Smile } from 'lucide-react';
import { useMessagesState } from '@/lib/use-app-state';

interface MessagesAppProps {
  className?: string;
}

export const MessagesApp: React.FC<MessagesAppProps> = ({ className }) => {
  const { 
    conversations, 
    activeConversationId, 
    composingMessage, 
    sendMessage, 
    updateComposingMessage 
  } = useMessagesState();
  
  const activeConversation = activeConversationId ? conversations[activeConversationId] : null;
  const [inputValue, setInputValue] = React.useState('');
  
  const handleSend = () => {
    if (inputValue.trim() && activeConversationId) {
      sendMessage(activeConversationId, {
        id: Date.now().toString(),
        sender: 'Me',
        content: inputValue,
        timestamp: new Date(),
        isFromAgent: false
      });
      setInputValue('');
    }
  };
  
  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  
  return (
    <div className={cn('h-full flex bg-gray-50', className)}>
      {/* Sidebar */}
      <div className='w-80 bg-white border-r border-gray-200 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <h2 className='text-xl font-semibold'>Messages</h2>
          <button className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200'>
            <Plus className='w-5 h-5' />
          </button>
        </div>
        
        {/* Search */}
        <div className='p-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search'
              className='w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
        
        {/* Conversations List */}
        <div className='flex-1 overflow-y-auto'>
          {Object.entries(conversations).map(([conversationId, messages]) => {
            const lastMessage = messages[messages.length - 1];
            const isActive = conversationId === activeConversationId;
            
            return (
              <button
                key={conversationId}
                onClick={() => updateComposingMessage(conversationId)}
                className={cn(
                  'w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors',
                  isActive && 'bg-blue-50'
                )}
              >
                <div className='w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0'>
                  <span className='text-lg font-medium'>
                    {conversationId === 'team' ? 'T' : conversationId[0].toUpperCase()}
                  </span>
                </div>
                <div className='flex-1 text-left'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>
                      {conversationId === 'team' ? 'Team Chat' : conversationId}
                    </span>
                    <span className='text-xs text-gray-500'>
                      {lastMessage && formatTime(lastMessage.timestamp)}
                    </span>
                  </div>
                  <p className='text-sm text-gray-500 truncate'>
                    {lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                <ChevronRight className='w-4 h-4 text-gray-400' />
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Chat View */}
      <div className='flex-1 flex flex-col bg-white'>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className='px-6 py-4 border-b border-gray-200'>
              <h3 className='font-semibold text-lg'>
                {activeConversationId === 'team' ? 'Team Chat' : activeConversationId}
              </h3>
            </div>
            
            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-6 space-y-4'>
              {activeConversation.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.sender === 'Me' || message.isFromAgent ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-xs px-4 py-2 rounded-2xl',
                      message.sender === 'Me' || message.isFromAgent
                        ? message.isFromAgent 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    )}
                  >
                    {message.isFromAgent && (
                      <div className='text-xs opacity-75 mb-1'>AI Agent</div>
                    )}
                    <p className='text-sm'>{message.content}</p>
                    <div className={cn(
                      'text-xs mt-1',
                      message.sender === 'Me' || message.isFromAgent
                        ? 'text-white/70'
                        : 'text-gray-500'
                    )}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input Area */}
            <div className='px-6 py-4 border-t border-gray-200'>
              <div className='flex items-center gap-3'>
                <button className='text-gray-400 hover:text-gray-600'>
                  <Camera className='w-5 h-5' />
                </button>
                <div className='flex-1 relative'>
                  <input
                    type='text'
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      updateComposingMessage(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder='Type a message'
                    className='w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1'>
                    <button className='text-gray-400 hover:text-gray-600'>
                      <Smile className='w-5 h-5' />
                    </button>
                    <button className='text-gray-400 hover:text-gray-600'>
                      <Mic className='w-5 h-5' />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                    inputValue.trim() 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-200 text-gray-400'
                  )}
                >
                  {inputValue.trim() ? (
                    <Send className='w-4 h-4' />
                  ) : (
                    <ThumbsUp className='w-4 h-4' />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center text-gray-400'>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};