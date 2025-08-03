'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Inbox, Star, Send, FileText, Trash2, Archive, Shield, 
  Menu, Search, Settings, HelpCircle, ChevronDown,
  Pencil, Reply, Forward, MoreVertical, Clock,
  Paperclip, Smile, Image as ImageIcon
} from 'lucide-react';

interface Email {
  id: string;
  subject: string;
  from: {
    name: string;
    email: string;
  };
  to: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment?: boolean;
  category: 'primary' | 'social' | 'promotions' | 'updates';
  labels?: string[];
}

interface GmailAppProps {
  className?: string;
}

export const GmailApp: React.FC<GmailAppProps> = ({ className }) => {
  const [emails, setEmails] = useState<Email[]>([
    {
      id: '1',
      subject: 'Quarterly Report Review',
      from: { name: 'Michael Chen', email: 'michael.chen@company.com' },
      to: 'me',
      body: 'Hi,\n\nI\'ve attached the quarterly report for your review. Please let me know if you have any questions or need any clarifications.\n\nKey highlights:\n- Revenue increased by 15%\n- Customer satisfaction up 8%\n- New product launches on track\n\nBest regards,\nMichael',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: false,
      isStarred: true,
      hasAttachment: true,
      category: 'primary',
      labels: ['Important', 'Work']
    },
    {
      id: '2',
      subject: 'Welcome to our Newsletter!',
      from: { name: 'TechNews Daily', email: 'newsletter@technews.com' },
      to: 'me',
      body: 'Thank you for subscribing to TechNews Daily! Get ready for the latest updates in technology, delivered straight to your inbox every morning.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: true,
      isStarred: false,
      category: 'promotions'
    },
    {
      id: '3',
      subject: 'Your meeting with Sarah has been confirmed',
      from: { name: 'Calendar', email: 'calendar@google.com' },
      to: 'me',
      body: 'Your meeting "Project Discussion" with Sarah Johnson has been confirmed for tomorrow at 2:00 PM.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      isRead: true,
      isStarred: false,
      category: 'updates',
      labels: ['Calendar']
    },
    {
      id: '4',
      subject: 'New connection request on LinkedIn',
      from: { name: 'LinkedIn', email: 'notifications@linkedin.com' },
      to: 'me',
      body: 'John Smith wants to connect with you on LinkedIn. View their profile and accept the invitation.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isRead: false,
      isStarred: false,
      category: 'social'
    }
  ]);

  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: emails.filter(e => !e.isRead).length },
    { id: 'starred', name: 'Starred', icon: Star },
    { id: 'sent', name: 'Sent', icon: Send },
    { id: 'drafts', name: 'Drafts', icon: FileText },
    { id: 'trash', name: 'Trash', icon: Trash2 },
    { id: 'spam', name: 'Spam', icon: Shield },
    { id: 'archive', name: 'Archive', icon: Archive },
  ];

  const categories = ['primary', 'social', 'promotions', 'updates'];

  const currentEmail = emails.find(e => e.id === selectedEmail);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFolder === 'starred') {
      return email.isStarred && matchesSearch;
    }
    
    return matchesSearch;
  });

  const markAsRead = (emailId: string) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, isRead: true } : email
    ));
  };

  const toggleStar = (emailId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const sendEmail = () => {
    const newEmail: Email = {
      id: Date.now().toString(),
      subject: composeData.subject || '(no subject)',
      from: { name: 'Me', email: 'me@gmail.com' },
      to: composeData.to,
      body: composeData.body,
      timestamp: new Date(),
      isRead: true,
      isStarred: false,
      category: 'primary'
    };

    setEmails([newEmail, ...emails]);
    setIsComposing(false);
    setComposeData({ to: '', subject: '', body: '' });
  };

  return (
    <div className={cn('h-full flex flex-col bg-white', className)}>
      {/* Header */}
      <div className='h-16 border-b border-gray-200 flex items-center px-4 gap-4'>
        <button className='p-2 hover:bg-gray-100 rounded-lg'>
          <Menu className='w-5 h-5' />
        </button>
        
        <div className='flex items-center gap-2'>
          <div className='text-2xl font-normal text-gray-700'>Gmail</div>
        </div>

        <div className='flex-1 max-w-2xl'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              placeholder='Search mail'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button className='p-2 hover:bg-gray-100 rounded-lg'>
            <HelpCircle className='w-5 h-5' />
          </button>
          <button className='p-2 hover:bg-gray-100 rounded-lg'>
            <Settings className='w-5 h-5' />
          </button>
        </div>
      </div>

      <div className='flex-1 flex overflow-hidden'>
        {/* Sidebar */}
        <div className='w-64 border-r border-gray-200 p-4'>
          <button
            onClick={() => setIsComposing(true)}
            className='w-full mb-4 px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2'
          >
            <Pencil className='w-4 h-4' />
            <span>Compose</span>
          </button>

          <nav>
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors',
                  selectedFolder === folder.id && 'bg-blue-50 text-blue-600'
                )}
              >
                <folder.icon className='w-5 h-5' />
                <span className='flex-1 text-left text-sm'>{folder.name}</span>
                {folder.count && folder.count > 0 && (
                  <span className='text-xs font-medium'>{folder.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Email List */}
        <div className='w-96 border-r border-gray-200 overflow-y-auto'>
          {/* Category Tabs */}
          <div className='flex border-b border-gray-200'>
            {categories.map(category => (
              <button
                key={category}
                className='flex-1 px-4 py-3 text-sm font-medium capitalize hover:bg-gray-50 border-b-2 border-transparent hover:border-gray-300'
              >
                {category}
              </button>
            ))}
          </div>

          {/* Email Items */}
          <div>
            {filteredEmails.map(email => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email.id);
                  markAsRead(email.id);
                }}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer',
                  !email.isRead && 'bg-white font-medium',
                  selectedEmail === email.id && 'bg-blue-50'
                )}
              >
                <input
                  type='checkbox'
                  className='mt-1'
                  onClick={(e) => e.stopPropagation()}
                />
                
                <button
                  onClick={(e) => toggleStar(email.id, e)}
                  className='mt-0.5'
                >
                  <Star className={cn(
                    'w-5 h-5',
                    email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                  )} />
                </button>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <span className={cn('text-sm truncate', !email.isRead && 'font-semibold')}>
                      {email.from.name}
                    </span>
                    <span className='text-xs text-gray-500'>{formatTimestamp(email.timestamp)}</span>
                  </div>
                  <div className='text-sm truncate mt-0.5'>{email.subject}</div>
                  <div className='text-xs text-gray-600 truncate mt-0.5'>{email.body}</div>
                </div>

                {email.hasAttachment && (
                  <Paperclip className='w-4 h-4 text-gray-400 mt-1' />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Email Content */}
        {currentEmail ? (
          <div className='flex-1 flex flex-col overflow-hidden'>
            {/* Email Header */}
            <div className='p-4 border-b border-gray-200'>
              <div className='flex items-start justify-between mb-2'>
                <h2 className='text-xl font-normal'>{currentEmail.subject}</h2>
                <div className='flex items-center gap-2'>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <Archive className='w-4 h-4' />
                  </button>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <Spam className='w-4 h-4' />
                  </button>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <Trash2 className='w-4 h-4' />
                  </button>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <MoreVertical className='w-4 h-4' />
                  </button>
                </div>
              </div>

              <div className='flex items-center gap-2 text-sm'>
                {currentEmail.labels?.map(label => (
                  <span key={label} className='px-2 py-0.5 bg-gray-100 rounded text-xs'>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Email Body */}
            <div className='flex-1 overflow-y-auto p-4'>
              <div className='mb-4'>
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium'>
                      {currentEmail.from.name.charAt(0)}
                    </div>
                    <div>
                      <div className='font-medium'>{currentEmail.from.name}</div>
                      <div className='text-sm text-gray-600'>
                        &lt;{currentEmail.from.email}&gt;
                      </div>
                    </div>
                  </div>
                  <div className='text-sm text-gray-500'>
                    {currentEmail.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className='whitespace-pre-wrap text-gray-800'>
                {currentEmail.body}
              </div>

              {currentEmail.hasAttachment && (
                <div className='mt-4 p-3 border border-gray-200 rounded-lg inline-flex items-center gap-2'>
                  <Paperclip className='w-4 h-4 text-gray-500' />
                  <span className='text-sm'>quarterly_report_q4.pdf</span>
                </div>
              )}
            </div>

            {/* Reply Section */}
            <div className='p-4 border-t border-gray-200'>
              <div className='flex gap-2'>
                <button className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2'>
                  <Reply className='w-4 h-4' />
                  <span>Reply</span>
                </button>
                <button className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2'>
                  <Forward className='w-4 h-4' />
                  <span>Forward</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex-1 flex items-center justify-center text-gray-400'>
            <p>Select an email to read</p>
          </div>
        )}

        {/* Compose Modal */}
        {isComposing && (
          <div className='absolute bottom-4 right-4 w-[500px] bg-white rounded-lg shadow-2xl border border-gray-200'>
            <div className='bg-gray-800 text-white px-4 py-2 rounded-t-lg flex items-center justify-between'>
              <span className='text-sm'>New Message</span>
              <button
                onClick={() => setIsComposing(false)}
                className='text-gray-400 hover:text-white'
              >
                ×
              </button>
            </div>
            
            <div className='p-4'>
              <input
                type='text'
                placeholder='Recipients'
                value={composeData.to}
                onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                className='w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-gray-400'
              />
              
              <input
                type='text'
                placeholder='Subject'
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                className='w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-gray-400 mt-2'
              />
              
              <textarea
                placeholder='Compose email'
                value={composeData.body}
                onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                className='w-full px-3 py-2 mt-2 text-sm resize-none focus:outline-none h-48'
              />
              
              <div className='flex items-center justify-between mt-4'>
                <button
                  onClick={sendEmail}
                  className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
                >
                  Send
                </button>
                
                <div className='flex items-center gap-2'>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <Paperclip className='w-4 h-4' />
                  </button>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <ImageIcon className='w-4 h-4' />
                  </button>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <Smile className='w-4 h-4' />
                  </button>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};