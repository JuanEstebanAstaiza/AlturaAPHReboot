"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
}

const Calendar = ({ value, onChange, className }: CalendarProps) => {
  const [currentDate, setCurrentDate] = React.useState(value || new Date());
  const [selectedDate, setSelectedDate] = React.useState(value);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = firstDay === 0 ? 6 : firstDay; // Convert Sunday=0 to Saturday=6

  const days: (number | null)[] = [];
  for (let i = 0; i < startingDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const dayNames = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (d: number) => {
    const today = new Date();
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (d: number) => {
    if (!selectedDate) return false;
    return d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  return (
    <div className={cn("w-full max-w-sm p-4 rounded-lg border border-border bg-card", className)}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-muted rounded">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-lg">{monthNames[month]} {year}</span>
        <button onClick={nextMonth} className="p-1 hover:bg-muted rounded">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <button
            key={i}
            className={cn(
              "h-9 w-full text-sm rounded-md flex items-center justify-center",
              !d && "invisible",
              isToday(d!) && "bg-muted font-semibold",
              isSelected(d!) && "bg-primary text-primary-foreground",
              d && !isSelected(d!) && !isToday(d!) && "hover:bg-muted",
              d && "text-foreground"
            )}
            onClick={() => {
              if (d) {
                const newDate = new Date(year, month, d);
                setSelectedDate(newDate);
                onChange?.(newDate);
              }
            }}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
};

export { Calendar };
