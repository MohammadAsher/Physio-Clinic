import { format, startOfMonth, getDaysInMonth, addMonths, subMonths, addDays, isSameDay } from 'date-fns';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FULL_DAY_NAMES, SHORT_DAY_NAMES, isWorkingDay, isDateInPast, getNormalizedAvailableDays, isDateOnLeave, DoctorLeave } from '@/lib/slotEngine';

interface CustomCalendarProps {
  availableDays: string[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  disabled?: boolean;
  doctorLeaves?: DoctorLeave[];
}

const slideUpVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
};

export default function CustomCalendar({
  availableDays,
  selectedDate,
  onDateSelect,
  disabled = false,
  doctorLeaves = [],
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const normalizedAvailableDays = getNormalizedAvailableDays(availableDays);

  const monthStart = startOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = monthStart.getDay();

  const calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const prevDate = addDays(monthStart, -i - 1);
    calendarDays.push({ date: prevDate, isCurrentMonth: false });
  }

  for (let i = 0; i < daysInMonth; i++) {
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), i + 1);
    calendarDays.push({ date, isCurrentMonth: true });
  }

  while (calendarDays.length < 42) {
    const lastDate = calendarDays[calendarDays.length - 1].date;
    const nextDate = addDays(lastDate, 1);
    calendarDays.push({ date: nextDate, isCurrentMonth: false });
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || disabled) return;
    if (isDateInPast(date)) return;
    if (!isWorkingDay(date, availableDays)) return;
    onDateSelect(date);
  };

  return (
    <motion.div
      variants={slideUpVariant}
      className="glass-card p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevMonth}
          disabled={disabled}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <h3 className="text-lg font-semibold text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNextMonth}
          disabled={disabled}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 text-center mb-2">
        {SHORT_DAY_NAMES.map((day, index) => {
          const isWorking = normalizedAvailableDays.includes(FULL_DAY_NAMES[index]);

          return (
            <div
              key={day}
              className={`text-xs font-medium py-2 ${
                isWorking ? 'text-sky-400' : 'text-slate-500'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="grid grid-cols-7 gap-1 md:gap-2"
        >
          {calendarDays.map((dayObj, idx) => {
            const date = dayObj.date;
            const isCurrentMonth = dayObj.isCurrentMonth;
            const _isToday = isSameDay(date, new Date());
            const isWorking = normalizedAvailableDays.includes(FULL_DAY_NAMES[date.getDay()]);
            const isInPast = isDateInPast(date);
            const onLeave = isCurrentMonth && doctorLeaves && isDateOnLeave(date, doctorLeaves);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isDisabled = !isCurrentMonth || !isWorking || isInPast || disabled;

            return (
              <motion.button
                key={idx}
                type="button"
                onClick={() => handleDateClick(date, isCurrentMonth)}
                disabled={isDisabled || onLeave}
                className={`
                  relative aspect-square flex items-center justify-center text-sm font-medium rounded-xl
                  transition-all duration-200
                  ${isDisabled || onLeave
                    ? 'text-slate-600 opacity-30 cursor-not-allowed'
                    : isSelected
                    ? 'bg-gradient-to-r from-rose-600 to-crimson-700 text-white shadow-lg shadow-rose-900/30'
                    : 'text-white hover:bg-red-500/20 cursor-pointer'
                  }
                `}
              >
                {isCurrentMonth && (
                  <>
                    <span>{format(date, 'd')}</span>
                    {_isToday && isWorking && !isSelected && !onLeave && (
                      <motion.span
                        layoutId="today-indicator"
                        className="absolute -bottom-0.5 w-1 h-1 bg-sky-400 rounded-full"
                      />
                    )}
                    {onLeave && (
                      <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-red-500/50" />
                    )}
                  </>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
