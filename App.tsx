import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppData, View, Ritual, RitualType } from './types';
import { DEFAULT_RITUALS } from './constants';
import DailyView from './components/DailyView';
import CalendarView from './components/CalendarView';
import { CalendarIcon, ListBulletIcon, FireIcon } from './components/icons';

// Helper function to format a Date object to 'YYYY-MM-DD'
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<AppData>({});
  const [view, setView] = useState<View>('daily');

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('ritualTrackerData');
      if (savedData) {
        setData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ritualTrackerData', JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [data]);

  const getDayData = useCallback((date: Date): Ritual[] => {
    const dateString = formatDate(date);
    const dayData = data[dateString];
    if (dayData) {
      const existingRituals = dayData.rituals;
      const allRitualIds = new Set(DEFAULT_RITUALS.map(r => r.id));
      
      const mergedRituals = DEFAULT_RITUALS.map(defaultRitual => {
        const found = existingRituals.find(r => r.id === defaultRitual.id);
        return found || { ...defaultRitual, completed: false, value: null };
      });

      // Add any rituals that might be in data but not in defaults (legacy)
      existingRituals.forEach(ritual => {
        if(!allRitualIds.has(ritual.id)) {
            mergedRituals.push(ritual);
        }
      });
      return mergedRituals;
    }
    return DEFAULT_RITUALS.map(r => ({ ...r, completed: false, value: null }));
  }, [data]);

  const handleRitualChange = (date: Date, ritualId: string, completed: boolean, value: string | null) => {
    const dateString = formatDate(date);
    const dayData = getDayData(date);
    const updatedRituals = dayData.map(ritual => {
      if (ritual.id === ritualId) {
        if (ritual.type === RitualType.Time) {
            return { ...ritual, value, completed: !!value };
        }
        return { ...ritual, completed };
      }
      return ritual;
    });

    setData(prevData => ({
      ...prevData,
      [dateString]: { 
        ...prevData[dateString],
        rituals: updatedRituals 
      },
    }));
  };

  const handleJournalChange = (date: Date, journal: string) => {
    const dateString = formatDate(date);
    setData(prevData => ({
        ...prevData,
        [dateString]: {
            rituals: prevData[dateString]?.rituals || getDayData(date),
            journal,
        },
    }));
  };

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    setView('daily');
  };
  
  const calculateStreak = useMemo(() => {
    let streak = 0;
    let checkDate = new Date();
    const todayString = formatDate(checkDate);
    const todayData = data[todayString];

    // If today is not fully completed, start checking from yesterday
    if (!todayData || todayData.rituals.length === 0 || todayData.rituals.some(r => !r.completed)) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        const dateString = formatDate(checkDate);
        const dayData = data[dateString];
        if (dayData && dayData.rituals.length > 0 && dayData.rituals.every(r => r.completed)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
  }, [data]);


  const currentDayData = getDayData(currentDate);
  const currentJournal = data[formatDate(currentDate)]?.journal ?? '';

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100">
                        Daily Rituals
                    </h1>
                    <p className="text-neutral-400 mt-1">
                        Track your habits, build consistency.
                    </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 pt-1">
                    <div className="flex items-center gap-2 text-amber-400" title={`Current streak: ${calculateStreak} days`}>
                        <FireIcon className="w-6 h-6"/>
                        <span className="font-bold text-xl">{calculateStreak}</span>
                    </div>
                </div>
            </div>
        </header>

        <div className="bg-neutral-800 rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex justify-center border-b border-neutral-700 mb-6">
            <button
              onClick={() => setView('daily')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                view === 'daily'
                  ? 'text-cyan-500 border-b-2 border-cyan-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ListBulletIcon className="w-5 h-5" />
              Daily View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                view === 'calendar'
                  ? 'text-cyan-500 border-b-2 border-cyan-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              Calendar View
            </button>
          </div>

          <main>
            {view === 'daily' ? (
              <DailyView
                date={currentDate}
                data={currentDayData}
                journal={currentJournal}
                onDateChange={setCurrentDate}
                onRitualChange={handleRitualChange}
                onJournalChange={handleJournalChange}
              />
            ) : (
              <CalendarView
                currentDate={currentDate}
                data={data}
                onDateSelect={handleDateChange}
              />
            )}
          </main>
        </div>
         <footer className="text-center mt-8 text-sm text-neutral-400 space-y-1">
            <p>Built with ❤️ and privacy in mind</p>
            <p>Your data is stored locally on your device.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;