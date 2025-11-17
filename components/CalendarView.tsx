import React, { useState } from 'react';
import { AppData, RitualType } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, ArrowDownTrayIcon } from './icons';
import { DEFAULT_RITUALS } from '../constants';

interface CalendarViewProps {
  currentDate: Date;
  data: AppData;
  onDateSelect: (date: Date) => void;
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getProgressColor = (progress: number | undefined): string => {
  if (progress === undefined) return 'bg-neutral-700/50 hover:bg-neutral-700/80';
  if (progress >= 80) return 'bg-cyan-500 hover:bg-cyan-600';
  if (progress >= 40) return 'bg-cyan-500/60 hover:bg-cyan-600/60';
  if (progress > 0) return 'bg-cyan-500/30 hover:bg-cyan-600/30';
  return 'bg-neutral-700 hover:bg-neutral-600';
};

const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, data, onDateSelect }) => {
  const [displayDate, setDisplayDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));

  const changeMonth = (amount: number) => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
  };
  
  const handleExport = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const ritualHeaders = DEFAULT_RITUALS.map(r => r.name);
    const headers = ['Date', ...ritualHeaders, 'Journal'];
    const csvRows = [headers.join(',')];

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = formatDate(date);
        const dayData = data[dateString];
        
        const row = [dateString];

        if (dayData) {
            DEFAULT_RITUALS.forEach(defaultRitual => {
                const ritual = dayData.rituals.find(r => r.id === defaultRitual.id);
                if (ritual) {
                    if (ritual.type === RitualType.Checkbox) {
                        row.push(ritual.completed ? 'Yes' : 'No');
                    } else if (ritual.type === RitualType.Time) {
                        row.push(ritual.value || '');
                    } else {
                        row.push('');
                    }
                } else {
                    row.push('');
                }
            });
            const journal = dayData.journal ? `"${dayData.journal.replace(/"/g, '""')}"` : '';
            row.push(journal);
        } else {
            DEFAULT_RITUALS.forEach(() => row.push(''));
            row.push('');
        }
        csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        const monthStr = (month + 1).toString().padStart(2, '0');
        link.setAttribute('href', url);
        link.setAttribute('download', `rituals-${year}-${monthStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="border-r border-b border-neutral-700"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = formatDate(date);
    const dayData = data[dateString];
    
    let progress: number | undefined;
    if (dayData) {
      const completed = dayData.rituals.filter(r => r.completed).length;
      const total = dayData.rituals.length;
      progress = total > 0 ? (completed / total) * 100 : 0;
    }

    const isToday = date.toDateString() === new Date().toDateString();
    
    calendarDays.push(
      <div 
        key={day}
        onClick={() => onDateSelect(date)}
        className="p-2 border-r border-b border-neutral-700 cursor-pointer transition-colors"
      >
        <div className={`flex flex-col items-center justify-center h-16 w-full rounded-md ${getProgressColor(progress)}`}>
            <span className={`text-sm font-semibold ${progress !== undefined ? 'text-white' : 'text-neutral-300'}`}>{day}</span>
             {isToday && <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-1"></div>}
             {progress !== undefined && <span className="text-xs text-white/80">{Math.round(progress)}%</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold w-36 text-center">
              {displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-neutral-700 transition-colors">
                  <ChevronLeftIcon className="w-6 h-6 text-neutral-400" />
                </button>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-neutral-700 transition-colors">
                  <ChevronRightIcon className="w-6 h-6 text-neutral-400" />
                </button>
            </div>
        </div>
        <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-neutral-300 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-sm font-semibold text-neutral-400">
        {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 border-l border-t border-neutral-700 rounded-lg overflow-hidden">
        {calendarDays}
      </div>
    </div>
  );
};

export default CalendarView;