import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarDay, DateTimePickerProps } from '../../../lib/types/phoneBookingTypes';
import { IconButton } from './phoneBookingComponents';
import { timeSlots } from '../../../lib/api/phoneBookingApi';

export const CalendarPicker: React.FC<DateTimePickerProps & {
  isOpen: boolean;
  onClose: () => void;
}> = ({ 
  selectedDate, 
  selectedTime, 
  onDateSelect, 
  onTimeSelect, 
  isOpen,
  onClose,
//   errors,
//   formData
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    
    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isDisabled: true
      });
    }
    
    // Add current month's days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isDisabled = date < today;
      
      days.push({
        date,
        isCurrentMonth: true,
        isDisabled
      });
    }
    
    // Add next month's days
    const totalCells = 42;
    const nextMonthDays = totalCells - days.length;
    for (let day = 1; day <= nextMonthDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isDisabled: true
      });
    }
    
    return days;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.isDisabled || !day.isCurrentMonth) return;
    onDateSelect(day.date);
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-4"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <IconButton
              icon={<ChevronLeft className="w-5 h-5" />}
              onClick={prevMonth}
              aria-label="Previous month"
            />
            
            <h3 className="font-semibold text-gray-900">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            
            <IconButton
              icon={<ChevronRight className="w-5 h-5" />}
              onClick={nextMonth}
              aria-label="Next month"
            />
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {calendarDays.map((day, index) => {
              const isSelected = selectedDate && 
                day.date.getDate() === selectedDate.getDate() &&
                day.date.getMonth() === selectedDate.getMonth() &&
                day.date.getFullYear() === selectedDate.getFullYear();
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={day.isDisabled}
                  className={`
                    h-10 rounded-lg text-sm font-medium transition-all duration-200
                    ${day.isDisabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : day.isCurrentMonth
                        ? isSelected
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                          : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                        : 'text-gray-400'
                    }
                    ${!day.isCurrentMonth && 'opacity-50'}
                  `}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Time Picker Section */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-4 border-t border-gray-100"
            >
              <h4 className="font-medium text-gray-900 mb-3">Select Time</h4>
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onTimeSelect(time)}
                    className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                      selectedTime === time
                        ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200'
                        : 'text-gray-700 border-gray-200 hover:border-rose-300 hover:bg-rose-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                onDateSelect(null as any);
                onTimeSelect('');
              }}
              className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};