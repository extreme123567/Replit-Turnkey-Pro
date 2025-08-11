import { format, startOfWeek, addDays, startOfMonth, endOfMonth, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";

/**
 * Format a date using date-fns format
 */
export function formatDate(date: Date, formatStr: string): string {
  return format(date, formatStr);
}

/**
 * Get the dates for the current week (Monday to Sunday)
 */
export function getWeekDates(referenceDate: Date = new Date()): Date[] {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const dates: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(monday, i));
  }
  
  return dates;
}

/**
 * Get all dates for a month view (including previous/next month dates to fill grid)
 */
export function getMonthDates(referenceDate: Date = new Date()): Date[] {
  const firstOfMonth = startOfMonth(referenceDate);
  const lastOfMonth = endOfMonth(referenceDate);
  
  // Start from the Sunday before or on the first of the month
  const startDate = startOfWeek(firstOfMonth, { weekStartsOn: 0 });
  
  const dates: Date[] = [];
  let currentDate = startDate;
  
  // Generate 6 weeks worth of dates (42 days) to fill the calendar grid
  for (let i = 0; i < 42; i++) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
}

/**
 * Navigate to the next week
 */
export function getNextWeek(currentDate: Date): Date {
  return addWeeks(currentDate, 1);
}

/**
 * Navigate to the previous week
 */
export function getPreviousWeek(currentDate: Date): Date {
  return subWeeks(currentDate, 1);
}

/**
 * Navigate to the next month
 */
export function getNextMonth(currentDate: Date): Date {
  return addMonths(currentDate, 1);
}

/**
 * Navigate to the previous month
 */
export function getPreviousMonth(currentDate: Date): Date {
  return subMonths(currentDate, 1);
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Get the start and end of a date range for a given period
 */
export function getDateRange(date: Date, period: 'week' | 'month' | 'day'): { start: Date; end: Date } {
  switch (period) {
    case 'week':
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      return {
        start: weekStart,
        end: addDays(weekStart, 6)
      };
    case 'month':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date)
      };
    case 'day':
      return {
        start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
      };
    default:
      return { start: date, end: date };
  }
}

/**
 * Convert a time string (e.g., "9:00 AM") to hours (24-hour format)
 */
export function timeStringToHours(timeString: string): number {
  const [time, period] = timeString.split(' ');
  const [hoursStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours;
}

/**
 * Generate time slots for a day
 */
export function generateTimeSlots(startHour: number = 8, endHour: number = 18, intervalMinutes: number = 60): string[] {
  const slots: string[] = [];
  
  for (let hour = startHour; hour < endHour; hour += intervalMinutes / 60) {
    const wholeHour = Math.floor(hour);
    const minutes = (hour % 1) * 60;
    
    const timeString = `${wholeHour > 12 ? wholeHour - 12 : wholeHour === 0 ? 12 : wholeHour}:${minutes.toString().padStart(2, '0')} ${wholeHour >= 12 ? 'PM' : 'AM'}`;
    slots.push(timeString);
  }
  
  return slots;
}
