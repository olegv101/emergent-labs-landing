'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Inbox, Star, Send, FileText, Trash2, Archive, Shield, 
  Menu, Search, Settings, HelpCircle, ChevronDown,
  Pencil, Reply, Forward, MoreVertical, Clock,
  Paperclip, Smile, Image as ImageIcon
} from 'lucide-react';
import { useGmailState } from '@/lib/use-app-state';

interface GmailAppProps {
  className?: string;
}

export const GmailApp: React.FC<GmailAppProps> = ({ className }) => {
  const { emails, selectedEmailId, composing, sendEmail, updateComposingEmail } = useGmailState();
  
  const selectedEmail = emails.find(e => e.id === selectedEmailId) || null;
  const [showCompose, setShowCompose] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'list' | 'detail'>('list');
  
  const handleCompose = () => {
    setShowCompose(true);
    updateComposingEmail({
      to: '',
      subject: '',
      body: ''
    });
  };
  
  const handleSend = () => {
    if (composing) {
      sendEmail({
        id: Date.now().toString(),
        from: 'agent@emergentlabs.ai',
        subject: composing.subject || '',
        body: composing.body || '',
        timestamp: new Date(),
        isRead: false
      });
      setShowCompose(false);
    }
  };
  
  const handleSelectEmail = (emailId: string) => {
    const email = emails.find(e => e.id === emailId);
    if (email) {
      setViewMode('detail');
    }
  };
  
  return (
    <div className={cn('h-full flex bg-white', className)}>
      {/* Sidebar */}
      <div className='w-64 border-r border-gray-200 p-4'>
        <button
          onClick={handleCompose}
          className='w-full bg-blue-500 text-white rounded-full px-6 py-3 mb-6 flex items-center gap-3 hover:bg-blue-600 transition-colors'
        >
          <Pencil className='w-5 h-5' />
          Compose
        </button>
        
        <nav className='space-y-1'>
          <button className='w-full text-left px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium flex items-center gap-3'>
            <Inbox className='w-5 h-5' />
            Inbox
            <span className='ml-auto text-sm'>{emails.filter(e => !e.isRead).length}</span>
          </button>
          <button className='w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3'>
            <Star className='w-5 h-5' />
            Starred
          </button>
          <button className='w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3'>
            <Send className='w-5 h-5' />
            Sent
          </button>
          <button className='w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3'>
            <FileText className='w-5 h-5' />
            Drafts
          </button>
          <button className='w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3'>
            <Archive className='w-5 h-5' />
            Archive
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <div className='border-b border-gray-200 px-4 py-3 flex items-center gap-4'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              placeholder='Search mail'
              className='w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <button className='p-2 hover:bg-gray-100 rounded-lg'>
            <Settings className='w-5 h-5' />
          </button>
        </div>
        
        {/* Email List or Detail View */}
        {viewMode === 'list' ? (
          <div className='flex-1 overflow-y-auto'>
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => handleSelectEmail(email.id)}
                className={cn(
                  'px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center gap-3',
                  !email.isRead && 'bg-white font-semibold'
                )}
              >
                <input type='checkbox' className='rounded' onClick={(e) => e.stopPropagation()} />
                <button onClick={(e) => { e.stopPropagation(); }}>
                  <Star className={cn('w-5 h-5', email.isRead ? 'text-gray-300' : 'text-yellow-400')} />
                </button>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm'>{email.from}</span>
                    <span className='text-xs text-gray-500'>
                      {new Date(email.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className='text-sm'>{email.subject}</div>
                  <div className='text-sm text-gray-500 truncate'>{email.body}</div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedEmail && (
          <div className='flex-1 p-6 overflow-y-auto'>
            <div className='max-w-4xl mx-auto'>
              <button
                onClick={() => setViewMode('list')}
                className='mb-4 text-blue-600 hover:underline'
              >
                ← Back to inbox
              </button>
              <h2 className='text-2xl font-bold mb-4'>{selectedEmail.subject}</h2>
              <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                <div className='flex items-center justify-between mb-2'>
                  <div>
                    <div className='font-semibold'>{selectedEmail.from}</div>
                    <div className='text-sm text-gray-500'>to me</div>
                  </div>
                  <div className='text-sm text-gray-500'>
                    {new Date(selectedEmail.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className='prose max-w-none'>
                <p className='whitespace-pre-wrap'>{selectedEmail.body}</p>
              </div>
              <div className='mt-6 flex gap-2'>
                <button className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2'>
                  <Reply className='w-4 h-4' />
                  Reply
                </button>
                <button className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2'>
                  <Forward className='w-4 h-4' />
                  Forward
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Compose Modal */}
        {showCompose && (
          <div className='absolute inset-0 bg-black/50 flex items-end justify-center'>
            <div className='bg-white w-full max-w-2xl rounded-t-xl shadow-xl'>
              <div className='flex items-center justify-between p-4 border-b'>
                <h3 className='font-semibold'>New Message</h3>
                <button
                  onClick={() => setShowCompose(false)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  ×
                </button>
              </div>
              <div className='p-4 space-y-3'>
                <input
                  type='email'
                  placeholder='To'
                  value={composing?.to || ''}
                  onChange={(e) => updateComposingEmail({ to: e.target.value } as any)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                  type='text'
                  placeholder='Subject'
                  value={composing?.subject || ''}
                  onChange={(e) => updateComposingEmail({ subject: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <textarea
                  placeholder='Message body'
                  value={composing?.body || ''}
                  onChange={(e) => updateComposingEmail({ body: e.target.value })}
                  rows={10}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                />
              </div>
              <div className='flex items-center justify-between p-4 border-t'>
                <div className='flex gap-2'>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <Paperclip className='w-5 h-5' />
                  </button>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <ImageIcon className='w-5 h-5' />
                  </button>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <Smile className='w-5 h-5' />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};