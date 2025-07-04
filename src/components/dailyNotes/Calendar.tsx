import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { useDailyNotes } from '../../hooks/useDailyNotes';
import { DailyNote } from '../../types/database';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onNewNote: () => void;
  notes?: DailyNote[];
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  onNewNote,
  notes: propNotes,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Use provided notes or fetch them if not provided (for backward compatibility)
  const hookData = useDailyNotes(propNotes ? undefined : undefined);
  const notes = propNotes || hookData.notes;
  
  // Reset to current month when selectedDate changes significantly
  useEffect(() => {
    if (
      selectedDate.getMonth() !== currentMonth.getMonth() ||
      selectedDate.getFullYear() !== currentMonth.getFullYear()
    ) {
      setCurrentMonth(new Date(selectedDate));
    }
  }, [selectedDate]);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const hasNotes = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const notesForDate = notes.filter(note => note.note_date === dateString);
    return notesForDate.length > 0;
  };

  // Get note count for a specific date
  const getNoteCount = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return notes.filter(note => note.note_date === dateString).length;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prev.getMonth() - 1);
      return prevMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + 1);
      return nextMonth;
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  // Day names
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-white">{monthName} {year}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-700 rounded-md transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-700 rounded-md transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div
            key={index}
            className="text-center text-xs font-medium text-slate-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date ? (
              <button
                onClick={() => onDateSelect(date)}
                className={`w-full h-full rounded-lg flex flex-col items-center justify-center transition-all relative ${
                  isSelected(date)
                    ? 'text-slate-900'
                    : isToday(date)
                    ? 'border'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
                style={isSelected(date) ? { background: '#C2B5FC' } : isToday(date) ? { backgroundColor: 'rgba(194, 181, 252, 0.1)', color: '#C2B5FC', borderColor: 'rgba(194, 181, 252, 0.3)' } : {}}
              >
                <span className={`text-xs ${isSelected(date) ? 'font-medium' : ''}`}>
                  {date.getDate()}
                </span>
                
                {/* Note indicator with count-based scaling */}
                {hasNotes(date) && (
                  <div className="mt-1">
                    {(() => {
                      const count = getNoteCount(date);
                      const size = count === 1 ? 'h-1.5 w-1.5' : 
                                 count === 2 ? 'h-2 w-2' : 
                                 'h-2.5 w-2.5';
                      
                      return (
                        <Circle 
                          className={`${size} ${isSelected(date) ? 'text-slate-900 fill-slate-900' : 'text-green-400 fill-green-400'}`} 
                          style={{ opacity: isSelected(date) ? 0.7 : 1 }}
                        />
                      );
                    })()}
                  </div>
                )}
              </button>
            ) : (
              <div className="w-full h-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};