import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';
import { calculatePredictedEmptyDate, formatDate, getDaysUntilDate } from '../utils/dateUtils';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../constants';

interface CalendarViewProps {
  items: InventoryItem[];
  onClose: () => void;
}

interface CalendarEvent {
  date: Date;
  items: Array<{
    name: string;
    id: string;
    status: 'urgent' | 'warning' | 'safe';
  }>;
}

const CalendarView: React.FC<CalendarViewProps> = ({ items, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate calendar events from inventory items
  const calendarEvents = useMemo(() => {
    const events: { [key: string]: CalendarEvent } = {};
    
    items.forEach(item => {
      const predictedDate = calculatePredictedEmptyDate(
        item.currentStock,
        item.requirementPerRecipe,
        item.recipesToday
      );
      
      if (predictedDate) {
        const dateKey = predictedDate.toISOString().split('T')[0];
        const daysUntil = getDaysUntilDate(predictedDate);
        
        let status: 'urgent' | 'warning' | 'safe' = 'safe';
        if (daysUntil !== null && daysUntil <= item.leadTime) {
          status = 'urgent';
        } else if (daysUntil !== null && daysUntil <= item.leadTime + 2) {
          status = 'warning';
        }
        
        if (!events[dateKey]) {
          events[dateKey] = {
            date: new Date(predictedDate),
            items: []
          };
        }
        
        events[dateKey].items.push({
          name: item.name,
          id: item.id,
          status
        });
      }
    });
    
    return events;
  }, [items]);

  // Get calendar grid for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const calendarDays = getCalendarDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-full max-w-4xl mx-4 rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CalendarIcon />
            <h2 className="text-xl font-semibold text-slate-800">Kalender Prediksi Stok Habis</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-slate-100 rounded-md"
            >
              ←
            </button>
            <h3 className="text-lg font-medium text-slate-700">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-slate-100 rounded-md"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-slate-600">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dateKey = day.toISOString().split('T')[0];
              const events = calendarEvents[dateKey];
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === today.toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-1 border border-slate-200 ${
                    isCurrentMonth ? 'bg-white' : 'bg-slate-50'
                  } ${isToday ? 'ring-2 ring-sky-500' : ''}`}
                >
                  <div className={`text-sm ${
                    isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                  } ${isToday ? 'font-bold text-sky-600' : ''}`}>
                    {day.getDate()}
                  </div>
                  
                  {events && events.items.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {events.items.slice(0, 2).map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className={`text-xs px-1 py-0.5 rounded truncate ${
                            item.status === 'urgent' 
                              ? 'bg-red-100 text-red-700'
                              : item.status === 'warning'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                          title={item.name}
                        >
                          {item.name}
                        </div>
                      ))}
                      {events.items.length > 2 && (
                        <div className="text-xs text-slate-500 px-1">
                          +{events.items.length - 2} lainnya
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Keterangan:</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-slate-600">Kritis (≤ Lead Time)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span className="text-slate-600">Segera Pesan (≤ Lead Time + 2)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded"></div>
              <span className="text-slate-600">Aman</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;