'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronLeft, ChevronRight, Plus, Search, 
  Calendar as CalendarIcon, Clock, MapPin, 
  Users, Video, MoreHorizontal, X, ChevronDown
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  color: string;
  location?: string;
  attendees?: string[];
  description?: string;
  isAllDay?: boolean;
  isVideoCall?: boolean;
}

interface CalendarAppProps {
  className?: string;
}

export const CalendarApp: React.FC<CalendarAppProps> = ({ className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Team Standup',
      date: new Date(),
      startTime: '09:00',
      endTime: '09:30',
      color: 'bg-blue-500',
      location: 'Conference Room A',
      attendees: ['john@company.com', 'sarah@company.com', 'mike@company.com'],
      isVideoCall: false
    },
    {
      id: '2',
      title: 'Product Review',
      date: new Date(),
      startTime: '14:00',
      endTime: '15:00',
      color: 'bg-purple-500',
      description: 'Review Q4 product roadmap and upcoming features',
      attendees: ['team@company.com'],
      isVideoCall: true
    },
    {
      id: '3',
      title: 'Lunch with Client',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      startTime: '12:00',
      endTime: '13:30',
      color: 'bg-green-500',
      location: 'Downtown Restaurant'
    },
    {
      id: '4',
      title: 'Quarterly Planning',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      startTime: '10:00',
      endTime: '16:00',
      color: 'bg-red-500',
      location: 'Main Office',
      isAllDay: false,
      attendees: ['all@company.com']
    }
  ]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: ''
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Add next month's leading days to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const createEvent = () => {
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: new Date(newEvent.date),
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      color: 'bg-blue-500',
      location: newEvent.location,
      description: newEvent.description
    };
    
    setEvents([...events, event]);
    setShowEventModal(false);
    setNewEvent({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      description: ''
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className={cn('h-full flex bg-white', className)}>
      {/* Sidebar */}
      <div className='w-64 border-r border-gray-200 p-4'>
        <button
          onClick={() => setShowEventModal(true)}
          className='w-full mb-6 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2'
        >
          <Plus className='w-5 h-5' />
          <span>Create</span>
        </button>

        {/* Mini Calendar */}
        <div className='mb-6'>
          <div className='text-sm font-medium mb-3'>My calendars</div>
          <div className='space-y-2'>
            <label className='flex items-center gap-2'>
              <input type='checkbox' defaultChecked className='rounded' />
              <span className='text-sm'>Personal</span>
            </label>
            <label className='flex items-center gap-2'>
              <input type='checkbox' defaultChecked className='rounded' />
              <span className='text-sm'>Work</span>
            </label>
            <label className='flex items-center gap-2'>
              <input type='checkbox' defaultChecked className='rounded' />
              <span className='text-sm'>Family</span>
            </label>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <div className='text-sm font-medium mb-3'>Today\'s Events</div>
          <div className='space-y-2'>
            {getEventsForDate(new Date()).map(event => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className='p-2 rounded-lg hover:bg-gray-100 cursor-pointer'
              >
                <div className='flex items-center gap-2'>
                  <div className={cn('w-2 h-2 rounded-full', event.color)} />
                  <div className='flex-1'>
                    <div className='text-sm font-medium truncate'>{event.title}</div>
                    <div className='text-xs text-gray-500'>
                      {formatTime(event.startTime)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <div className='h-16 border-b border-gray-200 flex items-center justify-between px-6'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => setCurrentDate(new Date())}
              className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium'
            >
              Today
            </button>
            
            <div className='flex items-center gap-1'>
              <button
                onClick={() => navigateMonth('prev')}
                className='p-2 hover:bg-gray-100 rounded-lg'
              >
                <ChevronLeft className='w-5 h-5' />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className='p-2 hover:bg-gray-100 rounded-lg'
              >
                <ChevronRight className='w-5 h-5' />
              </button>
            </div>

            <h2 className='text-xl font-normal'>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>

          <div className='flex items-center gap-2'>
            <button className='p-2 hover:bg-gray-100 rounded-lg'>
              <Search className='w-5 h-5' />
            </button>
            
            <div className='flex items-center border border-gray-300 rounded-lg'>
              <button
                onClick={() => setView('day')}
                className={cn(
                  'px-3 py-1.5 text-sm',
                  view === 'day' && 'bg-gray-100'
                )}
              >
                Day
              </button>
              <button
                onClick={() => setView('week')}
                className={cn(
                  'px-3 py-1.5 text-sm border-x border-gray-300',
                  view === 'week' && 'bg-gray-100'
                )}
              >
                Week
              </button>
              <button
                onClick={() => setView('month')}
                className={cn(
                  'px-3 py-1.5 text-sm',
                  view === 'month' && 'bg-gray-100'
                )}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className='flex-1 overflow-hidden'>
          {view === 'month' && (
            <div className='h-full flex flex-col'>
              {/* Week Day Headers */}
              <div className='grid grid-cols-7 border-b border-gray-200'>
                {weekDays.map(day => (
                  <div
                    key={day}
                    className='py-2 text-center text-sm font-medium text-gray-600'
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className='flex-1 grid grid-cols-7 grid-rows-6'>
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(day.date);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={cn(
                        'border-r border-b border-gray-200 p-2 cursor-pointer hover:bg-gray-50',
                        !day.isCurrentMonth && 'text-gray-400 bg-gray-50',
                        selectedDate?.toDateString() === day.date.toDateString() && 'bg-blue-50',
                        index % 7 === 6 && 'border-r-0'
                      )}
                    >
                      <div className={cn(
                        'text-sm font-medium mb-1',
                        isToday(day.date) && 'w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center'
                      )}>
                        {day.date.getDate()}
                      </div>
                      
                      <div className='space-y-1'>
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                            className={cn(
                              'text-xs px-1 py-0.5 rounded truncate cursor-pointer',
                              event.color,
                              'text-white'
                            )}
                          >
                            {formatTime(event.startTime)} {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className='text-xs text-gray-500'>
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'week' && (
            <div className='h-full p-4 flex items-center justify-center text-gray-400'>
              <p>Week view coming soon...</p>
            </div>
          )}

          {view === 'day' && (
            <div className='h-full p-4 flex items-center justify-center text-gray-400'>
              <p>Day view coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl w-[500px]'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium'>Create Event</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className='p-1 hover:bg-gray-100 rounded'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
            </div>

            <div className='p-6 space-y-4'>
              <input
                type='text'
                placeholder='Add title'
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className='w-full px-4 py-2 text-lg border-b border-gray-200 focus:outline-none focus:border-blue-500'
              />

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Date
                  </label>
                  <input
                    type='date'
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Start
                    </label>
                    <input
                      type='time'
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      End
                    </label>
                    <input
                      type='time'
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Location
                </label>
                <input
                  type='text'
                  placeholder='Add location'
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Description
                </label>
                <textarea
                  placeholder='Add description'
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                />
              </div>
            </div>

            <div className='p-6 border-t border-gray-200 flex justify-end gap-3'>
              <button
                onClick={() => setShowEventModal(false)}
                className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg'
              >
                Cancel
              </button>
              <button
                onClick={createEvent}
                disabled={!newEvent.title || !newEvent.date}
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl w-[400px]'>
            <div className='p-6'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-start gap-3'>
                  <div className={cn('w-4 h-4 rounded mt-1', selectedEvent.color)} />
                  <div>
                    <h3 className='text-lg font-medium'>{selectedEvent.title}</h3>
                    <p className='text-sm text-gray-600 mt-1'>
                      {selectedEvent.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className='p-1 hover:bg-gray-100 rounded'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center gap-3 text-sm'>
                  <Clock className='w-4 h-4 text-gray-400' />
                  <span>
                    {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div className='flex items-center gap-3 text-sm'>
                    <MapPin className='w-4 h-4 text-gray-400' />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.isVideoCall && (
                  <div className='flex items-center gap-3 text-sm'>
                    <Video className='w-4 h-4 text-gray-400' />
                    <span>Google Meet</span>
                  </div>
                )}

                {selectedEvent.attendees && (
                  <div className='flex items-start gap-3 text-sm'>
                    <Users className='w-4 h-4 text-gray-400 mt-0.5' />
                    <div>
                      <div className='font-medium mb-1'>Attendees</div>
                      {selectedEvent.attendees.map((attendee, index) => (
                        <div key={index} className='text-gray-600'>
                          {attendee}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className='pt-3 border-t border-gray-200'>
                    <p className='text-sm text-gray-600'>{selectedEvent.description}</p>
                  </div>
                )}
              </div>

              <div className='mt-6 flex gap-3'>
                <button className='flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'>
                  Edit
                </button>
                <button className='flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};