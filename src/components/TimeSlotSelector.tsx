import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { TimeSlot, generateTimeSlots } from '@/lib/slotEngine';

interface TimeSlotSelectorProps {
  startTime: string;
  endTime: string;
  duration: number;
  bookedSlots: string[];
  selectedSlot: string | null;
  onSlotSelect: (slot: TimeSlot) => void;
  disabled?: boolean;
}

export default function TimeSlotSelector({
  startTime,
  endTime,
  duration,
  bookedSlots,
  selectedSlot,
  onSlotSelect,
  disabled = false,
}: TimeSlotSelectorProps) {
  const [allSlots, setAllSlots] = useState<TimeSlot[]>(() =>
    generateTimeSlots(startTime, endTime, duration)
  );

  useEffect(() => {
    setAllSlots(generateTimeSlots(startTime, endTime, duration));
  }, [startTime, endTime, duration]);

  const isBooked = (slot: TimeSlot) => bookedSlots.includes(slot.time);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-2"
    >
      {allSlots.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">
          No available slots for the selected date.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allSlots.map((slot) => {
            const booked = isBooked(slot);
            const isSelected = selectedSlot === slot.time;

            return (
              <motion.button
                key={slot.time}
                type="button"
                onClick={() => !booked && !disabled && onSlotSelect(slot)}
                disabled={booked || disabled}
                className={`
                  relative p-3 rounded-xl border text-center transition-all duration-200 text-sm font-medium
                  ${
                    booked
                      ? 'bg-slate-900/30 border-slate-700 text-slate-600 cursor-not-allowed opacity-40 line-through'
                      : isSelected
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/30 font-bold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-white/10 hover:text-white hover:border-white/20 cursor-pointer'
                  }
                `}
              >
                {booked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-red-400 font-medium">Booked</span>
                  </div>
                )}
                <span className="relative z-10">{slot.display}</span>
                {isSelected && !booked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center z-10"
                  >
                    <Check className="w-2.5 h-2.5 text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
