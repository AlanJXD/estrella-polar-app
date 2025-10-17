'use client';

import { motion } from 'framer-motion';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isSameMonth,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  sesionesCount: { [key: string]: number };
}

export default function Calendar({ selectedDate, onSelectDate, sesionesCount }: CalendarProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const handlePrevMonth = () => {
    onSelectDate(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    onSelectDate(addMonths(selectedDate, 1));
  };

  const handleToday = () => {
    onSelectDate(new Date());
  };

  return (
    <div className="glass-strong rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white capitalize">
          {format(selectedDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToday}
            className="px-4 py-2 glass hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Hoy
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevMonth}
            className="p-2 glass hover:bg-white/10 text-white rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextMonth}
            className="p-2 glass hover:bg-white/10 text-white rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const count = sesionesCount[dateKey] || 0;
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(day)}
              className={`
                relative aspect-square rounded-xl p-2 transition-all
                ${isSelected
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : isTodayDate
                  ? 'bg-primary-500/20 text-white border-2 border-primary-500'
                  : isCurrentMonth
                  ? 'glass hover:bg-white/10 text-white'
                  : 'text-slate-600 hover:bg-white/5'
                }
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-sm font-medium">
                  {format(day, 'd')}
                </span>
                {count > 0 && (
                  <span className={`
                    text-xs mt-1 px-1.5 py-0.5 rounded-full
                    ${isSelected
                      ? 'bg-white text-primary-500'
                      : 'bg-primary-500 text-white'
                    }
                  `}>
                    {count}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
