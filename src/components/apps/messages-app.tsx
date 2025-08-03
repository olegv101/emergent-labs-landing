'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Send, Paperclip, Mic, ChevronLeft, Phone, Video, Info } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOutgoing: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unread?: number;
  messages: Message[];
}

interface MessagesAppProps {
  className?: string;
}

export const MessagesApp: React.FC<MessagesAppProps> = ({ className }) => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      name: 'John Smith',
      avatar: 'JS',
      lastMessage: 'Hey! Are we still on for lunch tomorrow?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      unread: 2,
      messages: [
        {
          id: '1',
          text: 'Hi! How are you doing?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isOutgoing: false,
        },
        {
          id: '2',
          text: 'I\'m doing great, thanks! How about you?',
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
          isOutgoing: true,
          status: 'read'
        },
        {
          id: '3',
          text: 'Pretty good! Just working on some projects.',
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
          isOutgoing: false,
        },
        {
          id: '4',
          text: 'Hey! Are we still on for lunch tomorrow?',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          isOutgoing: false,
        }
      ]
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      lastMessage: 'Thanks for sending the documents!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      messages: [
        {
          id: '1',
          text: 'Hi Sarah, I\'ve sent you the documents you requested.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
          isOutgoing: true,
          status: 'read'
        },
        {
          id: '2',
          text: 'Thanks for sending the documents!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          isOutgoing: false,
        }
      ]
    },
    {
      id: '3',
      name: 'Team Chat',
      avatar: 'TC',
      lastMessage: 'Great work on the presentation!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      messages: [
        {
          id: '1',
          text: 'Just finished the Q4 presentation slides',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          isOutgoing: true,
          status: 'delivered'
        },
        {
          id: '2',
          text: 'Great work on the presentation!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          isOutgoing: false,
        }
      ]
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date(),
      isOutgoing: true,
      status: 'sending'
    };

    setConversations(conversations.map(conv => {
      if (conv.id === selectedConversation) {
        return {
          ...conv,
          lastMessage: newMessage,
          timestamp: new Date(),
          messages: [...conv.messages, newMsg]
        };
      }
      return conv;
    }));

    setNewMessage('');

    // Simulate message being sent
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation) {
          return {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === newMsg.id ? { ...msg, status: 'sent' } : msg
            )
          };
        }
        return conv;
      }));
    }, 500);

    // Simulate message being delivered
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation) {
          return {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === newMsg.id ? { ...msg, status: 'delivered' } : msg
            )
          };
        }
        return conv;
      }));
    }, 1000);

    // Simulate message being read
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation) {
          return {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === newMsg.id ? { ...msg, status: 'read' } : msg
            )
          };
        }
        return conv;
      }));
    }, 2000);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (value && !isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn('h-full flex bg-white', className)}>
      {/* Sidebar */}
      <div className='w-80 border-r border-gray-200 flex flex-col'>
        {/* Search Header */}
        <div className='p-4 border-b border-gray-200'>
          <input
            type='text'
            placeholder='Search'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full px-3 py-2 bg-gray-100 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        {/* Conversations List */}
        <div className='flex-1 overflow-y-auto'>
          {filteredConversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => {
                setSelectedConversation(conv.id);
                // Mark as read
                setConversations(conversations.map(c => 
                  c.id === conv.id ? { ...c, unread: 0 } : c
                ));
              }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors',
                selectedConversation === conv.id && 'bg-blue-50'
              )}
            >
              {/* Avatar */}
              <div className='w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium'>
                {conv.avatar}
              </div>

              {/* Conversation Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between'>
                  <h3 className='font-medium text-gray-900 truncate'>{conv.name}</h3>
                  <span className='text-xs text-gray-500'>{formatTimestamp(conv.timestamp)}</span>
                </div>
                <p className='text-sm text-gray-600 truncate mt-0.5'>{conv.lastMessage}</p>
              </div>

              {/* Unread Badge */}
              {conv.unread && conv.unread > 0 && (
                <div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
                  <span className='text-xs text-white font-medium'>{conv.unread}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat View */}
      {currentConversation ? (
        <div className='flex-1 flex flex-col'>
          {/* Chat Header */}
          <div className='px-6 py-3 border-b border-gray-200 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <button className='lg:hidden p-2 hover:bg-gray-100 rounded-lg'>
                <ChevronLeft className='w-5 h-5' />
              </button>
              <div className='w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium'>
                {currentConversation.avatar}
              </div>
              <div>
                <h2 className='font-medium text-gray-900'>{currentConversation.name}</h2>
                {isTyping && (
                  <p className='text-xs text-gray-500'>typing...</p>
                )}
              </div>
            </div>
            
            <div className='flex items-center gap-2'>
              <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                <Phone className='w-5 h-5 text-gray-600' />
              </button>
              <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                <Video className='w-5 h-5 text-gray-600' />
              </button>
              <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                <Info className='w-5 h-5 text-gray-600' />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto px-6 py-4'>
            {currentConversation.messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  'flex mb-4',
                  message.isOutgoing ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl',
                    message.isOutgoing
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <p className='text-sm'>{message.text}</p>
                  <div className='flex items-center gap-1 mt-1'>
                    <span className={cn(
                      'text-xs',
                      message.isOutgoing ? 'text-blue-100' : 'text-gray-500'
                    )}>
                      {message.timestamp.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                    {message.isOutgoing && message.status && (
                      <span className='text-xs text-blue-100'>
                        {message.status === 'sending' && '○'}
                        {message.status === 'sent' && '✓'}
                        {message.status === 'delivered' && '✓✓'}
                        {message.status === 'read' && <span className='text-blue-200'>✓✓</span>}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className='px-6 py-4 border-t border-gray-200'>
            <div className='flex items-center gap-2'>
              <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                <Paperclip className='w-5 h-5 text-gray-600' />
              </button>
              
              <input
                ref={inputRef}
                type='text'
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder='Type a message'
                className='flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              
              {newMessage ? (
                <button
                  onClick={sendMessage}
                  className='p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
                >
                  <Send className='w-5 h-5' />
                </button>
              ) : (
                <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                  <Mic className='w-5 h-5 text-gray-600' />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex-1 flex items-center justify-center text-gray-400'>
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
};