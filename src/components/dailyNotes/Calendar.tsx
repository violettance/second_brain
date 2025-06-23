import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Circle } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onNewNote: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  selectedDate, 
  onDateSelect, 
  onNewNote 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const hasNotes = (date: Date | null) => {
    if (!date) return false;
    // Mock data - in real app, check if date has notes
    return Math.random() > 0.7;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
      {/* Calendar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <p className="text-slate-400 text-xs lg:text-sm">Select a date to view or create notes</p>
        </div>
        <div className="flex items-center justify-between lg:justify-end space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-3 lg:mb-4">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-slate-400 text-xs lg:text-sm font-medium py-2">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 lg:gap-2">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date ? (
              <button
                onClick={() => onDateSelect(date)}
                className={`w-full h-full rounded-lg flex flex-col items-center justify-center text-xs lg:text-sm font-medium transition-all relative ${
                  isSelected(date)
                    ? 'text-white'
                    : isToday(date)
                    ? 'border'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
                style={isSelected(date) ? { background: '#C2B5FC' } : isToday(date) ? { backgroundColor: '#C2B5FC20', color: '#C2B5FC', borderColor: '#C2B5FC50' } : {}}
              >
                <span>{date.getDate()}</span>
                {hasNotes(date) && (
                  <Circle className="h-1 w-1 lg:h-1.5 lg:w-1.5 text-green-400 fill-current mt-1" />
                )}
              </button>
            ) : (
              <div className="w-full h-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 lg:mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
          <div className="text-xs lg:text-sm text-slate-400">
            Selected: {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <button
            onClick={onNewNote}
            className="flex items-center justify-center space-x-2 px-3 py-2 text-slate-900 rounded-lg text-xs lg:text-sm font-medium transition-colors hover:opacity-90"
            style={{ background: '#C2B5FC' }}
          >
            <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
            <span>Add Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};