import React from 'react';
import { Ritual, RitualType } from '../types';
import ProgressCircle from './ProgressCircle';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon } from './icons';

interface DailyViewProps {
  date: Date;
  data: Ritual[];
  journal: string;
  onDateChange: (newDate: Date) => void;
  onRitualChange: (date: Date, ritualId: string, completed: boolean, value: string | null) => void;
  onJournalChange: (date: Date, journal: string) => void;
}

const DailyView: React.FC<DailyViewProps> = ({ date, data, journal, onDateChange, onRitualChange, onJournalChange }) => {
  const changeDay = (amount: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + amount);
    onDateChange(newDate);
  };

  const completedCount = data.filter(r => r.completed).length;
  const totalCount = data.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCheckboxChange = (ritual: Ritual, e: React.ChangeEvent<HTMLInputElement>) => {
    onRitualChange(date, ritual.id, e.target.checked, ritual.value);
  };
  
  const handleTimeChange = (ritual: Ritual, e: React.ChangeEvent<HTMLInputElement>) => {
    onRitualChange(date, ritual.id, e.target.value !== '', e.target.value);
  };

  const isToday = date.toDateString() === new Date().toDateString();

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3 flex flex-col items-center text-center p-4 bg-neutral-700/60 rounded-lg">
        <h2 className="text-xl font-bold text-neutral-300">Daily Progress</h2>
        <div className="my-4">
            <ProgressCircle progress={progress} />
        </div>
        <p className="text-neutral-400">{completedCount} of {totalCount} completed</p>
      </div>

      <div className="w-full md:w-2/3">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-neutral-700 transition-colors">
            <ChevronLeftIcon className="w-6 h-6 text-neutral-400" />
          </button>
          <h3 className={`text-lg font-semibold text-center ${isToday ? 'text-cyan-400' : ''}`}>
            {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <button onClick={() => changeDay(1)} className="p-2 rounded-full hover:bg-neutral-700 transition-colors">
            <ChevronRightIcon className="w-6 h-6 text-neutral-400" />
          </button>
        </div>

        <ul className="space-y-3">
          {data.map(ritual => (
            <li
              key={ritual.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                ritual.completed ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : 'bg-neutral-700/50 hover:bg-neutral-700'
              }`}
            >
              <label
                htmlFor={ritual.id}
                className={`flex-grow text-sm font-medium cursor-pointer ${
                  ritual.completed ? 'line-through text-neutral-500' : 'text-neutral-300'
                }`}
              >
                {ritual.name}
              </label>

              {ritual.type === RitualType.Checkbox && (
                <input
                  id={ritual.id}
                  type="checkbox"
                  checked={ritual.completed}
                  onChange={(e) => handleCheckboxChange(ritual, e)}
                  className="h-6 w-6 rounded bg-neutral-600 border-neutral-500 text-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-neutral-800 cursor-pointer transition-colors"
                />
              )}

              {ritual.type === RitualType.Time && (
                 <div className="relative group">
                    <input
                      id={ritual.id}
                      type="time"
                      value={ritual.value || ''}
                      onChange={(e) => handleTimeChange(ritual, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className={`flex items-center justify-center min-w-[7rem] h-full px-3 py-1.5 text-sm text-center bg-neutral-600 border border-neutral-500 rounded-md transition-colors group-hover:border-neutral-400 pointer-events-none ${ritual.value ? 'text-neutral-100 font-semibold' : 'text-neutral-400'}`}>
                      {ritual.value ? new Date(`1970-01-01T${ritual.value}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Set Time'}
                      <ClockIcon className="w-4 h-4 ml-2 flex-shrink-0" />
                    </div>
                  </div>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-6">
            <label htmlFor="journal" className="block text-sm font-medium text-neutral-300 mb-2">
                Today's Journal
            </label>
            <textarea
                id="journal"
                name="journal"
                rows={4}
                className="block w-full rounded-md border-neutral-600 bg-neutral-700 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm placeholder:text-neutral-500 text-neutral-200"
                placeholder="How was your day? Any thoughts or reflections?"
                value={journal}
                onChange={(e) => onJournalChange(date, e.target.value)}
            />
        </div>
      </div>
    </div>
  );
};

export default DailyView;