import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, User, Calendar, Clock, UserCheck, Search, Download, Repeat, Eye, FilePlus } from 'lucide-react';
import { supabase } from '../supabaseClient';

const priorityConfig: { [key: string]: { color: string, icon: string, label: string } } = {
  high: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴', label: 'High' },
  medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🟡', label: 'Medium' },
  low: { color: 'bg-green-100 text-green-800 border-green-200', icon: '🟢', label: 'Low' }
};

// Pure function for generating recurring instances - outside component to avoid circular dependencies
const generateRecurringInstances = (tasks: any[], targetMonth: number, targetYear: number, deletedInstances: Set<string>) => {
  const instances: any[] = [];


  tasks.forEach(task => {
    try {
      // Basic safety check for task structure
      if (!task || typeof task !== 'object') {
        return;
      }

      // Skip deleted tasks
      if (task.is_deleted_instance || task.status === 'deleted') {
        return;
      }

      // Skip modified instances - they should not generate their own recurring instances
      // Modified instances are only used to override specific instances of their parent task
      if (task.is_modified_instance) {
        return;
      }

      if (!task.is_recurring || !task.recurring_pattern) {
        // For non-recurring tasks, only add them if they're in the target month
        if (task.month === targetMonth && task.year === targetYear) {
          instances.push(task);
        }
        return;
      }

      const startDate = new Date(task.year, task.month, task.date);
      const endDate = task.recurring_end_date ? new Date(task.recurring_end_date + 'T23:59:59') : new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
      const targetMonthStart = new Date(targetYear, targetMonth, 1);
      const targetMonthEnd = new Date(targetYear, targetMonth + 1, 0);

      // Only generate if the recurring period overlaps with target month
      if (startDate <= targetMonthEnd && endDate >= targetMonthStart) {
        let currentDate = new Date(startDate);
        let instanceCount = 0;
        const maxInstances = task.recurring_end_date ? 365 : 1000; // Allow up to 1 year of daily instances

        while (currentDate <= endDate && instanceCount < maxInstances) {
          // Check if this instance falls within the target month
          if (currentDate.getMonth() === targetMonth && currentDate.getFullYear() === targetYear) {
            const instanceKey = `${task.id}_${currentDate.getFullYear()}_${currentDate.getMonth()}_${currentDate.getDate()}`;

            // Skip this instance if it's been deleted (check both deletedInstances set and database records)
            if (deletedInstances.has(instanceKey)) {
              // Calculate next occurrence before skipping
              let nextDate: Date;
              const interval = (task.recurring_interval && typeof task.recurring_interval === 'number') ? task.recurring_interval : 1;
              const unit = (task.recurring_unit && typeof task.recurring_unit === 'string') ? task.recurring_unit : 'week';

              switch (task.recurring_pattern) {
                case 'daily':
                  nextDate = new Date(currentDate);
                  nextDate.setDate(currentDate.getDate() + interval);
                  break;
                case 'weekly':
                  nextDate = new Date(currentDate);
                  nextDate.setDate(currentDate.getDate() + (7 * interval));
                  break;
                case 'monthly':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  break;
                case 'yearly':
                  nextDate = new Date(currentDate);
                  nextDate.setFullYear(currentDate.getFullYear() + interval);
                  break;
                case 'weekdays':
                  nextDate = new Date(currentDate);
                  nextDate.setDate(currentDate.getDate() + 1);
                  break;
                case 'custom_days':
                  if (task.recurring_days && task.recurring_days.length > 0) {
                    nextDate = new Date(currentDate);
                    nextDate.setDate(currentDate.getDate() + 1);
                  } else {
                    nextDate = new Date(currentDate);
                    nextDate.setDate(currentDate.getDate() + 1);
                  }
                  break;
                case '1st_day_of_month':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  const firstDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
                  const firstDayOfWeek = firstDay.getDay();
                  const targetDay1st = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
                  const daysToAdd1st = (targetDay1st - firstDayOfWeek + 7) % 7;
                  nextDate = new Date(firstDay);
                  nextDate.setDate(firstDay.getDate() + daysToAdd1st);
                  break;
                case '2nd_day_of_month':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  const secondDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
                  const secondDayOfWeek = secondDay.getDay();
                  const targetDay2nd = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
                  const daysToAdd2nd = (targetDay2nd - secondDayOfWeek + 7) % 7;
                  nextDate = new Date(secondDay);
                  nextDate.setDate(secondDay.getDate() + daysToAdd2nd + 7); // Add 7 days for 2nd occurrence
                  break;
                case '3rd_day_of_month':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  const thirdDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
                  const thirdDayOfWeek = thirdDay.getDay();
                  const targetDay3rd = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
                  const daysToAdd3rd = (targetDay3rd - thirdDayOfWeek + 7) % 7;
                  nextDate = new Date(thirdDay);
                  nextDate.setDate(thirdDay.getDate() + daysToAdd3rd + 14); // Add 14 days for 3rd occurrence
                  break;
                case '4th_day_of_month':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  const fourthDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
                  const fourthDayOfWeek = fourthDay.getDay();
                  const targetDay4th = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
                  const daysToAdd4th = (targetDay4th - fourthDayOfWeek + 7) % 7;
                  nextDate = new Date(fourthDay);
                  nextDate.setDate(fourthDay.getDate() + daysToAdd4th + 21); // Add 21 days for 4th occurrence
                  break;
                case 'last_day_of_month':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  const lastDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0);
                  const lastDayOfWeek = lastDay.getDay();
                  const targetDayLast = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
                  const daysToSubtract = (lastDayOfWeek - targetDayLast + 7) % 7;
                  nextDate = new Date(lastDay);
                  nextDate.setDate(lastDay.getDate() - daysToSubtract);
                  break;
                default:
                  nextDate = new Date(currentDate);
                  nextDate.setDate(currentDate.getDate() + 1);
              }

              currentDate = nextDate;
              instanceCount++;
              continue;
            }

            // Check if there's a deleted instance record for this specific instance
            const hasDeletedInstance = tasks.some(t =>
              t.is_deleted_instance &&
              t.parent_task_id === task.id &&
              t.instance_key === instanceKey
            );

            if (hasDeletedInstance) {
              // Calculate next occurrence before skipping
              let nextDate: Date;
              const interval = (task.recurring_interval && typeof task.recurring_interval === 'number') ? task.recurring_interval : 1;
              const unit = (task.recurring_unit && typeof task.recurring_unit === 'string') ? task.recurring_unit : 'week';

              switch (task.recurring_pattern) {
                case 'daily':
                  nextDate = new Date(currentDate);
                  nextDate.setDate(currentDate.getDate() + interval);
                  break;
                case 'weekly':
                  nextDate = new Date(currentDate);
                  nextDate.setDate(currentDate.getDate() + (7 * interval));
                  break;
                case 'monthly':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  break;
                case 'yearly':
                  nextDate = new Date(currentDate);
                  nextDate.setFullYear(currentDate.getFullYear() + interval);
                  break;
                case 'weekdays':
                  nextDate = new Date(currentDate);
                  nextDate.setDate(currentDate.getDate() + 1);
                  break;
                case 'custom_days':
                  if (task.recurring_days && task.recurring_days.length > 0) {
                    nextDate = new Date(currentDate);
                    nextDate.setDate(currentDate.getDate() + 1);
                  } else {
                    nextDate = new Date(currentDate);
                    nextDate.setDate(currentDate.getDate() + 1);
                  }
                  break;
                case '1st_day_of_month':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  const firstDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
                  const firstDayOfWeek = firstDay.getDay();
                  const targetDay1st = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
                  const daysToAdd1st = (targetDay1st - firstDayOfWeek + 7) % 7;
                  nextDate = new Date(firstDay);
                  nextDate.setDate(firstDay.getDate() + daysToAdd1st);
                  break;
                case '2nd_day_of_month':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  const secondDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
                  const secondDayOfWeek = secondDay.getDay();
                  const targetDay2nd = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
                  const daysToAdd2nd = (targetDay2nd - secondDayOfWeek + 7) % 7;
                  nextDate = new Date(secondDay);
                  nextDate.setDate(secondDay.getDate() + daysToAdd2nd + 7); // Add 7 days for 2nd occurrence
                  break;
                case '3rd_day_of_month':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  const thirdDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
                  const thirdDayOfWeek = thirdDay.getDay();
                  const targetDay3rd = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
                  const daysToAdd3rd = (targetDay3rd - thirdDayOfWeek + 7) % 7;
                  nextDate = new Date(thirdDay);
                  nextDate.setDate(thirdDay.getDate() + daysToAdd3rd + 14); // Add 14 days for 3rd occurrence
                  break;
                case '4th_day_of_month':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  const fourthDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
                  const fourthDayOfWeek = fourthDay.getDay();
                  const targetDay4th = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
                  const daysToAdd4th = (targetDay4th - fourthDayOfWeek + 7) % 7;
                  nextDate = new Date(fourthDay);
                  nextDate.setDate(fourthDay.getDate() + daysToAdd4th + 21); // Add 21 days for 4th occurrence
                  break;
                case 'last_day_of_month':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  const lastDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0);
                  const lastDayOfWeek = lastDay.getDay();
                  const targetDayLast = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
                  const daysToSubtract = (lastDayOfWeek - targetDayLast + 7) % 7;
                  nextDate = new Date(lastDay);
                  nextDate.setDate(lastDay.getDate() - daysToSubtract);
                  break;
                case 'monthly_advanced':
                  nextDate = new Date(currentDate);
                  nextDate.setMonth(currentDate.getMonth() + interval);
                  const occurrence = task.recurring_occurrence || 'first';
                  const dayOfWeek = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;

                  if (occurrence === 'last') {
                    const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0);
                    const lastDayWeekday = lastDayOfMonth.getDay();
                    const daysBack = (lastDayWeekday - dayOfWeek + 7) % 7;
                    nextDate = new Date(lastDayOfMonth);
                    nextDate.setDate(lastDayOfMonth.getDate() - daysBack);
                  } else {
                    const firstDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
                    const firstDayWeekday = firstDayOfMonth.getDay();
                    const daysToFirstOccurrence = (dayOfWeek - firstDayWeekday + 7) % 7;
                    const occurrenceNumber = occurrence === 'first' ? 0 : occurrence === 'second' ? 1 : occurrence === 'third' ? 2 : 3;
                    nextDate = new Date(firstDayOfMonth);
                    nextDate.setDate(firstDayOfMonth.getDate() + daysToFirstOccurrence + (occurrenceNumber * 7));
                  }
                  break;
                case 'yearly_advanced':
                  nextDate = new Date(currentDate);
                  nextDate.setFullYear(currentDate.getFullYear() + interval);
                  const yearOccurrence = task.recurring_occurrence || 'first';
                  const yearDayOfWeek = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
                  const targetMonth = task.recurring_month !== null && task.recurring_month !== undefined ? task.recurring_month : 0;

                  nextDate.setMonth(targetMonth);

                  if (yearOccurrence === 'last') {
                    const lastDayOfTargetMonth = new Date(nextDate.getFullYear(), targetMonth + 1, 0);
                    const lastDayWeekdayYear = lastDayOfTargetMonth.getDay();
                    const daysBackYear = (lastDayWeekdayYear - yearDayOfWeek + 7) % 7;
                    nextDate = new Date(lastDayOfTargetMonth);
                    nextDate.setDate(lastDayOfTargetMonth.getDate() - daysBackYear);
                  } else {
                    const firstDayOfTargetMonth = new Date(nextDate.getFullYear(), targetMonth, 1);
                    const firstDayWeekdayYear = firstDayOfTargetMonth.getDay();
                    const daysToFirstOccurrenceYear = (yearDayOfWeek - firstDayWeekdayYear + 7) % 7;
                    const yearOccurrenceNumber = yearOccurrence === 'first' ? 0 : yearOccurrence === 'second' ? 1 : yearOccurrence === 'third' ? 2 : 3;
                    nextDate = new Date(firstDayOfTargetMonth);
                    nextDate.setDate(firstDayOfTargetMonth.getDate() + daysToFirstOccurrenceYear + (yearOccurrenceNumber * 7));
                  }
                  break;
                default:
                  nextDate = new Date(currentDate);
                  nextDate.setDate(currentDate.getDate() + 1);
              }

              currentDate = nextDate;
              instanceCount++;
              continue;
            }

            // Check if there's a modified instance record for this specific instance
            const modifiedInstance = tasks.find(t =>
              t.is_modified_instance &&
              t.parent_task_id === task.id &&
              t.instance_key === instanceKey
            );



            if (modifiedInstance) {
              // If there's a modified instance, use it instead of generating from original task
              const newInstance = {
                ...modifiedInstance,
                date: currentDate.getDate(),
                month: currentDate.getMonth(),
                year: currentDate.getFullYear(),
                parent_task_id: modifiedInstance.parent_task_id || task.id,
                is_recurring: true,
                is_recurring_instance: true,
                instance_key: instanceKey
              };
              instances.push(newInstance);
            } else {
              // Only generate from original task if no modified instance exists
              const newInstance = {
                ...task,
                id: task.id,
                date: currentDate.getDate(),
                month: currentDate.getMonth(),
                year: currentDate.getFullYear(),
                parent_task_id: task.id,
                is_recurring: true,
                is_recurring_instance: true,
                instance_key: instanceKey
              };
              instances.push(newInstance);
            }
          }

          // Calculate next occurrence based on pattern
          let nextDate: Date;
          const interval = (task.recurring_interval && typeof task.recurring_interval === 'number') ? task.recurring_interval : 1;
          const unit = (task.recurring_unit && typeof task.recurring_unit === 'string') ? task.recurring_unit : 'week';

          switch (unit) {
            case 'day':
              nextDate = new Date(currentDate);
              nextDate.setDate(currentDate.getDate() + interval);
              break;
            case 'week':
              nextDate = new Date(currentDate);
              nextDate.setDate(currentDate.getDate() + (7 * interval));
              break;
            case 'month':
              nextDate = new Date(currentDate);
              nextDate.setMonth(currentDate.getMonth() + interval);
              break;
            case 'year':
              nextDate = new Date(currentDate);
              nextDate.setFullYear(currentDate.getFullYear() + interval);
              break;
            case 'first_day_of_month':
              nextDate = new Date(currentDate);
              nextDate.setMonth(currentDate.getMonth() + interval);
              // Find first occurrence of selected day in next month
              const firstDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
              const firstDayOfWeek = firstDay.getDay();
              const targetDay = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
              const daysToAdd = (targetDay - firstDayOfWeek + 7) % 7;
              nextDate = new Date(firstDay);
              nextDate.setDate(firstDay.getDate() + daysToAdd);
              break;
            case '2nd_day_of_month':
              nextDate = new Date(currentDate);
              nextDate.setMonth(currentDate.getMonth() + interval);
              // Find 2nd occurrence of selected day in next month
              const secondDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
              const secondDayOfWeek = secondDay.getDay();
              const targetDay2nd = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
              const daysToAdd2nd = (targetDay2nd - secondDayOfWeek + 7) % 7;
              nextDate = new Date(secondDay);
              nextDate.setDate(secondDay.getDate() + daysToAdd2nd + 7); // Add 7 days for 2nd occurrence
              break;
            case '3rd_day_of_month':
              nextDate = new Date(currentDate);
              nextDate.setMonth(currentDate.getMonth() + interval);
              // Find 3rd occurrence of selected day in next month
              const thirdDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
              const thirdDayOfWeek = thirdDay.getDay();
              const targetDay3rd = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
              const daysToAdd3rd = (targetDay3rd - thirdDayOfWeek + 7) % 7;
              nextDate = new Date(thirdDay);
              nextDate.setDate(thirdDay.getDate() + daysToAdd3rd + 14); // Add 14 days for 3rd occurrence
              break;
            case '4th_day_of_month':
              nextDate = new Date(currentDate);
              nextDate.setMonth(currentDate.getMonth() + interval);
              // Find 4th occurrence of selected day in next month
              const fourthDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
              const fourthDayOfWeek = fourthDay.getDay();
              const targetDay4th = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
              const daysToAdd4th = (targetDay4th - fourthDayOfWeek + 7) % 7;
              nextDate = new Date(fourthDay);
              nextDate.setDate(fourthDay.getDate() + daysToAdd4th + 21); // Add 21 days for 4th occurrence
              break;
            case 'last_day_of_month':
              nextDate = new Date(currentDate);
              nextDate.setMonth(currentDate.getMonth() + interval);
              // Find last occurrence of selected day in next month
              const lastDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0);
              const lastDayOfWeek = lastDay.getDay();
              const targetDayLast = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
              const daysToSubtract = (lastDayOfWeek - targetDayLast + 7) % 7;
              nextDate = new Date(lastDay);
              nextDate.setDate(lastDay.getDate() - daysToSubtract);
              break;
            case 'monthly_advanced':
              // Advanced monthly pattern: e.g., "First Monday of every 3 months"
              nextDate = new Date(currentDate);
              nextDate.setMonth(currentDate.getMonth() + interval);
              const occurrence = task.recurring_occurrence || 'first';
              const dayOfWeek = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;

              if (occurrence === 'last') {
                // Find last occurrence of the day in the month
                const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0);
                const lastDayWeekday = lastDayOfMonth.getDay();
                const daysBack = (lastDayWeekday - dayOfWeek + 7) % 7;
                nextDate = new Date(lastDayOfMonth);
                nextDate.setDate(lastDayOfMonth.getDate() - daysBack);
              } else {
                // Find first/second/third/fourth occurrence
                const firstDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
                const firstDayWeekday = firstDayOfMonth.getDay();
                const daysToFirstOccurrence = (dayOfWeek - firstDayWeekday + 7) % 7;
                const occurrenceNumber = occurrence === 'first' ? 0 : occurrence === 'second' ? 1 : occurrence === 'third' ? 2 : 3;
                nextDate = new Date(firstDayOfMonth);
                nextDate.setDate(firstDayOfMonth.getDate() + daysToFirstOccurrence + (occurrenceNumber * 7));
              }
              break;
            case 'yearly_advanced':
              // Advanced yearly pattern: e.g., "Last Sunday in September every year"
              nextDate = new Date(currentDate);
              nextDate.setFullYear(currentDate.getFullYear() + interval);
              const yearOccurrence = task.recurring_occurrence || 'first';
              const yearDayOfWeek = task.recurring_days && task.recurring_days[0] !== undefined ? task.recurring_days[0] : 1;
              const targetMonth = task.recurring_month !== null && task.recurring_month !== undefined ? task.recurring_month : 0;

              // Set to the target month
              nextDate.setMonth(targetMonth);

              if (yearOccurrence === 'last') {
                // Find last occurrence of the day in the target month
                const lastDayOfTargetMonth = new Date(nextDate.getFullYear(), targetMonth + 1, 0);
                const lastDayWeekdayYear = lastDayOfTargetMonth.getDay();
                const daysBackYear = (lastDayWeekdayYear - yearDayOfWeek + 7) % 7;
                nextDate = new Date(lastDayOfTargetMonth);
                nextDate.setDate(lastDayOfTargetMonth.getDate() - daysBackYear);
              } else {
                // Find first/second/third/fourth occurrence in the target month
                const firstDayOfTargetMonth = new Date(nextDate.getFullYear(), targetMonth, 1);
                const firstDayWeekdayYear = firstDayOfTargetMonth.getDay();
                const daysToFirstOccurrenceYear = (yearDayOfWeek - firstDayWeekdayYear + 7) % 7;
                const yearOccurrenceNumber = yearOccurrence === 'first' ? 0 : yearOccurrence === 'second' ? 1 : yearOccurrence === 'third' ? 2 : 3;
                nextDate = new Date(firstDayOfTargetMonth);
                nextDate.setDate(firstDayOfTargetMonth.getDate() + daysToFirstOccurrenceYear + (yearOccurrenceNumber * 7));
              }
              break;
            default:
              nextDate = new Date(currentDate);
              nextDate.setDate(currentDate.getDate() + 1);
          }

          currentDate = nextDate;
          instanceCount++;
        }
      }
    } catch (error) {
      console.error('Error processing task in generateRecurringInstances:', error, task);
      // Continue with next task instead of crashing
    }
  });

  return instances;
};

const MMCCalendar = () => {
  // Check URL parameters for guest mode on initial load
  const [user, setUser] = useState<any>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('mode') === 'guest' ? 'guest' : null;
  });
  const [showLogin, setShowLogin] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    // Ensure we start with the current year
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const [activeView, setActiveView] = useState('Calendar');
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [showEarlyHours, setShowEarlyHours] = useState(false);
  const [showLateHours, setShowLateHours] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState<any[]>([]);
  const [dismissedReminders, setDismissedReminders] = useState<any[]>([]);
  const [reminderNotifications, setReminderNotifications] = useState<any[]>([]);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [dayPickerMonth, setDayPickerMonth] = useState<Date>(() => new Date());

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.month-year-picker') && !target.closest('.day-picker')) {
        setShowMonthYearPicker(false);
        setShowDayPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize day picker month when opening
  useEffect(() => {
    if (showDayPicker) {
      setDayPickerMonth(selectedDay);
    }
  }, [showDayPicker, selectedDay]);

  // When in day view and month changes in top bar, go to first of that month
  useEffect(() => {
    if (activeView === 'Day') {
      const selectedMonth = selectedDay.getMonth();
      const selectedYear = selectedDay.getFullYear();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // If the top bar month is different from the selected day's month, update selected day
      if (selectedMonth !== currentMonth || selectedYear !== currentYear) {
        const firstOfMonth = new Date(currentYear, currentMonth, 1);
        setSelectedDay(firstOfMonth);
      }
    }
  }, [currentDate, activeView]);


  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: boolean }>({});
  const [selectedTeamMember, setSelectedTeamMember] = useState<number | null>(null);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [loggedInUserTeamMemberId, setLoggedInUserTeamMemberId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Authentication state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarUserOpened, setSidebarUserOpened] = useState(false);
  const [mobileStateLocked, setMobileStateLocked] = useState(false);
  const [allTasks, setAllTasks] = useState<{ [key: string]: any[] }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [dragOverDate, setDragOverDate] = useState<number | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPersonalTasks, setShowPersonalTasks] = useState(false);
  const [showActivitiesDrawer, setShowActivitiesDrawer] = useState(false);
  const [showRemindersDrawer, setShowRemindersDrawer] = useState(false);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const [isActivitiesDrawerClosing, setIsActivitiesDrawerClosing] = useState(false);
  const [isRemindersDrawerClosing, setIsRemindersDrawerClosing] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [preSelectedDate, setPreSelectedDate] = useState<{ date: number, month: number, year: number } | null>(null);
  const [deletedInstances, setDeletedInstances] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState<'single' | 'all'>('single'); // For recurring task editing
  const [hoveredDay, setHoveredDay] = useState<{ date: number, month: number, year: number } | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showMobileNotification, setShowMobileNotification] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
  const [customCategory, setCustomCategory] = useState({
    name: '',
    color_class: 'bg-blue-100 text-blue-800 border-blue-200',
    type: 'Custom'
  });
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [reassignToCategory, setReassignToCategory] = useState('');
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [passwordChangeForm, setPasswordChangeForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [highlightedColumn, setHighlightedColumn] = useState<string | null>(null);
  const [highlightPhase, setHighlightPhase] = useState<'appearing' | 'glowing' | 'disappearing' | null>(null);
  const [highlightedToday, setHighlightedToday] = useState<boolean>(false);
  const [todayHighlightPhase, setTodayHighlightPhase] = useState<'appearing' | 'glowing' | 'disappearing' | null>(null);

  // Custom notification system
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>>([]);

  // Notification functions
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string, duration: number = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message, duration }]);

    // Auto-remove notification after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, duration);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const [newTask, setNewTask] = useState<any>({
    title: '',
    description: '',
    type: 'Blog',
    category: 'blogPosts',
    date: 1,
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
    time: '09:00',
    assignee: 1, // Keep for backward compatibility
    assignees: [], // New array for multiple assignees
    status: 'planned',
    priority: 'medium',
    is_recurring: false,
    recurring_pattern: '',
    recurring_interval: 1,
    recurring_unit: '',
    recurring_days: [],
    recurring_end_date: null,
    recurring_occurrence: null, // For advanced patterns (first, second, third, fourth, last)
    recurring_month: null, // For yearly advanced patterns
    comments: '',
    tags: [],
    created_by: 1,
    is_all_day: false,
    is_multiday: false,
    start_date: '',
    end_date: '',
    reminders: [],
    reminder_times: [],
    reminder_custom_time: '',
    reminder_names: {},
    reminder_custom_name: '',
    custom_reminders: [],
    has_reminders: false
  });

  const teamMembers = [
    { id: 1, name: 'Courtney Wright', role: 'Social and Digital Engagement Lead', avatar: 'CW', color: 'bg-blue-500', active: true },
    { id: 2, name: 'Ghislain Girard', role: 'Manager, Web Operations', avatar: 'GG', color: 'bg-green-500', active: true },
    { id: 3, name: 'Joy Pavelich', role: 'Executive Vice-President, Strategy and Operations', avatar: 'JP', color: 'bg-purple-500', active: true },
    { id: 4, name: 'Krystle Kung', role: 'Manager, Digital Marketing', avatar: 'KK', color: 'bg-pink-500', active: true },
    { id: 5, name: 'Lori-Anne Knarr', auth_name: 'Lori-Anne Thibault', email: 'lknarr@atlasinstitute.ca', role: 'Bilingual Communications Specialist', avatar: 'LK', color: 'bg-indigo-500', active: true },
    { id: 6, name: 'Meg McLean', auth_name: 'Meagan McLean', role: 'Social and Digital Engagement Lead', avatar: 'MM', color: 'bg-red-500', active: true }
  ];

  // Enhanced color options with accessibility considerations
  const colorOptions = [
    { name: 'Blue', class: 'bg-blue-100 text-blue-800 border-blue-200', hex: '#3B82F6' },
    { name: 'Green', class: 'bg-green-100 text-green-800 border-green-200', hex: '#10B981' },
    { name: 'Purple', class: 'bg-purple-100 text-purple-800 border-purple-200', hex: '#8B5CF6' },
    { name: 'Orange', class: 'bg-orange-100 text-orange-800 border-orange-200', hex: '#F59E0B' },
    { name: 'Red', class: 'bg-red-100 text-red-800 border-red-200', hex: '#EF4444' },
    { name: 'Yellow', class: 'bg-yellow-100 text-yellow-800 border-yellow-200', hex: '#EAB308' },
    { name: 'White', class: 'bg-white text-gray-800 border-gray-300', hex: '#FFFFFF' },
    { name: 'Indigo', class: 'bg-indigo-100 text-indigo-800 border-indigo-200', hex: '#6366F1' },
    { name: 'Gray', class: 'bg-gray-100 text-gray-800 border-gray-200', hex: '#6B7280' },
    { name: 'Teal', class: 'bg-teal-100 text-teal-800 border-teal-200', hex: '#14B8A6' },
    { name: 'Cyan', class: 'bg-cyan-100 text-cyan-800 border-cyan-200', hex: '#06B6D4' },
    { name: 'Lime', class: 'bg-lime-100 text-lime-800 border-lime-200', hex: '#84CC16' },
    { name: 'Tan', class: 'bg-stone-200 text-stone-800 border-stone-300', hex: '#A8A29E' },
    { name: 'Fuchsia', class: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200', hex: '#C026D3' },
    { name: 'Brown', class: 'bg-amber-50 text-amber-900 border-amber-200', hex: '#FEF3C7' },
    { name: 'Sky', class: 'bg-sky-100 text-sky-800 border-sky-200', hex: '#0EA5E9' }
  ];

  // Legacy category config for backward compatibility
  const categoryConfig = {
    blogPosts: { color: 'bg-blue-100 text-blue-800 border-blue-200', type: 'Blog' },
    socialMedia: { color: 'bg-green-100 text-green-800 border-green-200', type: 'Social' },
    campaigns: { color: 'bg-purple-100 text-purple-800 border-purple-200', type: 'Campaign' },
    emailMarketing: { color: 'bg-orange-100 text-orange-800 border-orange-200', type: 'Email' },
    vacations: { color: 'bg-gray-100 text-gray-800 border-gray-200', type: 'Vacation' }
  };

  const priorityConfig = {
    high: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴', label: 'High' },
    medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🟡', label: 'Medium' },
    low: { color: 'bg-green-100 text-green-800 border-green-200', icon: '🟢', label: 'Low' }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  const currentMonthTasks = allTasks[currentMonthKey] || [];

  // Function to load activities from database
  const loadActivities = useCallback(async () => {
    try {
      // Fetch recent activities without date filtering (let UI handle the filtering)
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error loading activities:', error);
        // If activities table doesn't exist, just set empty array and mark as loaded
        setRecentActivities([]);
        setActivitiesLoaded(true);
        return;
      }

      if (data) {
        const formattedActivities = data.map(activity => ({
          id: activity.id || Date.now() + Math.random(),
          type: activity.type || 'unknown',
          task: {
            id: activity.task_id || null,
            title: activity.task_title || 'Unknown Task'
          },
          message: activity.message || 'Unknown activity',
          user: activity.user_name || 'Unknown User',
          timestamp: new Date(activity.created_at || new Date()),
          oldStatus: activity.old_status || null,
          newStatus: activity.new_status || null
        }));


        setRecentActivities(formattedActivities);
        setActivitiesLoaded(true);
      } else {
        setRecentActivities([]);
        setActivitiesLoaded(true);
      }
    } catch (err) {
      console.error('Error loading activities:', err);
      // Set empty array and mark as loaded to prevent infinite retries
      setRecentActivities([]);
      setActivitiesLoaded(true);
    }
  }, []);

  // Authentication effects
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      // Check URL parameter first
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('mode') === 'guest') {
        setUser('guest');
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Auto-assign team member based on user's name
        assignTeamMemberToUser(user);
        // Reset filter to show all tasks by default
        setSelectedTeamMember(null);
      } else {
        setLoggedInUserTeamMemberId(null);
        setSelectedTeamMember(null);
      }
      setLoading(false);
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Don't override guest mode from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'guest') {
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          // Auto-assign team member based on user's name
          assignTeamMemberToUser(session.user);
          // Reset filter to show all tasks by default
          setSelectedTeamMember(null);
        } else {
          setLoggedInUserTeamMemberId(null);
          setSelectedTeamMember(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Function to assign team member based on user's name
  const assignTeamMemberToUser = (user: any) => {
    if (!user || user === 'guest') {
      setLoggedInUserTeamMemberId(null);
      return;
    }

    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    // Find matching team member
    const matchingMember = teamMembers.find(member => {
      const memberFullName = `${member.name}`.trim();
      // Check both display name and optional auth_name
      const authName = (member as any).auth_name || '';
      return memberFullName.toLowerCase() === fullName.toLowerCase() ||
        authName.toLowerCase() === fullName.toLowerCase();
    });

    if (matchingMember) {
      setLoggedInUserTeamMemberId(matchingMember.id);
      // Don't automatically set selectedTeamMember - let them see all tasks by default
    } else {
      setLoggedInUserTeamMemberId(null);
    }
  };

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('is_custom', { ascending: true })
          .order('display_name', { ascending: true });

        if (error) {
          console.error('Error loading categories:', error);
          // If categories table doesn't exist, use default categories
          const defaultCategories = Object.entries(categoryConfig).map(([key, config]) => ({
            id: key,
            name: key,
            display_name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            color_class: config.color,
            type: config.type,
            is_custom: false
          }));
          setCategories(defaultCategories);
          return;
        }

        if (data) {
          setCategories(data);
        } else {
          // Fallback if no data returned
          const defaultCategories = Object.entries(categoryConfig).map(([key, config]) => ({
            id: key,
            name: key,
            display_name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            color_class: config.color,
            type: config.type,
            is_custom: false
          }));
          setCategories(defaultCategories);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        // Fallback to default categories
        const defaultCategories = Object.entries(categoryConfig).map(([key, config]) => ({
          id: key,
          name: key,
          display_name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          color_class: config.color,
          type: config.type,
          is_custom: false
        }));
        setCategories(defaultCategories);
      }
    };

    loadCategories();
  }, []);

  // Initialize selectedFilters when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      setSelectedFilters(prev => {
        const newFilters = { ...prev };
        categories.forEach(category => {
          if (!(category.name in newFilters)) {
            newFilters[category.name] = true; // Default to showing all categories
          }
        });
        return newFilters;
      });
    }
  }, [categories]);

  const refreshTasks = useCallback(async () => {
    try {
      // Fetch all tasks to properly handle recurring instances and deleted instances
      const { data, error } = await supabase
        .from('tasks')
        .select('*');

      if (error) {
        console.error('Error refreshing tasks:', error);
        return;
      }

      // Group tasks by month-year
      const groupedTasks: { [key: string]: any[] } = {};
      (data || []).forEach(task => {
        const key = `${task.year}-${task.month}`;
        if (!groupedTasks[key]) {
          groupedTasks[key] = [];
        }
        groupedTasks[key].push(task);
      });
      setAllTasks(groupedTasks);

      // Rebuild deleted instances from database records
      const deletedInstanceKeys = new Set<string>();
      (data || []).forEach(task => {
        if (task.is_deleted_instance) {
          // Fallback to manual key construction if instance_key is missing
          const key = task.instance_key || `${task.parent_task_id}_${task.year}_${task.month}_${task.date}`;
          if (key) deletedInstanceKeys.add(key);
        }
      });
      setDeletedInstances(deletedInstanceKeys);
    } catch (err) {
      console.error('Unexpected error refreshing tasks:', err);
    }
  }, []);

  // Fetch tasks from Supabase for the current month
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await refreshTasks();

      // Load activities after tasks are loaded
      if (!activitiesLoaded) {
        await loadActivities();
      }
      setLoading(false);
    };

    initData();
  }, [refreshTasks, loadActivities, activitiesLoaded]);

  // Authentication functions
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setAuthError('Check your email for the confirmation link!');
      }
    } catch (error) {
      setAuthError('An unexpected error occurred');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setUser(data.user);
        setShowLogin(false);
        // Save credentials if remember me is checked
        saveCredentials(email, password);
        setEmail('');
        setPassword('');
        setRememberMe(false);
      }
    } catch (error) {
      setAuthError('An unexpected error occurred');
    }
  };

  const handleSignOut = async () => {
    if (user === 'guest') {
      setUser(null);
      setShowLogin(false);
    } else {
      await supabase.auth.signOut();
    }
    // Clear remembered credentials on logout
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
  };

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, []);

  // Save credentials if remember me is checked
  const saveCredentials = (email: string, password: string) => {
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberedPassword', password);
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    // Validate form
    if (passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword) {
      setPasswordChangeError('New passwords do not match');
      return;
    }

    if (passwordChangeForm.newPassword.length < 6) {
      setPasswordChangeError('Password must be at least 6 characters long');
      return;
    }

    // Check for password complexity
    const hasLowercase = /[a-z]/.test(passwordChangeForm.newPassword);
    const hasUppercase = /[A-Z]/.test(passwordChangeForm.newPassword);
    const hasNumber = /[0-9]/.test(passwordChangeForm.newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/~`]/.test(passwordChangeForm.newPassword);

    if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecial) {
      setPasswordChangeError('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');
      return;
    }

    try {
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordChangeForm.newPassword
      });

      if (error) {
        setPasswordChangeError(error.message);
      } else {
        setPasswordChangeSuccess('Password updated successfully!');
        setPasswordChangeForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowPasswordChangeModal(false);
          setPasswordChangeSuccess('');
        }, 2000);
      }
    } catch (error) {
      setPasswordChangeError('An unexpected error occurred');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setResetMessage('Error: ' + error.message);
      } else {
        setResetMessage('Password reset email sent! Check your inbox and follow the instructions.');
      }
    } catch (error) {
      setResetMessage('An unexpected error occurred');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    return days;
  };

  const getDaysInMonthCount = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper function to check if a task should appear on a specific date
  const isTaskOnDate = (task: any, date: number, month: number, year: number) => {
    // For multi-day tasks, check if the date falls within the start_date and end_date range
    if (task.is_multiday && task.start_date && task.end_date) {
      try {
        // Parse dates safely to avoid timezone issues
        const startDate = new Date(task.start_date + 'T00:00:00');
        const endDate = new Date(task.end_date + 'T23:59:59');
        const checkDate = new Date(year, month, date);


        return checkDate >= startDate && checkDate <= endDate;
      } catch (error) {
        console.error('Error parsing multi-day task dates:', error, task);
        return false;
      }
    }

    // For regular tasks, check the date, month, and year fields
    return task.date === date && task.month === month && task.year === year;
  };

  // Get all tasks from all months for recurring generation
  // Filter out modified instances and deleted instances since they'll be handled through the recurring generation process
  const allTasksFlat = useMemo(() => {
    return Object.values(allTasks).flat().filter(task =>
      !task.is_modified_instance &&
      !task.is_deleted_instance &&
      task.status !== 'deleted'
    );
  }, [allTasks]);

  // Use useMemo to generate recurring instances safely
  const allTasksWithRecurring = useMemo(() => {
    try {
      // Include all tasks (including modified instances) for the recurring generation process
      const allTasksIncludingModified = Object.values(allTasks).flat();

      // Generate recurring instances for current month and surrounding months (3 months range)
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const recurringInstances: any[] = [];

      // Generate instances for current month and 2 months before/after for better coverage
      for (let monthOffset = -2; monthOffset <= 2; monthOffset++) {
        const targetMonth = (currentMonth + monthOffset + 12) % 12;
        const targetYear = currentYear + Math.floor((currentMonth + monthOffset) / 12);

        const monthInstances = generateRecurringInstances(allTasksIncludingModified, targetMonth, targetYear, deletedInstances);
        recurringInstances.push(...monthInstances);
      }

      // Add multiday tasks from all months to ensure they appear across month boundaries
      const multidayTasksFromAllMonths = allTasksIncludingModified.filter(task =>
        task.is_multiday && task.start_date && task.end_date
      );

      // Combine recurring instances with multiday tasks from all months
      const allTasksWithMultiday = [...recurringInstances, ...multidayTasksFromAllMonths];

      // Remove duplicates based on task ID and date
      const uniqueTasks = allTasksWithMultiday.filter((task, index, self) =>
        index === self.findIndex(t => t.id === task.id && t.year === task.year && t.month === task.month && t.date === task.date)
      );

      return uniqueTasks;
    } catch (error) {
      console.error('Error generating recurring instances:', error);
      // Return just the flat tasks as fallback
      return allTasksFlat || [];
    }
  }, [allTasks, currentDate.getMonth(), currentDate.getFullYear(), deletedInstances]);

  // Helper functions for reminders
  const getReminderTime = (task: any, reminderType: string) => {
    const taskDate = new Date(task.year, task.month, task.date); // task.month is already 0-based
    if (task.time) {
      const [hours, minutes] = task.time.split(':').map(Number);
      taskDate.setHours(hours, minutes, 0, 0);
    } else {
      // If no time is set, default to 9:00 AM
      taskDate.setHours(9, 0, 0, 0);
    }

    const reminderDate = new Date(taskDate);

    switch (reminderType) {
      case '15min':
        reminderDate.setMinutes(reminderDate.getMinutes() - 15);
        break;
      case '30min':
        reminderDate.setMinutes(reminderDate.getMinutes() - 30);
        break;
      case '1hour':
        reminderDate.setHours(reminderDate.getHours() - 1);
        break;
      case '2hours':
        reminderDate.setHours(reminderDate.getHours() - 2);
        break;
      case '1day':
        reminderDate.setDate(reminderDate.getDate() - 1);
        break;
      case '2days':
        reminderDate.setDate(reminderDate.getDate() - 2);
        break;
      case '1week':
        reminderDate.setDate(reminderDate.getDate() - 7);
        break;
      case 'custom':
        // For custom reminders, we need to get the custom_time from the reminder object
        // This will be handled in the calling function
        return null;
      default:
        return null;
    }

    return reminderDate;
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const nextTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const upcomingReminders: Array<{ id: string, taskId: string, type: string, reminderType: string, reminderTime: Date, taskTitle: string, taskDate: Date, dismissed?: boolean, snoozedUntil?: Date }> = [];
    const pastReminders: Array<{ id: string, taskId: string, type: string, reminderType: string, reminderTime: Date, taskTitle: string, taskDate: Date, dismissed?: boolean, snoozedUntil?: Date }> = [];

    allTasksWithRecurring.forEach(task => {
      if (task.reminders && task.reminders.length > 0) {
        task.reminders.forEach((reminder: any) => {
          // Skip dismissed reminders
          if (reminder.dismissed) {
            return;
          }

          let reminderTime;
          if (reminder.type === 'custom' && reminder.custom_time) {
            // Handle custom reminder time
            reminderTime = new Date(reminder.custom_time);
          } else {
            // Handle predefined reminder types
            reminderTime = getReminderTime(task, reminder.type);
          }

          if (reminderTime) {
            const reminderData = {
              id: `${task.id}-${reminder.type}`,
              taskId: task.id,
              type: reminder.type,
              taskTitle: task.title,
              reminderTime: reminderTime,
              reminderType: reminder.type,
              reminderName: reminder.name || '',
              taskDate: new Date(task.year, task.month, task.date), // task.month is already 0-based
              dismissed: reminder.dismissed || false,
              snoozedUntil: undefined
            };

            if (reminderTime >= now && reminderTime <= nextTwoWeeks) {
              upcomingReminders.push(reminderData);
            } else if (reminderTime < now) {
              pastReminders.push(reminderData);
            }
          }
        });
      }
    });

    return {
      upcoming: upcomingReminders.sort((a, b) => a.reminderTime.getTime() - b.reminderTime.getTime()),
      past: pastReminders.sort((a, b) => b.reminderTime.getTime() - a.reminderTime.getTime()) // Most recent first
    };
  };

  const dismissReminder = async (reminderId: string) => {
    const [taskIdStr, reminderType] = reminderId.split('-');
    const taskId = parseInt(taskIdStr, 10); // Convert string to number

    // Try to find the task in allTasksWithRecurring first
    let taskToUpdate = allTasksWithRecurring.find(task => task.id === taskId);

    // If not found, try to find by parent_task_id (for recurring instances)
    if (!taskToUpdate) {
      taskToUpdate = allTasksWithRecurring.find(task => task.parent_task_id === taskId);
    }

    // If still not found, try to find in the original allTasks data
    if (!taskToUpdate) {
      const allTasksFlat = Object.values(allTasks).flat();
      taskToUpdate = allTasksFlat.find(task => task.id === taskId);
    }

    if (!taskToUpdate) {
      console.error('Task not found for reminder dismissal:', reminderId);
      return;
    }

    const updatedReminders = taskToUpdate.reminders.map((r: any) => {
      if (r.type === reminderType) {
        return { ...r, dismissed: true };
      }
      return r;
    });

    // Update in database - use the actual task ID we found
    const actualTaskId = taskToUpdate.id;
    const { error } = await supabase
      .from('tasks')
      .update({ reminders: updatedReminders })
      .eq('id', actualTaskId);

    if (error) {
      console.error('Error dismissing reminder in DB:', error);
      return;
    }

    // If DB update is successful, update local state
    // This will trigger the useEffect that updates upcomingReminders and dismissedReminders
    setAllTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      Object.keys(updatedTasks).forEach(monthKey => {
        updatedTasks[monthKey] = updatedTasks[monthKey].map(task =>
          task.id === actualTaskId
            ? { ...task, reminders: updatedReminders }
            : task
        );
      });
      return updatedTasks;
    });

    // Update reminder notifications (this is for browser notifications, not the drawer lists)
    setReminderNotifications(prev =>
      prev.map(reminder =>
        reminder.id === reminderId
          ? { ...reminder, dismissed: true }
          : reminder
      )
    );
  };

  const handleReminderClick = (reminder: any) => {
    // Find the task by taskId
    const task = allTasksWithRecurring.find(t => t.id === reminder.taskId);
    if (task) {
      setSelectedTask(ensureCompleteTaskData(task));
      setShowTaskModal(true);
      setShowRemindersDrawer(false); // Close the reminders drawer
    }
  };

  const handleHourSlotClick = (hour: number) => {
    if (user === 'guest') return;

    const timeString = `${hour.toString().padStart(2, '0')}:00`;

    setPreSelectedDate({
      date: selectedDay.getDate(),
      month: selectedDay.getMonth(),
      year: selectedDay.getFullYear()
    });

    setNewTask({
      title: '',
      description: '',
      type: 'Blog',
      category: '',
      date: selectedDay.getDate(),
      month: selectedDay.getMonth(),
      year: selectedDay.getFullYear(),
      time: timeString,
      assignee: null,
      assignees: [],
      priority: 'medium',
      status: 'planned',
      is_all_day: false,
      is_multiday: false,
      start_date: '',
      end_date: '',
      tags: [],
      comments: '',
      created_by: user && user !== 'guest' ? loggedInUserTeamMemberId : null,
      recurring: false,
      recurring_type: '',
      recurring_end_date: '',
      reminders: [],
      reminder_times: [],
      reminder_custom_time: '',
      reminder_names: {},
      reminder_custom_name: '',
      custom_reminders: [],
      has_reminders: false
    });

    setShowNewEntryModal(true);
  };


  const showReminderNotification = (reminder: any) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(`Reminder: ${reminder.taskTitle}`, {
            body: reminder.reminderName ? `${reminder.reminderName} - Task is due ${reminder.taskDate.toLocaleDateString()}` : `Task is due ${reminder.taskDate.toLocaleDateString()}`,
            icon: '/favicon.ico',
            tag: `reminder-${reminder.id}` // Prevent duplicate notifications
          });
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(`Reminder: ${reminder.taskTitle}`, {
              body: reminder.reminderName ? `${reminder.reminderName} - Task is due ${reminder.taskDate.toLocaleDateString()}` : `Task is due ${reminder.taskDate.toLocaleDateString()}`,
              icon: '/favicon.ico',
              tag: `reminder-${reminder.id}`
            });
          }
        });
      }
    }
  };

  // Reminder management useEffect
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Update upcoming reminders
    const reminders = getUpcomingReminders();
    setUpcomingReminders(reminders.upcoming);
    setDismissedReminders(reminders.past);

    // Check for due reminders every minute
    const interval = setInterval(() => {
      const now = new Date();
      const currentReminders = getUpcomingReminders();

      // Check for due reminders in both upcoming and past sections
      const allReminders = [...currentReminders.upcoming, ...currentReminders.past];
      const dueReminders = allReminders.filter(reminder =>
        reminder.reminderTime <= now &&
        !reminder.dismissed &&
        (!reminder.snoozedUntil || reminder.snoozedUntil <= now)
      );

      // Only show notifications for reminders we haven't already notified about
      dueReminders.forEach(reminder => {
        const alreadyNotified = reminderNotifications.some(notif => notif.id === reminder.id);
        if (!alreadyNotified) {
          showReminderNotification(reminder);
          setReminderNotifications(prev => [...prev, reminder]);
        }
      });

      // Update upcoming reminders
      setUpcomingReminders(currentReminders.upcoming);
      setDismissedReminders(currentReminders.past);
    }, 60000);

    return () => clearInterval(interval);
  }, [allTasksWithRecurring]);

  // Update reminders when tasks change
  useEffect(() => {
    const reminders = getUpcomingReminders();
    setUpcomingReminders(reminders.upcoming);
    setDismissedReminders(reminders.past);
  }, [allTasksWithRecurring]);

  // Update page title with past due reminder indicator
  useEffect(() => {
    const originalTitle = "MMC Calendar";
    if (dismissedReminders.length > 0) {
      document.title = `🔔 (${dismissedReminders.length}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }

    // Cleanup function to restore original title when component unmounts
    return () => {
      document.title = originalTitle;
    };
  }, [dismissedReminders]);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);


  const getTasksForDate = useCallback((date: number) => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();


    let tasks = allTasksWithRecurring.filter(task =>
      isTaskOnDate(task, date, currentMonth, currentYear) &&
      selectedFilters[task.category] &&
      task.status !== 'deleted' // Exclude deleted tasks
    );
    if (selectedTeamMember) tasks = tasks.filter(task =>
      (task.assignees && task.assignees.includes(selectedTeamMember)) ||
      task.assignee === selectedTeamMember // Backward compatibility
    );

    // Group tasks by type for proper ordering
    const multiDayTasks: any[] = [];
    const allDayTasks: any[] = [];
    const tasksByTime: { [key: string]: any[] } = {};

    tasks.forEach(task => {
      if (task.is_multiday) {
        multiDayTasks.push(task);
      } else if (task.is_all_day) {
        allDayTasks.push(task);
      } else {
        const timeKey = task.time || 'no-time';
        if (!tasksByTime[timeKey]) {
          tasksByTime[timeKey] = [];
        }
        tasksByTime[timeKey].push(task);
      }
    });

    // Sort multi-day tasks by title
    multiDayTasks.sort((a, b) => a.title.localeCompare(b.title));

    // Sort all-day tasks by title
    allDayTasks.sort((a, b) => a.title.localeCompare(b.title));

    // Sort timed tasks by time, then by title for conflicts
    const sortedTimedTasks: any[] = [];
    Object.keys(tasksByTime).sort((a, b) => {
      if (a === 'no-time') return 1;
      if (b === 'no-time') return -1;
      return a.localeCompare(b);
    }).forEach(timeKey => {
      const timeTasks = tasksByTime[timeKey];
      timeTasks.sort((a, b) => a.title.localeCompare(b.title));
      sortedTimedTasks.push(...timeTasks);
    });

    // Return multi-day tasks first, then all-day tasks, then timed tasks
    return [...multiDayTasks, ...allDayTasks, ...sortedTimedTasks];
  }, [allTasksWithRecurring, selectedFilters, selectedTeamMember, currentDate]);

  const getAllFilteredTasks = useCallback(() => {
    let tasks = allTasksWithRecurring.filter(task =>
      selectedFilters[task.category] &&
      task.status !== 'deleted' // Exclude deleted tasks
    );
    if (selectedTeamMember) tasks = tasks.filter(task =>
      (task.assignees && task.assignees.includes(selectedTeamMember)) ||
      task.assignee === selectedTeamMember // Backward compatibility
    );
    return tasks;
  }, [allTasksWithRecurring, selectedFilters, selectedTeamMember]);

  // Helper functions for drawer content
  const getOverdueTasks = useCallback(() => {
    // Use actual current date for overdue calculation
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    const todayDate = new Date(currentYear, currentMonth, currentDay);

    const overdueTasks = allTasksWithRecurring.filter(task => {
      if (task.status === 'completed' || task.status === 'deleted') return false;

      const taskDate = new Date(task.year, task.month, task.date);
      const isOverdue = taskDate < todayDate;


      return isOverdue;
    }).sort((a, b) => {
      const dateA = new Date(a.year, a.month, a.date);
      const dateB = new Date(b.year, b.month, b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return overdueTasks;
  }, [allTasksWithRecurring]);

  const getHighPriorityTasks = useCallback(() => {
    // Use actual current date for overdue calculation, but show tasks from viewed month
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    const todayDate = new Date(currentYear, currentMonth, currentDay);
    const viewedYear = currentDate.getFullYear();
    const viewedMonth = currentDate.getMonth();

    const highPriorityTasks = allTasksWithRecurring.filter(task => {
      if (task.priority !== 'high' || task.status === 'completed' || task.status === 'deleted') return false;

      const taskDate = new Date(task.year, task.month, task.date);
      const isOverdue = taskDate < todayDate;

      // Show high priority tasks from viewed month that are not overdue
      const isViewedMonth = task.year === viewedYear && task.month === viewedMonth;


      return !isOverdue && isViewedMonth;
    }).sort((a, b) => {
      const dateA = new Date(a.year, a.month, a.date);
      const dateB = new Date(b.year, b.month, b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return highPriorityTasks;
  }, [allTasksWithRecurring]);

  // Function to add activity to database and local state
  const addActivity = useCallback(async (activity: any) => {
    // Always add to local state immediately for better UX
    const newActivity = {
      id: Date.now() + Math.random(),
      type: activity.type || 'unknown',
      task: activity.task || { id: null, title: 'Unknown Task' },
      message: activity.message || 'Unknown activity',
      user: activity.user || 'Unknown User',
      timestamp: new Date(),
      oldStatus: activity.oldStatus || null,
      newStatus: activity.newStatus || null
    };

    setRecentActivities(prev => [newActivity, ...prev].slice(0, 20));

    try {
      // Also try to save to database (but don't wait for it)
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          type: activity.type || 'unknown',
          task_id: activity.task?.id || null,
          task_title: activity.task?.title || 'Unknown Task',
          message: activity.message || 'Unknown activity',
          user_id: activity.userId || activity.user || 'unknown',
          user_name: activity.user || 'Unknown User',
          old_status: activity.oldStatus || null,
          new_status: activity.newStatus || null
        }])
        .select();

      if (error) {
        console.error('Error saving activity to database:', error);
        // Activity is already in local state, so we're good
      }
    } catch (err) {
      console.error('Error adding activity to database:', err);
      // Activity is already in local state, so we're good
    }
  }, []);

  // Function to create a custom category
  const handleCreateCustomCategory = async () => {
    try {
      if (!customCategory.name.trim()) {
        showNotification('warning', 'Please enter a category name');
        return;
      }

      // Check if category name already exists
      const existingCategory = categories.find(cat =>
        cat.name.toLowerCase() === customCategory.name.toLowerCase()
      );

      if (existingCategory) {
        showNotification('warning', 'A category with this name already exists');
        return;
      }


      setLoading(true);

      // Use the selected color class directly
      const finalColorClass = customCategory.color_class;

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: customCategory.name.toLowerCase().replace(/\s+/g, '_'),
          display_name: customCategory.name,
          color_class: finalColorClass,
          type: customCategory.type,
          is_custom: true,
          created_by: loggedInUserTeamMemberId || 1
        }])
        .select();

      if (error) {
        console.error('Error creating category:', error);
        showNotification('error', `Error creating category: ${error.message}`);
        return;
      }

      if (data && data[0]) {
        // Add to local state
        setCategories(prev => [...prev, data[0]]);

        // Auto-select the newly created category in the new task modal
        setNewTask((prev: any) => ({
          ...prev,
          category: data[0].name,
          type: data[0].type
        }));

        // Close modal and reset form
        setShowCustomCategoryModal(false);
        setCustomCategory({
          name: '',
          color_class: 'bg-blue-100 text-blue-800 border-blue-200',
          type: 'Custom'
        });

        showNotification('success', 'Custom category created successfully!');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      showNotification('error', `Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };



  // Function to get category config (supports both legacy and custom categories)
  const getCategoryConfig = (categoryKey: string) => {
    // First check if it's a custom category
    const customCategory = categories.find(cat => cat.name === categoryKey);
    if (customCategory) {
      return {
        color: customCategory.color_class,
        type: customCategory.type,
        display_name: customCategory.display_name
      };
    }

    // Fallback to legacy category config
    const legacyConfig = categoryConfig[categoryKey] || { color: 'bg-gray-100 text-gray-800 border-gray-200', type: 'Custom' };
    return {
      ...legacyConfig,
      display_name: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1).replace(/([A-Z])/g, ' $1')
    };
  };

  // Function to get the display name for a task's category
  const getTaskCategoryDisplayName = (task: any) => {
    const config = getCategoryConfig(task.category);
    return config.display_name || task.type || 'General';
  };

  // Check if current user is admin (Ghislain Girard - both accounts)
  const isAdmin = useMemo(() => {
    // Check by team member ID (Ghislain Girard has ID 2)
    if (loggedInUserTeamMemberId === 2) return true;

    // Check by email address for ghgirard@atlasinstitute.ca
    if (user && user.email === 'ghgirard@atlasinstitute.ca') return true;

    return false;
  }, [loggedInUserTeamMemberId, user]);

  // Handle editing a category
  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowEditCategoryModal(true);
  };

  // Handle saving edited category
  const handleSaveEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      showNotification('warning', 'Please enter a category name');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('categories')
        .update({
          display_name: editingCategory.display_name,
          color_class: editingCategory.color_class,
          type: editingCategory.type
        })
        .eq('id', editingCategory.id)
        .select();

      if (error) {
        console.error('Error updating category:', error);
        showNotification('error', `Error updating category: ${error.message}`);
        return;
      }

      if (data && data[0]) {
        setCategories(prev =>
          prev.map(cat => cat.id === editingCategory.id ? data[0] : cat)
        );
        setShowEditCategoryModal(false);
        setEditingCategory(null);
        showNotification('success', 'Category updated successfully!');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      showNotification('error', `Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setLoading(true);

      // First, get all tasks using this category
      const { data: tasksUsingCategory, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, category')
        .eq('category', categoryToDelete.name);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        showNotification('error', `Error fetching tasks: ${tasksError.message}`);
        return;
      }

      if (tasksUsingCategory && tasksUsingCategory.length > 0) {
        if (!reassignToCategory) {
          showNotification('warning', 'Please select a category to reassign tasks to, or cancel to keep this category.');
          return;
        }

        // Reassign all tasks to the new category
        const { error: reassignError } = await supabase
          .from('tasks')
          .update({ category: reassignToCategory })
          .eq('category', categoryToDelete.name);

        if (reassignError) {
          console.error('Error reassigning tasks:', reassignError);
          showNotification('error', `Error reassigning tasks: ${reassignError.message}`);
          return;
        }
      }

      // Delete the category
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id);

      if (deleteError) {
        console.error('Error deleting category:', deleteError);
        showNotification('error', `Error deleting category: ${deleteError.message}`);
        return;
      }

      // Update local state
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
      setShowDeleteCategoryModal(false);
      setCategoryToDelete(null);
      setReassignToCategory('');

      showNotification('success', `Category deleted successfully! ${tasksUsingCategory?.length || 0} tasks were reassigned.`);
    } catch (err) {
      console.error('Unexpected error:', err);
      showNotification('error', `Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a user
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  // Handle saving edited user
  const handleSaveEditUser = async () => {
    if (!editingUser || !editingUser.name.trim()) {
      showNotification('warning', 'Please enter a user name');
      return;
    }

    try {
      setLoading(true);

      // For now, just show a placeholder message
      // In a real implementation, you would update the teamMembers array or database
      showNotification('info', 'User management functionality coming soon! This would update user details in the database.');

      setShowEditUserModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Unexpected error:', err);
      showNotification('error', `Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const getRecentActivities = useCallback(() => {
    // Filter to show the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const filteredActivities = recentActivities
      .filter(activity => activity.timestamp >= sevenDaysAgo)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return filteredActivities;
  }, [recentActivities]);

  // Memoized recent activities count to prevent flicker
  const recentActivitiesCount = useMemo(() => {
    return getRecentActivities().length;
  }, [getRecentActivities]);

  // Dynamic filter counts based on available categories for current month
  const filterCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    categories.forEach(category => {
      counts[category.name] = allTasksWithRecurring.filter(t =>
        t.category === category.name &&
        t.status !== 'deleted' &&
        t.month === currentMonth &&
        t.year === currentYear &&
        (!selectedTeamMember || (t.assignees && t.assignees.includes(selectedTeamMember)) || t.assignee === selectedTeamMember)
      ).length;
    });
    return counts;
  }, [allTasksWithRecurring, selectedTeamMember, categories, currentDate]);

  const allFilteredTasks = getAllFilteredTasks();

  // Filter tasks to only include those for the current month
  const currentMonthFilteredTasks = allFilteredTasks.filter(task =>
    task.month === currentDate.getMonth() && task.year === currentDate.getFullYear()
  );

  const upcomingCount = currentMonthFilteredTasks.filter(t => t.status === 'planned').length;
  const inProgressCount = currentMonthFilteredTasks.filter(t => t.status === 'in-progress').length;
  const reviewCount = currentMonthFilteredTasks.filter(t => t.status === 'review').length;
  const completedCount = currentMonthFilteredTasks.filter(t => t.status === 'completed').length;
  const lowPriorityCount = currentMonthFilteredTasks.filter(t => (t.priority === 'low') && t.status !== 'completed' && t.status !== 'deleted').length;
  const mediumPriorityCount = currentMonthFilteredTasks.filter(t => (t.priority === 'medium' || !t.priority) && t.status !== 'completed' && t.status !== 'deleted').length;
  const highPriorityCount = currentMonthFilteredTasks.filter(t => (t.priority === 'high') && t.status !== 'completed' && t.status !== 'deleted').length;

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleTeamMemberClick = (memberId: number | null) => {
    setSelectedTeamMember(selectedTeamMember === memberId ? null : memberId);
  };

  const handleNewEntry = () => {
    setPreSelectedDate(null);
    const today = new Date();
    setNewTask({
      title: '',
      description: '',
      type: 'Blog',
      category: '',
      date: today.getDate(),
      month: today.getMonth(),
      year: today.getFullYear(),
      time: '09:00',
      assignee: null,
      assignees: [],
      status: 'planned',
      priority: 'medium',
      comments: '',
      tags: [],
      created_by: user && user !== 'guest' ? loggedInUserTeamMemberId : null,
      is_multiday: false,
      start_date: '',
      end_date: ''
    });
    setShowNewEntryModal(true);
  };

  const handleDayClick = (day: number) => {
    // Switch to day view for the clicked day
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDay(clickedDate);
    setActiveView('Day');

    // Use the robust scroll function
    scrollDayViewToTop();
  };

  const handleDayHover = (day: number) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    // Set a new timeout to show the popup after 1000ms
    const timeout = setTimeout(() => {
      setHoveredDay({
        date: day,
        month: currentDate.getMonth(),
        year: currentDate.getFullYear()
      });
    }, 1000);

    setHoverTimeout(timeout);
  };

  const handleDayLeave = () => {
    // Clear the timeout if user leaves before 1000ms
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    // Hide the popup
    setHoveredDay(null);
  };

  const handleDayViewClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDay(clickedDate);
    setActiveView('Day');
    scrollDayViewToTop();
    setHoveredDay(null); // Hide popup after clicking
  };

  const handleNewTaskFromDay = (day: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent day click from firing

    setPreSelectedDate({
      date: day,
      month: currentDate.getMonth(),
      year: currentDate.getFullYear()
    });
    setNewTask({
      title: '',
      description: '',
      type: 'Blog',
      category: '',
      date: day,
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      time: '09:00',
      assignee: null,
      assignees: [],
      status: 'planned',
      priority: 'medium',
      comments: '',
      tags: [],
      created_by: user && user !== 'guest' ? loggedInUserTeamMemberId : null,
      is_multiday: false,
      start_date: '',
      end_date: ''
    });
    setShowNewEntryModal(true);
  };

  // Helper function to ensure complete task data
  const ensureCompleteTaskData = (task: any) => {
    // Always try to find the complete task data from allTasks
    const allTasksFlat = Object.values(allTasks).flat();
    const completeTask = allTasksFlat.find(t => t.id === task.id);

    if (completeTask) {
      // Use the complete task data, but preserve any instance-specific data
      const result = {
        ...completeTask,
        // Preserve instance-specific data if this is a recurring instance
        date: task.date || completeTask.date,
        month: task.month || completeTask.month,
        year: task.year || completeTask.year,
        instance_key: task.instance_key || completeTask.instance_key,
        is_recurring_instance: task.is_recurring_instance || completeTask.is_recurring_instance,
        parent_task_id: task.parent_task_id || completeTask.parent_task_id,
        // Provide better fallbacks for null values
        type: completeTask.type || 'Task',
        assignee: completeTask.assignee || null,
        assignees: completeTask.assignees || [],
        created_at: completeTask.created_at || null,
        created_by: completeTask.created_by || null,
        description: completeTask.description || 'No description',
        color: completeTask.color || getCategoryConfig(completeTask.category).color,
        time: completeTask.time || '',
        category: completeTask.category || 'General',
        tags: completeTask.tags || [],
        comments: completeTask.comments || null
      };
      return result;
    }

    // Fallback to the original task with defaults
    return {
      ...task,
      type: task.type || 'Task',
      status: task.status || 'planned',
      priority: task.priority || 'medium',
      assignee: task.assignee || null,
      assignees: task.assignees || [],
      description: task.description || 'No description',
      color: task.color || getCategoryConfig(task.category).color,
      time: task.time || '',
      category: task.category || 'General',
      created_at: task.created_at || null,
      created_by: task.created_by || null,
      tags: task.tags || [],
      comments: task.comments || null
    };
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(ensureCompleteTaskData(task));
    setShowTaskModal(true);
  };

  const handleSaveNewTask = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!newTask.category) {
        showNotification('warning', 'Please select a category');
        return;
      }
      if (!newTask.assignees || newTask.assignees.length === 0) {
        showNotification('warning', 'Please select at least one assignee');
        return;
      }
      if (!newTask.created_by) {
        showNotification('warning', 'Please select who created this task');
        return;
      }
      if (newTask.is_recurring && (!newTask.recurring_unit || newTask.recurring_unit === '')) {
        showNotification('warning', 'Please select a recurring period');
        return;
      }

      // Clean up date fields - convert empty strings to null for database
      const cleanedTask = { ...newTask };
      if (cleanedTask.start_date === '') cleanedTask.start_date = null;
      if (cleanedTask.end_date === '') cleanedTask.end_date = null;
      if (cleanedTask.recurring_end_date === '') cleanedTask.recurring_end_date = null;

      // For advanced recurring patterns, adjust the start date to the next valid occurrence
      if (cleanedTask.is_recurring && (cleanedTask.recurring_unit === 'monthly_advanced' || cleanedTask.recurring_unit === 'yearly_advanced')) {
        const today = new Date();
        const occurrence = cleanedTask.recurring_occurrence || 'first';
        const dayOfWeek = cleanedTask.recurring_days && cleanedTask.recurring_days[0] !== undefined ? cleanedTask.recurring_days[0] : 1;

        let nextOccurrenceDate: Date;

        if (cleanedTask.recurring_unit === 'monthly_advanced') {
          // Calculate the occurrence date for the current month
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();

          if (occurrence === 'last') {
            const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
            const lastDayWeekday = lastDayOfMonth.getDay();
            const daysBack = (lastDayWeekday - dayOfWeek + 7) % 7;
            nextOccurrenceDate = new Date(lastDayOfMonth);
            nextOccurrenceDate.setDate(lastDayOfMonth.getDate() - daysBack);
          } else {
            const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
            const firstDayWeekday = firstDayOfMonth.getDay();
            const daysToFirstOccurrence = (dayOfWeek - firstDayWeekday + 7) % 7;
            const occurrenceNumber = occurrence === 'first' ? 0 : occurrence === 'second' ? 1 : occurrence === 'third' ? 2 : 3;
            nextOccurrenceDate = new Date(firstDayOfMonth);
            nextOccurrenceDate.setDate(firstDayOfMonth.getDate() + daysToFirstOccurrence + (occurrenceNumber * 7));
          }

          // If the occurrence date has already passed this month, move to next month
          if (nextOccurrenceDate < today) {
            const nextMonth = currentMonth + 1;
            const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
            const adjustedMonth = nextMonth > 11 ? 0 : nextMonth;

            if (occurrence === 'last') {
              const lastDayOfNextMonth = new Date(nextYear, adjustedMonth + 1, 0);
              const lastDayWeekday = lastDayOfNextMonth.getDay();
              const daysBack = (lastDayWeekday - dayOfWeek + 7) % 7;
              nextOccurrenceDate = new Date(lastDayOfNextMonth);
              nextOccurrenceDate.setDate(lastDayOfNextMonth.getDate() - daysBack);
            } else {
              const firstDayOfNextMonth = new Date(nextYear, adjustedMonth, 1);
              const firstDayWeekday = firstDayOfNextMonth.getDay();
              const daysToFirstOccurrence = (dayOfWeek - firstDayWeekday + 7) % 7;
              const occurrenceNumber = occurrence === 'first' ? 0 : occurrence === 'second' ? 1 : occurrence === 'third' ? 2 : 3;
              nextOccurrenceDate = new Date(firstDayOfNextMonth);
              nextOccurrenceDate.setDate(firstDayOfNextMonth.getDate() + daysToFirstOccurrence + (occurrenceNumber * 7));
            }
          }
        } else if (cleanedTask.recurring_unit === 'yearly_advanced') {
          // Calculate the occurrence date for the current year
          const currentYear = today.getFullYear();
          const targetMonth = cleanedTask.recurring_month !== null && cleanedTask.recurring_month !== undefined ? cleanedTask.recurring_month : 0;

          if (occurrence === 'last') {
            const lastDayOfTargetMonth = new Date(currentYear, targetMonth + 1, 0);
            const lastDayWeekday = lastDayOfTargetMonth.getDay();
            const daysBack = (lastDayWeekday - dayOfWeek + 7) % 7;
            nextOccurrenceDate = new Date(lastDayOfTargetMonth);
            nextOccurrenceDate.setDate(lastDayOfTargetMonth.getDate() - daysBack);
          } else {
            const firstDayOfTargetMonth = new Date(currentYear, targetMonth, 1);
            const firstDayWeekday = firstDayOfTargetMonth.getDay();
            const daysToFirstOccurrence = (dayOfWeek - firstDayWeekday + 7) % 7;
            const occurrenceNumber = occurrence === 'first' ? 0 : occurrence === 'second' ? 1 : occurrence === 'third' ? 2 : 3;
            nextOccurrenceDate = new Date(firstDayOfTargetMonth);
            nextOccurrenceDate.setDate(firstDayOfTargetMonth.getDate() + daysToFirstOccurrence + (occurrenceNumber * 7));
          }

          // If the occurrence date has already passed this year, move to next year
          if (nextOccurrenceDate < today) {
            const nextYear = currentYear + 1;

            if (occurrence === 'last') {
              const lastDayOfTargetMonth = new Date(nextYear, targetMonth + 1, 0);
              const lastDayWeekday = lastDayOfTargetMonth.getDay();
              const daysBack = (lastDayWeekday - dayOfWeek + 7) % 7;
              nextOccurrenceDate = new Date(lastDayOfTargetMonth);
              nextOccurrenceDate.setDate(lastDayOfTargetMonth.getDate() - daysBack);
            } else {
              const firstDayOfTargetMonth = new Date(nextYear, targetMonth, 1);
              const firstDayWeekday = firstDayOfTargetMonth.getDay();
              const daysToFirstOccurrence = (dayOfWeek - firstDayWeekday + 7) % 7;
              const occurrenceNumber = occurrence === 'first' ? 0 : occurrence === 'second' ? 1 : occurrence === 'third' ? 2 : 3;
              nextOccurrenceDate = new Date(firstDayOfTargetMonth);
              nextOccurrenceDate.setDate(firstDayOfTargetMonth.getDate() + daysToFirstOccurrence + (occurrenceNumber * 7));
            }
          }
        }

        // Update the task's date to the calculated next occurrence
        if (nextOccurrenceDate!) {
          cleanedTask.date = nextOccurrenceDate.getDate();
          cleanedTask.month = nextOccurrenceDate.getMonth();
          cleanedTask.year = nextOccurrenceDate.getFullYear();
        }
      }


      // Process reminders
      const reminders: Array<{ type: string, custom_time?: any, name?: string }> = [];
      if (cleanedTask.reminder_times && cleanedTask.reminder_times.length > 0) {
        cleanedTask.reminder_times.forEach((time: string) => {
          reminders.push({ type: time, name: cleanedTask.reminder_names?.[time] || '' });
        });
      }
      // Process custom reminders (both single and multiple)
      if (cleanedTask.reminder_custom_time) {
        reminders.push({
          type: 'custom',
          custom_time: cleanedTask.reminder_custom_time,
          name: cleanedTask.reminder_custom_name || ''
        });
      }
      if (cleanedTask.custom_reminders && cleanedTask.custom_reminders.length > 0) {
        cleanedTask.custom_reminders.forEach((customReminder: any) => {
          if (customReminder.time && customReminder.time.trim() !== '') {
            reminders.push({
              type: 'custom',
              custom_time: customReminder.time,
              name: customReminder.name || ''
            });
          }
        });
      }

      const task = {
        ...cleanedTask,
        color: getCategoryConfig(newTask.category).color,
        created_by: newTask.created_by,
        reminders: reminders
      };

      // Remove fields that are only used for UI state, not database
      delete task.has_reminders;
      delete task.id; // Let database auto-generate the ID
      delete task.reminder_times; // UI state only
      delete task.reminder_custom_time; // UI state only
      delete task.reminder_names; // UI state only
      delete task.reminder_custom_name; // UI state only
      delete task.custom_reminders; // UI state only



      const { data, error } = await supabase.from('tasks').insert([task]).select();

      if (error) {
        console.error('Error saving task:', error);
        showNotification('error', `Error saving task: ${error.message}`);
        return;
      }

      // Add activity for new task creation using the returned task data (which includes the ID)
      if (data && data[0]) {
        addActivity({
          type: 'task_created',
          task: data[0], // Use the task data returned from database (includes ID)
          message: `Created new task: ${data[0].title}`,
          user: teamMembers.find(m => m.id === data[0].created_by)?.name || 'Unknown',
          userId: data[0].created_by
        });
      }

      setShowNewEntryModal(false);
      await refreshTasks();
      // Refresh activities to show the new activity
      loadActivities();
    } catch (err) {
      console.error('Unexpected error:', err);
      showNotification('error', `Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = () => {
    // Get the latest task data from allTasksWithRecurring to ensure we have the most up-to-date information
    const latestTask = allTasksWithRecurring.find(task => task.id === selectedTask.id) || selectedTask;

    // If this is a recurring task or recurring instance, automatically open the recurring task editor
    if (latestTask.is_recurring || latestTask.is_recurring_instance) {
      handleEditRecurringTask();
      return;
    }

    // Initialize reminder names from existing reminders (only non-dismissed ones)
    const reminderNames: { [key: string]: string } = {};
    const customReminders: Array<{ time: string, name: string }> = [];
    const activeReminderTypes: string[] = []; // Track active reminder types for checkboxes

    if (latestTask.reminders) {
      latestTask.reminders.forEach((reminder: any) => {
        // Only include non-dismissed reminders
        if (!reminder.dismissed) {
          if (reminder.type !== 'custom') {
            // Add to active reminder types for checkboxes
            activeReminderTypes.push(reminder.type);
            if (reminder.name) {
              reminderNames[reminder.type] = reminder.name;
            }
          } else if (reminder.type === 'custom') {
            customReminders.push({
              time: reminder.custom_time || '',
              name: reminder.name || ''
            });
          }
        }
      });
    }

    setEditingTask({
      ...latestTask,
      start_date: latestTask.start_date || '',
      end_date: latestTask.end_date || '',
      recurring_end_date: latestTask.recurring_end_date || '',
      reminder_times: activeReminderTypes, // Use only active (non-dismissed) reminder types
      reminder_names: reminderNames,
      reminder_custom_name: latestTask.reminders?.find((r: any) => r.type === 'custom' && !r.dismissed)?.name || '',
      custom_reminders: customReminders,
      has_reminders: latestTask.reminders && latestTask.reminders.some((r: any) => !r.dismissed)
    });
    setEditMode('single'); // Default to single instance editing
    setShowTaskModal(false);
    setShowEditModal(true);
  };

  const handleEditRecurringTask = async () => {
    try {
      setLoading(true);

      // Get the original recurring task (not the instance)
      const taskIdToEdit = selectedTask.is_recurring_instance ? selectedTask.parent_task_id : selectedTask.id;

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskIdToEdit)
        .single();

      if (error) {
        console.error('Error fetching recurring task:', error);
        showNotification('error', `Error loading recurring task: ${error.message}`);
        return;
      }

      // Initialize reminder names from existing reminders (only non-dismissed ones)
      const reminderNames: { [key: string]: string } = {};
      const customReminders: Array<{ time: string, name: string }> = [];
      const activeReminderTypes: string[] = []; // Track active reminder types for checkboxes

      if (data.reminders) {
        data.reminders.forEach((reminder: any) => {
          // Only include non-dismissed reminders
          if (!reminder.dismissed) {
            if (reminder.type !== 'custom') {
              // Add to active reminder types for checkboxes
              activeReminderTypes.push(reminder.type);
              if (reminder.name) {
                reminderNames[reminder.type] = reminder.name;
              }
            } else if (reminder.type === 'custom') {
              customReminders.push({
                time: reminder.custom_time || '',
                name: reminder.name || ''
              });
            }
          }
        });
      }

      setEditingTask({
        ...data,
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        recurring_end_date: data.recurring_end_date || '',
        reminder_times: activeReminderTypes, // Use only active (non-dismissed) reminder types
        reminder_names: reminderNames,
        reminder_custom_name: data.reminders?.find((r: any) => r.type === 'custom' && !r.dismissed)?.name || '',
        custom_reminders: customReminders,
        has_reminders: data.reminders && data.reminders.some((r: any) => !r.dismissed)
      });
      setEditMode('all'); // Set to edit all instances
      setShowTaskModal(false);
      setShowEditModal(true);
    } catch (err) {
      console.error('Unexpected error:', err);
      showNotification('error', `Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateTask = () => {
    const today = new Date();
    setNewTask({
      title: selectedTask.title + ' (Copy)',
      description: selectedTask.description,
      type: selectedTask.type,
      category: selectedTask.category,
      date: today.getDate(),
      month: today.getMonth(),
      year: today.getFullYear(),
      time: selectedTask.time,
      assignee: selectedTask.assignee,
      assignees: selectedTask.assignees || [],
      status: 'planned',
      priority: selectedTask.priority || 'medium',
      comments: selectedTask.comments || '',
      tags: selectedTask.tags || [],
      created_by: user && user !== 'guest' ? loggedInUserTeamMemberId : null,
      color: ''
    });
    setShowTaskModal(false);
    setShowNewEntryModal(true);
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const allTasksFlat = Object.values(allTasks).flat();
    const results = allTasksFlat.filter(task => {
      // Exclude explicitly deleted tasks
      if (task.status === 'deleted') return false;
      if (task.is_deleted_instance) return false;

      // Exclude tasks that correspond to a deleted instance (e.g. parent task whose start date instance was deleted)
      const instanceKey = `${task.id}_${task.year}_${task.month}_${task.date}`;
      if (deletedInstances.has(instanceKey)) return false;

      return (
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description.toLowerCase().includes(query.toLowerCase()) ||
        task.type.toLowerCase().includes(query.toLowerCase()) ||
        getAssigneesDisplay(task).toLowerCase().includes(query.toLowerCase())
      );
    });

    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSearchResultClick = (task: any) => {
    setSelectedTask(ensureCompleteTaskData(task));
    setShowTaskModal(true);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setShowSearchInput(false);
  };

  const handleSearchIconClick = () => {
    setShowSearchInput(true);
  };

  const handleSearchInputBlur = () => {
    // Delay hiding the input to allow clicking on search results
    setTimeout(() => {
      setShowSearchInput(false);
      setShowSearchResults(false);
    }, 200);
  };

  // Export functionality
  const exportToCSV = () => {
    const allTasksFlat = Object.values(allTasks).flat();
    const csvContent = [
      ['Title', 'Description', 'Type', 'Category', 'Date', 'Month', 'Year', 'Time', 'Assignee', 'Status', 'Priority'],
      ...allTasksFlat.map(task => [
        task.title,
        task.description,
        task.type,
        task.category,
        task.date,
        task.month + 1, // Convert to 1-based month
        task.year,
        task.time || '',
        getAssigneesDisplay(task),
        task.status,
        task.priority || 'medium'
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mmc-calendar-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };




  // Close search results and export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
        setShowSearchInput(false);
      }
      if (!target.closest('.export-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Aggressive mobile detection and sidebar management
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 1366;
      const wasMobile = isMobile;

      // If we're already mobile and locked, don't change it
      if (mobileStateLocked && isMobile) {
        return;
      }

      // Only update mobile state if it actually changed
      if (isMobileDevice !== wasMobile) {
        setIsMobile(isMobileDevice);

        if (isMobileDevice) {
          // Switching to mobile: close sidebar and lock mobile state
          setSidebarOpen(false);
          setSidebarUserOpened(false);
          setMobileStateLocked(true); // Lock mobile state

          // Show mobile notification if not already shown
          // Check for iframe to avoid showing notification when embedded
          let isInIframe = false;
          try {
            isInIframe = window.self !== window.top;
          } catch (e) {
            isInIframe = true;
          }

          if (!localStorage.getItem('mobileNotificationDismissed') && !isInIframe) {
            setShowMobileNotification(true);
          }
        } else {
          // Switching to desktop: open sidebar
          setSidebarOpen(true);
          setSidebarUserOpened(false);
          setMobileStateLocked(false); // Unlock for desktop
        }
      } else if (isMobileDevice && !mobileStateLocked) {
        // Already on mobile but not locked: ensure sidebar stays closed unless user opened it
        if (!sidebarUserOpened) {
          setSidebarOpen(false);
        }
        setMobileStateLocked(true); // Lock mobile state
      }
    };

    // Run immediately
    checkMobile();

    // Run on resize with debounce to prevent rapid changes
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isMobile, sidebarUserOpened, mobileStateLocked]);

  // Bulletproof check: if mobile and sidebar is open but user didn't open it, close it
  if (isMobile && sidebarOpen && !sidebarUserOpened) {
    setSidebarOpen(false);
  }

  // Additional safety: Force mobile state if locked
  useEffect(() => {
    if (mobileStateLocked && !isMobile) {
      setIsMobile(true);
    }
  }, [mobileStateLocked, isMobile]);

  const handleSaveEditTask = async () => {
    try {
      setLoading(true);

      // Clean up date fields - convert empty strings to null for database
      const cleanedTask = { ...editingTask };
      if (cleanedTask.start_date === '') cleanedTask.start_date = null;
      if (cleanedTask.end_date === '') cleanedTask.end_date = null;
      if (cleanedTask.recurring_end_date === '') cleanedTask.recurring_end_date = null;

      // Process reminders
      const reminders: Array<{ type: string, custom_time?: any, name?: string }> = [];
      if (cleanedTask.reminder_times && cleanedTask.reminder_times.length > 0) {
        cleanedTask.reminder_times.forEach((time: string) => {
          reminders.push({ type: time, name: cleanedTask.reminder_names?.[time] || '' });
        });
      }
      // Process custom reminders (both single and multiple)
      if (cleanedTask.reminder_custom_time) {
        reminders.push({
          type: 'custom',
          custom_time: cleanedTask.reminder_custom_time,
          name: cleanedTask.reminder_custom_name || ''
        });
      }
      if (cleanedTask.custom_reminders && cleanedTask.custom_reminders.length > 0) {
        cleanedTask.custom_reminders.forEach((customReminder: any) => {
          if (customReminder.time && customReminder.time.trim() !== '') {
            reminders.push({
              type: 'custom',
              custom_time: customReminder.time,
              name: customReminder.name || ''
            });
          }
        });
      }

      const updatedTask = {
        ...cleanedTask,
        color: getCategoryConfig(editingTask.category).color,
        reminders: reminders
      };

      // Remove fields that are only used for UI state, not database
      delete updatedTask.has_reminders;
      delete updatedTask.reminder_times; // UI state only
      delete updatedTask.reminder_custom_time; // UI state only
      delete updatedTask.reminder_names; // UI state only
      delete updatedTask.reminder_custom_name; // UI state only
      delete updatedTask.custom_reminders; // UI state only

      const isRecurring = editingTask.is_recurring || editingTask.is_recurring_instance;

      if (isRecurring && editMode === 'single') {
        // For single instance editing of recurring tasks, create a modified instance record
        const parentTaskId = editingTask.parent_task_id || editingTask.id;
        const instanceKey = editingTask.instance_key || `${parentTaskId}_${editingTask.year}_${editingTask.month}_${editingTask.date}`;


        // Create a "modified" task record to override this specific instance
        const modifiedInstance = {
          ...updatedTask,
          // Remove id field entirely - let database auto-generate
          parent_task_id: parentTaskId,
          instance_key: instanceKey,
          is_recurring: false,
          is_recurring_instance: true,
          is_modified_instance: true // Flag to identify this as a modified instance
        };

        // Clean up date fields for modified instance as well
        if (modifiedInstance.start_date === '') modifiedInstance.start_date = null;
        if (modifiedInstance.end_date === '') modifiedInstance.end_date = null;
        if (modifiedInstance.recurring_end_date === '') modifiedInstance.recurring_end_date = null;

        // Remove id from the object to avoid null constraint violation
        delete modifiedInstance.id;

        // First, check if there's already a modified instance for this date
        const { data: existingModified } = await supabase
          .from('tasks')
          .select('id')
          .eq('parent_task_id', modifiedInstance.parent_task_id)
          .eq('instance_key', instanceKey)
          .eq('is_modified_instance', true)
          .single();

        if (existingModified) {
          // Update existing modified instance
          const { error } = await supabase
            .from('tasks')
            .update(modifiedInstance)
            .eq('id', existingModified.id);

          if (error) {
            console.error('Error updating modified instance:', error);
            showNotification('error', `Error updating task: ${error.message}`);
            return;
          }
        } else {
          // Create new modified instance
          const { error } = await supabase
            .from('tasks')
            .insert([modifiedInstance]);

          if (error) {
            console.error('Error creating modified instance:', error);
            showNotification('error', `Error updating task: ${error.message}`);
            return;
          }
        }
      } else {
        // For regular tasks or editing all recurring instances
        const taskIdToUpdate = editingTask.is_recurring_instance ? editingTask.parent_task_id : editingTask.id;

        const { data, error } = await supabase.from('tasks').update(updatedTask).eq('id', taskIdToUpdate);

        if (error) {
          console.error('Error updating task:', error);
          showNotification('error', `Error updating task: ${error.message}`);
          return;
        }
      }


      // Add activity for task update
      addActivity({
        type: 'task_updated',
        task: updatedTask,
        message: `Updated task: ${updatedTask.title}`,
        user: teamMembers.find(m => m.id === updatedTask.created_by)?.name || 'Unknown',
        userId: updatedTask.created_by
      });

      setShowEditModal(false);
      setEditingTask(null);
      await refreshTasks();
      // Refresh activities to show the new activity
      loadActivities();
    } catch (err) {
      console.error('Unexpected error:', err);
      showNotification('error', `Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (deleteAll = false) => {
    const isRecurring = selectedTask.is_recurring || selectedTask.is_recurring_instance;

    if (isRecurring) {
      const message = deleteAll
        ? 'Are you sure you want to delete ALL occurrences of this recurring task?'
        : 'Are you sure you want to delete this single occurrence?';

      if (window.confirm(message)) {
        try {
          setLoading(true);

          let data;
          if (deleteAll) {
            // Delete the original recurring task (deletes all instances)
            const taskIdToDelete = selectedTask.is_recurring_instance ? selectedTask.parent_task_id : selectedTask.id;
            const result = await supabase.from('tasks').delete().eq('id', taskIdToDelete);
            data = result.data;

            if (result.error) {
              console.error('Error deleting recurring task:', result.error);
              showNotification('error', `Error deleting recurring task: ${result.error.message}`);
              return;
            }
          } else {
            // For single instance deletion, we need to create a "deleted instance" record
            // Since we can't easily delete individual instances from recurring patterns,
            // we'll create a special task record to mark this instance as deleted
            const instanceKey = selectedTask.instance_key || `${selectedTask.parent_task_id || selectedTask.id}_${selectedTask.year}_${selectedTask.month}_${selectedTask.date}`;

            // Create a "deleted" task record to mark this instance as deleted
            const deletedInstance = {
              title: `[DELETED] ${selectedTask.title}`,
              description: selectedTask.description,
              type: selectedTask.type,
              category: selectedTask.category,
              date: selectedTask.date,
              month: selectedTask.month,
              year: selectedTask.year,
              time: selectedTask.time,
              assignee: selectedTask.assignee,
              status: 'deleted', // Special status to mark as deleted
              color: selectedTask.color,
              priority: selectedTask.priority,
              is_recurring: false,
              parent_task_id: selectedTask.parent_task_id || selectedTask.id,
              instance_key: instanceKey,
              is_recurring_instance: true,
              is_deleted_instance: true // Flag to identify this as a deleted instance
            };

            const result = await supabase.from('tasks').insert([deletedInstance]);
            data = result.data;

            if (result.error) {
              console.error('Error marking instance as deleted:', result.error);
              showNotification('error', `Error deleting task instance: ${result.error.message}`);
              return;
            }

            // Update local deletedInstances state
            setDeletedInstances(prev => new Set([...prev, instanceKey]));
          }

          setShowTaskModal(false);
          setSelectedTask(null);
          await refreshTasks();
        } catch (err) {
          console.error('Unexpected error:', err);
          showNotification('error', `Unexpected error: ${err}`);
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Regular task deletion
      if (window.confirm('Are you sure you want to delete this task?')) {
        try {
          setLoading(true);
          const result = await supabase.from('tasks').delete().eq('id', selectedTask.id);

          if (result.error) {
            console.error('Error deleting task:', result.error);
            showNotification('error', `Error deleting task: ${result.error.message}`);
            return;
          }

          setShowTaskModal(false);
          setSelectedTask(null);
          await refreshTasks();
        } catch (err) {
          console.error('Unexpected error:', err);
          showNotification('error', `Unexpected error: ${err}`);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Drag and drop handlers for Kanban
  const handleDragStart = (e: React.DragEvent, task: any) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      await supabase.from('tasks').update({ status: newStatus }).eq('id', draggedTask.id);

      // Add activity for status change
      addActivity({
        type: 'status_changed',
        task: draggedTask,
        message: `Changed status from ${draggedTask.status} to ${newStatus}`,
        user: teamMembers.find(m => m.id === draggedTask.created_by)?.name || 'Unknown',
        userId: draggedTask.created_by,
        oldStatus: draggedTask.status,
        newStatus: newStatus
      });

      await refreshTasks();
      // Refresh activities to show the new activity
      loadActivities();
    }
    setDraggedTask(null);
  };

  const handlePriorityDrop = async (e: React.DragEvent, newPriority: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.priority !== newPriority) {
      await supabase.from('tasks').update({ priority: newPriority }).eq('id', draggedTask.id);

      // Add activity for priority change
      addActivity({
        type: 'priority_changed',
        task: draggedTask,
        message: `Changed priority from ${draggedTask.priority || 'medium'} to ${newPriority}`,
        user: teamMembers.find(m => m.id === draggedTask.created_by)?.name || 'Unknown',
        userId: draggedTask.created_by,
        oldPriority: draggedTask.priority || 'medium',
        newPriority: newPriority
      });

      await refreshTasks();
      loadActivities();
    }
    setDraggedTask(null);
  };

  // Calendar drag & drop handlers
  const handleCalendarDragStart = (e: React.DragEvent, task: any) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCalendarDragOver = (e: React.DragEvent, date: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleCalendarDragLeave = () => {
    setDragOverDate(null);
  };

  const handleCalendarDrop = async (e: React.DragEvent, newDate: number) => {
    e.preventDefault();
    if (draggedTask && draggedTask.date !== newDate) {
      const newMonth = currentDate.getMonth();
      const newYear = currentDate.getFullYear();

      // Check if the new date is valid for the current month
      const daysInMonth = new Date(newYear, newMonth + 1, 0).getDate();
      if (newDate <= daysInMonth) {
        await supabase
          .from('tasks')
          .update({
            date: newDate,
            month: newMonth,
            year: newYear
          })
          .eq('id', draggedTask.id);
        await refreshTasks();
      }
    }
    setDraggedTask(null);
    setDragOverDate(null);
  };

  const getTeamMemberName = (id: number) => {
    return teamMembers.find(member => member.id === id)?.name || 'Unknown';
  };

  const getAssigneesDisplay = (task: any) => {
    if (task.assignees && task.assignees.length > 0) {
      if (task.assignees.length === teamMembers.length) {
        return 'All Team Members';
      } else if (task.assignees.length === 1) {
        return getTeamMemberName(task.assignees[0]);
      } else {
        return `${task.assignees.length} assignees`;
      }
    } else if (task.assignee) {
      return getTeamMemberName(task.assignee);
    }
    return 'Unassigned';
  };

  const getAssigneesAvatars = (task: any) => {
    const assigneeIds = task.assignees && task.assignees.length > 0 ? task.assignees : (task.assignee ? [task.assignee] : []);

    if (assigneeIds.length === teamMembers.length) {
      return teamMembers.slice(0, 3).map(member => member.avatar);
    } else {
      return assigneeIds.slice(0, 3).map((id: number) => teamMembers.find(m => m.id === id)?.avatar).filter(Boolean);
    }
  };

  const getUserNotificationCount = () => {
    if (!loggedInUserTeamMemberId) return 0;

    // Use actual current date for overdue calculation
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    const userTasks = allTasksWithRecurring.filter(task =>
      task.status !== 'deleted' &&
      task.status !== 'completed' &&
      ((task.assignees && task.assignees.includes(loggedInUserTeamMemberId)) ||
        task.assignee === loggedInUserTeamMemberId)
    );

    const overdueTasks = userTasks.filter(task => {
      const taskDate = new Date(task.year, task.month, task.date);
      const todayDate = new Date(currentYear, currentMonth, currentDay);
      return taskDate < todayDate;
    });

    const highPriorityTasks = userTasks.filter(task => {
      if (task.priority !== 'high') return false;

      const taskDate = new Date(task.year, task.month, task.date);
      const todayDate = new Date(currentYear, currentMonth, currentDay);
      const isOverdue = taskDate < todayDate;

      // Only show high priority tasks from viewed month
      const viewedYear = currentDate.getFullYear();
      const viewedMonth = currentDate.getMonth();
      const isViewedMonth = task.year === viewedYear && task.month === viewedMonth;

      return !isOverdue && isViewedMonth;
    });

    // Combine overdue and high priority tasks, removing duplicates
    const uniqueTasks = new Set([
      ...overdueTasks.map(task => task.id),
      ...highPriorityTasks.map(task => task.id)
    ]);


    return uniqueTasks.size;
  };

  const getPersonalOverdueTasks = useCallback(() => {
    if (!loggedInUserTeamMemberId) return [];

    // Use actual current date for overdue calculation
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    return allTasksWithRecurring.filter(task => {
      if (task.status === 'completed' || task.status === 'deleted') return false;

      // Check if task is assigned to current user
      const isAssignedToUser = (task.assignees && task.assignees.includes(loggedInUserTeamMemberId)) ||
        task.assignee === loggedInUserTeamMemberId;
      if (!isAssignedToUser) return false;

      const taskDate = new Date(task.year, task.month, task.date);
      const todayDate = new Date(currentYear, currentMonth, currentDay);

      return taskDate < todayDate;
    }).sort((a, b) => {
      const dateA = new Date(a.year, a.month, a.date);
      const dateB = new Date(b.year, b.month, b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [allTasksWithRecurring, loggedInUserTeamMemberId]);

  const getPersonalHighPriorityTasks = useCallback(() => {
    if (!loggedInUserTeamMemberId) return [];

    // Use actual current date for overdue calculation, but show tasks from viewed month
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    const todayDate = new Date(currentYear, currentMonth, currentDay);
    const viewedYear = currentDate.getFullYear();
    const viewedMonth = currentDate.getMonth();

    return allTasksWithRecurring.filter(task => {
      if (task.priority !== 'high' || task.status === 'completed' || task.status === 'deleted') return false;

      // Check if task is assigned to current user
      const isAssignedToUser = (task.assignees && task.assignees.includes(loggedInUserTeamMemberId)) ||
        task.assignee === loggedInUserTeamMemberId;
      if (!isAssignedToUser) return false;

      const taskDate = new Date(task.year, task.month, task.date);
      const isOverdue = taskDate < todayDate;

      // Only show high priority tasks from viewed month
      const isViewedMonth = task.year === viewedYear && task.month === viewedMonth;


      return !isOverdue && isViewedMonth;
    }).sort((a, b) => {
      const dateA = new Date(a.year, a.month, a.date);
      const dateB = new Date(b.year, b.month, b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [allTasksWithRecurring, loggedInUserTeamMemberId]);

  const getGeneralNotificationCount = () => {
    const overdueTasks = getOverdueTasks();
    const highPriorityTasks = getHighPriorityTasks();

    // Combine overdue and high priority tasks, removing duplicates
    const uniqueTasks = new Set([
      ...overdueTasks.map(task => task.id),
      ...highPriorityTasks.map(task => task.id)
    ]);

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());


    return uniqueTasks.size;
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date().getDate();
  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <img
              src={`${(import.meta as any).env?.BASE_URL || '/'}atlas-logo.png`}
              alt="Atlas Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">MMC Calendar</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication screen
  if (!user && !showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <img
                src={`${(import.meta as any).env?.BASE_URL || '/'}atlas-logo.png`}
                alt="Atlas Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">MMC Calendar</h1>
            <p className="text-gray-600">Access the calendar</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowLogin(true)}
              className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Sign In</h3>
                  <p className="text-sm text-gray-600">Access your account</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setUser('guest')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Guest Access</h3>
                  <p className="text-sm text-gray-600">View-only access to the calendar</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password Screen
  if (showForgotPassword && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <img
                src={`${(import.meta as any).env?.BASE_URL || '/'}atlas-logo.png`}
                alt="Atlas Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">Enter your email to receive password reset instructions</p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter your email address"
              />
            </div>

            {resetMessage && (
              <div className={`text-sm text-center ${resetMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
                }`}>
                {resetMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Send Reset Instructions
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Login form
  if (showLogin && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <img
                src={`${(import.meta as any).env?.BASE_URL || '/'}atlas-logo.png`}
                alt="Atlas Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
            <p className="text-gray-600">
              {isSignUp ? 'We are not accepting new users at this time' : 'Access your MMC Calendar account'}
            </p>
          </div>

          <form onSubmit={isSignUp ? (e) => { e.preventDefault(); } : handleSignIn} className="space-y-4">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isSignUp}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSignUp ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isSignUp}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSignUp ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      required
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSignUp}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSignUp ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSignUp}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSignUp ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                required
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            )}

            {authError && (
              <div className="text-red-600 text-sm text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSignUp}
              className={`w-full py-2 px-4 rounded-md transition-colors ${isSignUp
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              {isSignUp ? 'Sign Up (Disabled)' : 'Sign In'}
            </button>

            {!isSignUp && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Back to options
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }


  // Kanban columns
  const kanbanColumns = [
    { id: 'planned', title: 'Planned', color: 'bg-green-50', borderColor: 'darkgreen' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-50', borderColor: 'rosybrown' },
    { id: 'review', title: 'Review', color: 'bg-orange-50', borderColor: 'darkorange' },
    { id: 'completed', title: 'Completed', color: 'bg-blue-50', borderColor: 'darkblue' }
  ];

  const getTasksByStatus = (status: string) => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const tasks = getAllFilteredTasks().filter(task =>
      task.status === status &&
      task.month === currentMonth &&
      task.year === currentYear
    );

    return tasks;
  };

  const priorityColumns = [
    { id: 'low', title: 'Low Priority', color: 'bg-green-50', borderColor: 'darkgreen', icon: '🟢' },
    { id: 'medium', title: 'Medium Priority', color: 'bg-yellow-50', borderColor: 'rosybrown', icon: '🟡' },
    { id: 'high', title: 'High Priority', color: 'bg-red-50', borderColor: 'darkred', icon: '🔴' }
  ];

  const getTasksByPriority = (priority: string) => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const tasks = getAllFilteredTasks().filter(task =>
      (task.priority === priority || (priority === 'medium' && !task.priority)) && // Default to medium if undefined
      task.status !== 'completed' &&
      task.status !== 'deleted' &&
      task.month === currentMonth &&
      task.year === currentYear
    );

    return tasks;
  };

  const handleMonthlyPriorityClick = (priority: string) => {
    // Switch to Priority view
    setActiveView('Priority');

    // Start the highlight animation sequence
    setHighlightedColumn(priority);
    setHighlightPhase('appearing');

    // Phase 1: Appearing (0.5s)
    setTimeout(() => {
      setHighlightPhase('glowing');
    }, 500);

    // Phase 2: Glowing (2s)
    setTimeout(() => {
      setHighlightPhase('disappearing');
    }, 2500);

    // Phase 3: Disappearing (1s)
    setTimeout(() => {
      setHighlightedColumn(null);
      setHighlightPhase(null);
    }, 3500);
  };

  const handleMonthlyOverviewClick = (status: string) => {
    // Switch to Kanban view
    setActiveView('Kanban');

    // Start the highlight animation sequence
    setHighlightedColumn(status);
    setHighlightPhase('appearing');

    // Phase 1: Appearing (0.5s)
    setTimeout(() => {
      setHighlightPhase('glowing');
    }, 500);

    // Phase 2: Glowing (2s)
    setTimeout(() => {
      setHighlightPhase('disappearing');
    }, 2500);

    // Phase 3: Disappearing (1s)
    setTimeout(() => {
      setHighlightedColumn(null);
      setHighlightPhase(null);
    }, 3500);
  };

  const scrollToToday = () => {
    const scrollToElement = () => {
      const todayElement = document.getElementById('today-calendar-day');
      if (todayElement) {
        todayElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
        return true;
      }
      return false;
    };

    // Try immediately first
    if (!scrollToElement()) {
      // If not found, try again after a longer delay to allow calendar to re-render
      setTimeout(() => {
        if (!scrollToElement()) {
          // Final attempt after even longer delay
          setTimeout(scrollToElement, 500);
        }
      }, 300);
    }
  };

  // Dedicated function to scroll day view to top
  const scrollDayViewToTop = () => {
    const scrollToTop = () => {
      // Try multiple selectors to find the scrollable container
      const selectors = [
        '.day-view-container',
        '[class*="overflow-y-auto"]',
        '.flex-1.overflow-y-auto'
      ];

      for (const selector of selectors) {
        const container = document.querySelector(selector) as HTMLElement;
        if (container && container.scrollTop !== undefined) {
          container.scrollTop = 0;
          return true;
        }
      }

      // Fallback: scroll window to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    };

    // Immediate attempt
    scrollToTop();

    // Multiple retry attempts with increasing delays
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 100);
    setTimeout(scrollToTop, 200);
    setTimeout(scrollToTop, 500);
  };

  // Month/Year Picker Component
  const MonthYearPicker = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    return (
      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-6 min-w-80 month-year-picker">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Month & Year</h3>
          <button
            onClick={() => setShowMonthYearPicker(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Year Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(new Date(currentYear - 1, currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-lg font-semibold text-gray-900 min-w-16 text-center">
              {currentYear}
            </span>
            <button
              onClick={() => setCurrentDate(new Date(currentYear + 1, currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-3 gap-2">
          {monthNames.map((month, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentDate(new Date(currentYear, index, 1));
                setShowMonthYearPicker(false);
              }}
              className={`p-2 text-sm rounded-md transition-colors ${index === currentMonth
                ? 'bg-blue-100 text-blue-800 font-semibold border border-blue-200'
                : 'hover:bg-gray-100 text-gray-700'
                }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Day Picker Component
  const DayPicker = () => {
    const today = new Date();
    const currentYear = dayPickerMonth.getFullYear();
    const currentMonth = dayPickerMonth.getMonth();
    const selectedDayValue = selectedDay.getDate();
    const selectedMonth = selectedDay.getMonth();
    const selectedYear = selectedDay.getFullYear();

    // Generate calendar days
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const calendarDays: Array<number | null> = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    return (
      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-80 day-picker">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
          <button
            onClick={() => setShowDayPicker(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Month/Year Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const prevMonth = new Date(currentYear, currentMonth - 1, 1);
              setDayPickerMonth(prevMonth);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h4 className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h4>
          <button
            onClick={() => {
              const nextMonth = new Date(currentYear, currentMonth + 1, 1);
              setDayPickerMonth(nextMonth);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="p-2"></div>;
            }

            const isToday = day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();
            const isSelected = day === selectedDayValue &&
              currentMonth === selectedMonth &&
              currentYear === selectedYear;

            return (
              <button
                key={index}
                onClick={() => {
                  const newSelectedDay = new Date(currentYear, currentMonth, day);
                  setSelectedDay(newSelectedDay);
                  setShowDayPicker(false);

                  // Update top bar month if selecting a day from different month
                  const currentTopMonth = currentDate.getMonth();
                  const currentTopYear = currentDate.getFullYear();

                  if (currentMonth !== currentTopMonth || currentYear !== currentTopYear) {
                    setCurrentDate(new Date(currentYear, currentMonth, 1));
                  }
                }}
                className={`p-2 text-sm rounded-md transition-colors ${isSelected
                  ? 'bg-blue-100 text-blue-800 font-semibold'
                  : isToday
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper function to get tasks for day view
  const getTasksForDayView = (date: Date, hour: number) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const filteredTasks = allTasksWithRecurring.filter(task => {
      // Only exclude deleted tasks, include completed tasks for now
      if (task.status === 'deleted') return false;

      // Exclude all-day tasks from hourly sections (they're shown in the all-day section)
      if (task.is_all_day) {
        return false;
      }

      // Exclude multi-day tasks from hourly sections (they're shown in the all-day section)
      if (task.is_multiday) {
        return false;
      }

      // For regular tasks, check if task is on this date
      const taskDate = new Date(task.year, task.month, task.date);
      const targetDate = new Date(year, month, day);

      if (taskDate.getFullYear() !== targetDate.getFullYear() ||
        taskDate.getMonth() !== targetDate.getMonth() ||
        taskDate.getDate() !== targetDate.getDate()) {
        return false;
      }

      // For regular tasks, check if task is scheduled for this hour
      const taskHour = parseInt(task.time.split(':')[0]);
      return taskHour === hour;
    });

    return filteredTasks;
  };

  // Helper function to get all-day and multi-day tasks for the day
  const getAllDayTasksForDay = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const targetDate = new Date(year, month, day);

    return allTasksWithRecurring.filter(task => {
      // Only exclude deleted tasks, include completed tasks for now
      if (task.status === 'deleted') return false;

      // All-day tasks
      if (task.is_all_day) {
        const taskDate = new Date(task.year, task.month, task.date);
        // More robust date comparison
        return taskDate.getFullYear() === targetDate.getFullYear() &&
          taskDate.getMonth() === targetDate.getMonth() &&
          taskDate.getDate() === targetDate.getDate();
      }

      // Multi-day tasks
      if (task.is_multiday && task.start_date && task.end_date) {
        try {
          // Parse dates safely to avoid timezone issues
          const startDate = new Date(task.start_date + 'T00:00:00');
          const endDate = new Date(task.end_date + 'T23:59:59');

          return targetDate >= startDate && targetDate <= endDate;
        } catch (error) {
          console.error('Error parsing multi-day task dates:', error, task);
          return false;
        }
      }

      return false;
    });
  };

  // Helper function to count tasks in early hours (0-7)
  const getEarlyHoursTaskCount = (date: Date) => {
    let count = 0;
    for (let hour = 0; hour < 8; hour++) {
      count += getTasksForDayView(date, hour).length;
    }
    return count;
  };

  // Helper function to count tasks in late hours (21-23)
  const getLateHoursTaskCount = (date: Date) => {
    let count = 0;
    for (let hour = 21; hour < 24; hour++) {
      count += getTasksForDayView(date, hour).length;
    }
    return count;
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: string, opacity: number = 1) => {
    switch (priority) {
      case 'high':
        return `rgba(239, 68, 68, ${opacity})`; // red-500
      case 'medium':
        return `rgba(245, 158, 11, ${opacity})`; // yellow-500
      case 'low':
        return `rgba(34, 197, 94, ${opacity})`; // green-500
      default:
        return `rgba(107, 114, 128, ${opacity})`; // gray-500
    }
  };

  // Helper function to format category name for display
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'blogPosts': 'Blog Posts',
      'campaigns': 'Campaigns',
      'emailMarketing': 'Email Marketing',
      'socialMedia': 'Social Media',
      'vacations': 'Vacations',
      'eventsWebinars': 'Events/webinars',
      'events/webinars': 'Events/webinars',
      'halloween': 'Halloween'
    };
    return categoryMap[category] || category;
  };

  const handleTodayClick = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    if (activeView === 'Day') {
      // In day view, just switch to today's date
      setSelectedDay(today);
      // Use the robust scroll function
      scrollDayViewToTop();
    } else {
      // In calendar or kanban view, use the same logic as logo click
      // Check if we're already viewing the current month
      const isAlreadyOnCurrentMonth = currentDate.getMonth() === currentMonth &&
        currentDate.getFullYear() === currentYear;

      // Only navigate if we're not already on the current month
      if (!isAlreadyOnCurrentMonth) {
        setCurrentDate(new Date(currentYear, currentMonth, today.getDate()));
      }

      setActiveView('Calendar');

      // Always show the highlight animation
      setHighlightedToday(true);
      setTodayHighlightPhase('appearing');

      // Scroll to today's day after a delay to ensure the calendar is rendered
      // Use longer delay when navigating from different month
      const scrollDelay = isAlreadyOnCurrentMonth ? 100 : 500;
      setTimeout(() => {
        scrollToToday();
      }, scrollDelay);

      // Phase 1: Appearing (0.5s)
      setTimeout(() => {
        setTodayHighlightPhase('glowing');
      }, 500);

      // Phase 2: Glowing (2s)
      setTimeout(() => {
        setTodayHighlightPhase('disappearing');
      }, 2500);

      // Phase 3: Disappearing (1s)
      setTimeout(() => {
        setHighlightedToday(false);
        setTodayHighlightPhase(null);
      }, 3500);
    }
  };

  // Drawer closing functions
  const closeDrawer = () => {
    setIsDrawerClosing(true);
    setTimeout(() => {
      setShowDrawer(false);
      setShowPersonalTasks(false);
      setIsDrawerClosing(false);
    }, 300); // Match animation duration
  };

  const closeActivitiesDrawer = () => {
    setIsActivitiesDrawerClosing(true);
    setTimeout(() => {
      setShowActivitiesDrawer(false);
      setIsActivitiesDrawerClosing(false);
    }, 300); // Match animation duration
  };

  const closeRemindersDrawer = () => {
    setIsRemindersDrawerClosing(true);
    setTimeout(() => {
      setShowRemindersDrawer(false);
      setIsRemindersDrawerClosing(false);
    }, 300); // Match animation duration
  };

  // Function to ensure drawer is visible on mobile when it opens
  const ensureDrawerVisibleOnMobile = () => {
    if (isMobile) {
      // On mobile, scroll to top and add a small delay to ensure drawer is visible
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });

        // Add a visual indicator that drawer opened
        const drawer = document.querySelector('[data-drawer="true"]');
        if (drawer) {
          drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150); // Slightly longer delay to ensure drawer is rendered
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      // Ensure we don't go beyond year 2099
      if (newDate.getFullYear() > 2099) {
        newDate.setFullYear(2099);
        newDate.setMonth(11); // December
      }
      // Ensure we don't go before year 2020
      if (newDate.getFullYear() < 2020) {
        newDate.setFullYear(2020);
        newDate.setMonth(0); // January
      }
      return newDate;
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Notification - Full Screen */}
      {showMobileNotification && (
        <div
          className="fixed top-0 left-0 w-screen h-screen z-[9999] bg-blue-600 text-white flex flex-col items-center justify-center p-6"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999
          }}
        >
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <svg className="w-16 h-16 text-blue-200 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-bold mb-4">Desktop Recommended</h2>
              <p className="text-lg text-blue-100 leading-relaxed mb-8">
                This application is optimized for desktop use. For the best experience, please access it from a computer or tablet.
              </p>
            </div>
            <button
              onClick={() => {
                setShowMobileNotification(false);
                localStorage.setItem('mobileNotificationDismissed', 'true');
              }}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      )}

      {/* Notification System */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`w-[500px] bg-white rounded-2xl shadow-2xl border-4 p-12 transform transition-all duration-300 ease-in-out relative ${notification.type === 'success' ? 'border-green-500' :
              notification.type === 'error' ? 'border-red-500' :
                notification.type === 'warning' ? 'border-yellow-500' :
                  'border-blue-500'
              }`}
          >
            {/* Close button in top-right corner */}
            <button
              className={`absolute top-2 right-2 inline-flex rounded-full p-1 bg-white border-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${notification.type === 'success' ? 'text-green-500 border-green-500 hover:text-green-700 hover:bg-green-50 focus:ring-green-500' :
                notification.type === 'error' ? 'text-red-500 border-red-500 hover:text-red-700 hover:bg-red-50 focus:ring-red-500' :
                  notification.type === 'warning' ? 'text-yellow-500 border-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 focus:ring-yellow-500' :
                    'text-blue-500 border-blue-500 hover:text-blue-700 hover:bg-blue-50 focus:ring-blue-500'
                }`}
              onClick={() => removeNotification(notification.id)}
            >
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Main content */}
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0 mr-4">
                {notification.type === 'success' && (
                  <svg className="h-12 w-12 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="h-12 w-12 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'warning' && (
                  <svg className="h-12 w-12 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="h-12 w-12 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 text-center">
                <p className={`text-xl font-bold ${notification.type === 'success' ? 'text-green-800' :
                  notification.type === 'error' ? 'text-red-800' :
                    notification.type === 'warning' ? 'text-yellow-800' :
                      'text-blue-800'
                  }`}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            setSidebarOpen(false);
            setSidebarUserOpened(false);
          }}
        />
      )}

      {/* Sidebar */}
      <div className={`${isMobile
        ? `fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`
        : 'w-64'
        } bg-white border-r border-gray-200 flex flex-col min-h-screen ${user === 'guest' ? 'hidden' : ''
        }`} style={{
          // Ensure mobile sidebar is properly positioned
          ...(isMobile && {
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100%',
            width: '320px',
            zIndex: 50,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 300ms ease-in-out'
          })
        }}>
        {/* Close button for mobile */}
        {isMobile && sidebarOpen && (
          <button
            onClick={() => {
              setSidebarOpen(false);
              setSidebarUserOpened(false);
            }}
            className="absolute top-4 right-4 z-[60] p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors bg-white"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-6">
            <div
              className="flex items-center space-x-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                const today = new Date();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth();

                // Check if we're already viewing the current month
                const isAlreadyOnCurrentMonth = currentDate.getMonth() === currentMonth &&
                  currentDate.getFullYear() === currentYear;

                // Only navigate if we're not already on the current month
                if (!isAlreadyOnCurrentMonth) {
                  setCurrentDate(new Date(currentYear, currentMonth, today.getDate()));
                }

                setActiveView('Calendar');

                // Always show the highlight animation
                setHighlightedToday(true);
                setTodayHighlightPhase('appearing');

                // Scroll to today's day after a delay to ensure the calendar is rendered
                // Use longer delay when navigating from different month
                const scrollDelay = isAlreadyOnCurrentMonth ? 100 : 500;
                setTimeout(() => {
                  scrollToToday();
                }, scrollDelay);

                // Phase 1: Appearing (0.5s)
                setTimeout(() => {
                  setTodayHighlightPhase('glowing');
                }, 500);

                // Phase 2: Glowing (2s)
                setTimeout(() => {
                  setTodayHighlightPhase('disappearing');
                }, 2500);

                // Phase 3: Disappearing (1s)
                setTimeout(() => {
                  setHighlightedToday(false);
                  setTodayHighlightPhase(null);
                }, 3500);
              }}
              title="Go to today"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src={`${(import.meta as any).env?.BASE_URL || '/'}atlas-logo.png`}
                  alt="Atlas Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">MMC Calendar</h1>
            </div>
          </div>
          {/* Priority Overview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Monthly Priority</h3>
            <div className="grid grid-cols-3 gap-2">
              <div
                className="bg-green-50 rounded-lg p-2 cursor-pointer hover:bg-green-100 transition-colors text-center border border-green-200 border-b-[3px] border-b-green-500"
                onClick={() => handleMonthlyPriorityClick('low')}
                title="Click to view in Priority"
              >
                <div className="text-xl font-bold text-green-600">{lowPriorityCount}</div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider">Low</div>
              </div>
              <div
                className="bg-yellow-50 rounded-lg p-2 cursor-pointer hover:bg-yellow-100 transition-colors text-center border border-yellow-200 border-b-[3px] border-b-yellow-500"
                onClick={() => handleMonthlyPriorityClick('medium')}
                title="Click to view in Priority"
              >
                <div className="text-xl font-bold text-yellow-600">{mediumPriorityCount}</div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider">Med</div>
              </div>
              <div
                className="bg-red-50 rounded-lg p-2 cursor-pointer hover:bg-red-100 transition-colors text-center border border-red-200 border-b-[3px] border-b-red-500"
                onClick={() => handleMonthlyPriorityClick('high')}
                title="Click to view in Priority"
              >
                <div className="text-xl font-bold text-red-600">{highPriorityCount}</div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider">High</div>
              </div>
            </div>
          </div>
          {/* Monthly Overview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Monthly Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="bg-green-50 rounded-lg p-3 cursor-pointer hover:bg-green-100 transition-colors text-center border border-green-200 border-r-[3px] border-r-green-500"
                onClick={() => handleMonthlyOverviewClick('planned')}
                title="Click to view in Kanban"
              >
                <div className="text-2xl font-bold text-green-600">{upcomingCount}</div>
                <div className="text-xs text-gray-600">Planned</div>
              </div>
              <div
                className="bg-yellow-50 rounded-lg p-3 cursor-pointer hover:bg-yellow-100 transition-colors text-center border border-yellow-200 border-r-[3px] border-r-yellow-500"
                onClick={() => handleMonthlyOverviewClick('in-progress')}
                title="Click to view in Kanban"
              >
                <div className="text-2xl font-bold text-yellow-600">{inProgressCount}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div
                className="bg-orange-50 rounded-lg p-3 cursor-pointer hover:bg-orange-100 transition-colors text-center border border-orange-200 border-r-[3px] border-r-orange-500"
                onClick={() => handleMonthlyOverviewClick('review')}
                title="Click to view in Kanban"
              >
                <div className="text-2xl font-bold text-orange-600">{reviewCount}</div>
                <div className="text-xs text-gray-600">Review</div>
              </div>
              <div
                className="bg-blue-50 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors text-center border border-blue-200 border-r-[3px] border-r-blue-500"
                onClick={() => handleMonthlyOverviewClick('completed')}
                title="Click to view in Kanban"
              >
                <div className="text-2xl font-bold text-blue-600">{completedCount}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
            </div>
          </div>
          {/* Team Filter */}
          {selectedTeamMember && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    {teamMembers.find(m => m.id === selectedTeamMember)?.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTeamMember(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {/* Filters */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Filters</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category.name} className={`flex items-center space-x-2 ${user !== 'guest' ? 'cursor-pointer' : 'cursor-default'
                  }`}>
                  <input
                    type="checkbox"
                    checked={selectedFilters[category.name] || false}
                    onChange={user !== 'guest' ? () => toggleFilter(category.name) : undefined}
                    disabled={user === 'guest'}
                    className="rounded border-gray-300"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <div
                      className={`w-3 h-3 rounded-full ${category.color_class.includes('bg-[')
                        ? ''
                        : category.color_class.includes('blue') ? 'bg-blue-500' :
                          category.color_class.includes('green') ? 'bg-green-500' :
                            category.color_class.includes('purple') ? 'bg-purple-500' :
                              category.color_class.includes('orange') ? 'bg-orange-500' :
                                category.color_class.includes('red') ? 'bg-red-500' :
                                  category.color_class.includes('yellow') ? 'bg-yellow-500' :
                                    category.color_class.includes('pink') ? 'bg-pink-500' :
                                      category.color_class.includes('indigo') ? 'bg-indigo-500' :
                                        category.color_class.includes('teal') ? 'bg-teal-500' :
                                          category.color_class.includes('cyan') ? 'bg-cyan-500' :
                                            category.color_class.includes('lime') ? 'bg-lime-500' :
                                              category.color_class.includes('white') ? 'bg-white border border-gray-300' :
                                                category.color_class.includes('amber') ? 'bg-amber-500' :
                                                  category.color_class.includes('fuchsia') ? 'bg-fuchsia-500' :
                                                    category.color_class.includes('stone') ? 'bg-stone-500' :
                                                      category.color_class.includes('sky') ? 'bg-sky-500' :
                                                        'bg-gray-500'
                        }`}
                      style={{
                        backgroundColor: category.color_class.includes('bg-[')
                          ? category.color_class.match(/bg-\[([^\]]+)\]/)?.[1] || '#6B7280'
                          : undefined
                      }}
                    ></div>
                    <span className="text-sm text-gray-700">{category.display_name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded min-w-[24px] text-center ${category.color_class.includes('white')
                    ? 'bg-white text-gray-800 border border-gray-300'
                    : category.color_class
                    }`}>
                    {filterCounts[category.name] || 0}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Team Members
              {user && user !== 'guest' && (
                <span className="text-xs text-gray-500 ml-2">(Click to filter tasks)</span>
              )}
            </h3>


            <div className="space-y-3">
              {/* Show All option */}
              <div
                className={`flex items-center space-x-3 p-2 rounded-lg ${user !== 'guest' ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                  } ${selectedTeamMember === null ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                onClick={user !== 'guest' ? () => handleTeamMemberClick(null) : undefined}
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                  All
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Show All Tasks</div>
                  <div className="text-xs text-gray-500">View tasks from all team members</div>
                </div>
              </div>

              {teamMembers.map(member => (
                <div
                  key={member.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg ${user !== 'guest' ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                    } ${selectedTeamMember === member.id ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  onClick={user !== 'guest' ? () => handleTeamMemberClick(member.id) : undefined}
                >
                  <div className={`w-8 h-8 ${member.color} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    <div className="text-xs text-gray-500 truncate">{member.role}</div>
                  </div>
                  {member.active && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Admin Section - Bottom of Sidebar */}
          {isAdmin && (
            <div className="mt-auto">
              {/* Separator */}
              <div className="border-t border-gray-200 my-4"></div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-blue-900">Admin Section</h3>
                  <button
                    onClick={() => setShowCategoryManagement(!showCategoryManagement)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {showCategoryManagement ? 'Hide' : 'Manage All'}
                  </button>
                </div>

                {showCategoryManagement && (
                  <div className="space-y-4">
                    {/* Category Management */}
                    <div>
                      <h4 className="text-xs font-medium text-blue-700 mb-2 uppercase tracking-wide">Category Management</h4>
                      <div className="space-y-2">
                        {categories.map(category => (
                          <div key={category.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-100">
                            <div className="flex items-center space-x-2 flex-1">
                              <div
                                className={`w-3 h-3 rounded-full ${category.color_class.includes('bg-[')
                                  ? ''
                                  : category.color_class.includes('blue') ? 'bg-blue-500' :
                                    category.color_class.includes('green') ? 'bg-green-500' :
                                      category.color_class.includes('purple') ? 'bg-purple-500' :
                                        category.color_class.includes('orange') ? 'bg-orange-500' :
                                          category.color_class.includes('red') ? 'bg-red-500' :
                                            category.color_class.includes('yellow') ? 'bg-yellow-500' :
                                              category.color_class.includes('pink') ? 'bg-pink-500' :
                                                category.color_class.includes('indigo') ? 'bg-indigo-500' :
                                                  category.color_class.includes('teal') ? 'bg-teal-500' :
                                                    category.color_class.includes('cyan') ? 'bg-cyan-500' :
                                                      category.color_class.includes('lime') ? 'bg-lime-500' :
                                                        category.color_class.includes('white') ? 'bg-white border border-gray-300' :
                                                          category.color_class.includes('amber') ? 'bg-amber-500' :
                                                            category.color_class.includes('fuchsia') ? 'bg-fuchsia-500' :
                                                              category.color_class.includes('stone') ? 'bg-stone-500' :
                                                                category.color_class.includes('sky') ? 'bg-sky-500' :
                                                                  'bg-gray-500'
                                  }`}
                                style={{
                                  backgroundColor: category.color_class.includes('bg-[')
                                    ? category.color_class.match(/bg-\[([^\]]+)\]/)?.[1] || '#6B7280'
                                    : undefined
                                }}
                              ></div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{category.display_name}</div>
                                <div className="text-xs text-gray-500">{category.type} • {filterCounts[category.name] || 0} tasks</div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Edit category"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {category.is_custom && (
                                <button
                                  onClick={() => {
                                    setCategoryToDelete(category);
                                    setShowDeleteCategoryModal(true);
                                  }}
                                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                  title="Delete category"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-blue-200">
                          <button
                            onClick={() => setShowCustomCategoryModal(true)}
                            className="w-full flex items-center justify-center space-x-2 p-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg border border-dashed border-blue-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add New Category</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* User Management */}
                    <div>
                      <h4 className="text-xs font-medium text-blue-700 mb-2 uppercase tracking-wide">User Management</h4>
                      <div className="space-y-2">
                        {teamMembers.map(member => (
                          <div key={member.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-100">
                            <div className="flex items-center space-x-2 flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${member.color}`}>
                                {member.avatar}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditUser(member)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Edit user"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-blue-200">
                          <button
                            onClick={() => {
                              // TODO: Add user creation functionality
                              showNotification('info', 'User creation functionality coming soon!');
                            }}
                            className="w-full flex items-center justify-center space-x-2 p-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg border border-dashed border-blue-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add New User</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-2 2xl:px-6 py-2 2xl:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              {isMobile && user !== 'guest' && (
                <button
                  onClick={() => {
                    if (isMobile) {
                      setSidebarOpen(!sidebarOpen);
                      setSidebarUserOpened(!sidebarOpen);
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg 2xl:hidden"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
                    className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </button>
                  {showMonthYearPicker && <MonthYearPicker />}
                </div>
              </div>
              <button
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200"
                onClick={handleTodayClick}
              >
                Today
              </button>
            </div>


            <div className="flex items-center space-x-2 2xl:space-x-4">
              {/* User Menu - Moved to first position */}
              {user && user !== 'guest' && (
                <div className="flex items-center space-x-4">
                  <div
                    className="relative group"
                    onMouseEnter={() => setShowUserMenu(true)}
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <button className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
                      <span className="text-sm 2xl:text-base text-gray-600 hidden sm:inline">
                        Hi, {user.user_metadata?.first_name || user.email?.split('@')[0]}
                      </span>
                      <span className="text-sm text-gray-600 sm:hidden">
                        {user.user_metadata?.first_name || user.email?.split('@')[0]}
                      </span>
                      {getUserNotificationCount() > 0 && (
                        <div
                          className="relative cursor-pointer hover:scale-105 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPersonalTasks(true);
                            setShowDrawer(true);
                            setShowUserMenu(false);
                            ensureDrawerVisibleOnMobile();
                          }}
                          title={`${getUserNotificationCount()} urgent/overdue task${getUserNotificationCount() !== 1 ? 's' : ''} - Click to view`}
                        >
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                            <span className="text-white text-xs font-bold">
                              {getUserNotificationCount() > 9 ? '9+' : getUserNotificationCount()}
                            </span>
                          </div>
                        </div>
                      )}
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User Menu Dropdown */}
                    <div
                      className={`absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-400 transition-all duration-200 z-50 ${showUserMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}
                      onMouseEnter={() => setShowUserMenu(true)}
                      onMouseLeave={() => setShowUserMenu(false)}
                    >
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowPersonalTasks(true);
                            setShowDrawer(true);
                            setShowUserMenu(false);
                            ensureDrawerVisibleOnMobile();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Urgent/Overdue Tasks ({getUserNotificationCount()})</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowRemindersDrawer(true);
                            setShowUserMenu(false);
                            ensureDrawerVisibleOnMobile();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <span>Upcoming Reminders ({upcomingReminders.length})</span>
                        </button>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={() => {
                            setShowPasswordChangeModal(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          <span>Change Password</span>
                        </button>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Reminders Button */}
              <div className="relative">
                <button
                  onClick={user !== 'guest' ? () => {
                    setShowRemindersDrawer(!showRemindersDrawer);
                    if (!showRemindersDrawer) ensureDrawerVisibleOnMobile();
                  } : undefined}
                  className={`relative p-2 rounded-lg transition-colors ${user !== 'guest'
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                    }`}
                  title={user !== 'guest' ? "Reminders" : "Guest users cannot access reminders"}
                  disabled={user === 'guest'}
                >
                  <div className="w-6 h-6 relative">
                    {/* Bell Icon */}
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  {dismissedReminders.length > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center px-1">
                      <span className="text-xs text-white font-bold">
                        {dismissedReminders.length}
                      </span>
                    </div>
                  )}
                </button>
              </div>

              {/* Separator */}
              <div className="text-gray-300 text-lg">|</div>

              {/* Drawer Toggle Button */}
              <button
                onClick={user !== 'guest' ? () => {
                  setShowPersonalTasks(false);
                  setShowDrawer(!showDrawer);
                  if (!showDrawer) ensureDrawerVisibleOnMobile();
                } : undefined}
                className={`relative p-2 rounded-lg transition-colors ${user !== 'guest'
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
                  }`}
                title={user !== 'guest' ? "Open task overview" : "Guest users cannot access task overview"}
                disabled={user === 'guest'}
              >
                <div className="w-6 h-6 relative">
                  {/* Dashboard/Grid Icon */}
                  <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </div>
                {getGeneralNotificationCount() > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full flex items-center justify-center px-1">
                    <span className="text-xs text-white font-bold">
                      {getGeneralNotificationCount()}
                    </span>
                  </div>
                )}
              </button>




              {/* Tasks Overview Button */}
              <div className="relative">
                <button
                  onClick={user !== 'guest' ? () => {
                    setShowActivitiesDrawer(!showActivitiesDrawer);
                    if (!showActivitiesDrawer) ensureDrawerVisibleOnMobile();
                  } : undefined}
                  className={`relative p-2 rounded-lg transition-colors ${user !== 'guest'
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                    }`}
                  title={user !== 'guest' ? "Recent Activities" : "Guest users cannot access activities"}
                  disabled={user === 'guest'}
                >
                  <div className="w-6 h-6 relative">
                    {/* Clock/Activity Icon */}
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>

                </button>
              </div>

              {/* Separator */}
              <div className="text-gray-300 text-lg">|</div>


              {/* Search Box - Hidden on mobile, shown on desktop */}
              <div className="relative search-container hidden 2xl:block">
                <button
                  onClick={user !== 'guest' ? handleSearchIconClick : undefined}
                  disabled={user === 'guest'}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:cursor-not-allowed"
                  title="Search tasks"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Search Dropdown */}
                {showSearchInput && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search tasks..."
                          value={searchQuery}
                          onChange={user !== 'guest' ? (e) => handleSearch(e.target.value) : undefined}
                          onFocus={user !== 'guest' ? () => searchQuery && setShowSearchResults(true) : undefined}
                          disabled={user === 'guest'}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Search Results */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="max-h-64 overflow-y-auto">
                        {searchResults.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleSearchResultClick(task)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{task.title}</div>
                            <div className="text-sm text-gray-600 truncate">{task.description}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded ${task.color}`}>
                                {getTaskCategoryDisplayName(task)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {task.is_multiday && task.start_date ? (
                                  `${monthNames[parseInt(task.start_date.split('-')[1]) - 1]} ${parseInt(task.start_date.split('-')[2])}, ${task.start_date.split('-')[0]}`
                                ) : (
                                  `${monthNames[task.month !== undefined && task.month !== null ? task.month : currentDate.getMonth()]} ${task.date}, ${task.year !== undefined && task.year !== null ? task.year : currentDate.getFullYear()}`
                                )}
                              </span>
                              <span className="text-xs text-gray-500">
                                {getAssigneesDisplay(task)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No Results Message */}
                    {showSearchResults && searchResults.length === 0 && searchQuery && (
                      <div className="p-3">
                        <div className="text-gray-500 text-sm">No tasks found matching "{searchQuery}"</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-2 2xl:px-3 py-1 text-xs 2xl:text-sm rounded-md ${activeView === 'Calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                  onClick={() => setActiveView('Calendar')}
                >
                  <span className="hidden sm:inline">Calendar</span>
                  <span className="sm:hidden">Cal</span>
                </button>
                <button
                  className={`px-2 2xl:px-3 py-1 text-xs 2xl:text-sm rounded-md ${activeView === 'Day'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                  onClick={() => setActiveView('Day')}
                >
                  <span className="hidden sm:inline">Day</span>
                  <span className="sm:hidden">Day</span>
                </button>
                <button
                  className={`px-2 2xl:px-3 py-1 text-xs 2xl:text-sm rounded-md ${activeView === 'Priority'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                  onClick={() => setActiveView('Priority')}
                >
                  <span className="hidden sm:inline">Priority</span>
                  <span className="sm:hidden">Prio</span>
                </button>
                <button
                  className={`px-2 2xl:px-3 py-1 text-xs 2xl:text-sm rounded-md ${activeView === 'Kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                  onClick={() => setActiveView('Kanban')}
                >
                  <span className="hidden sm:inline">Kanban</span>
                  <span className="sm:hidden">Kan</span>
                </button>
              </div>

              {user && user !== 'guest' && (
                <button
                  className="flex items-center space-x-1 2xl:space-x-2 bg-blue-600 text-white px-2 2xl:px-4 py-2 rounded-lg hover:bg-blue-700"
                  onClick={handleNewEntry}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Entry</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}

              <div className="flex items-center space-x-1 2xl:space-x-2">
                {user === 'guest' && (
                  <button
                    className="flex items-center space-x-1 2xl:space-x-2 bg-gray-100 text-gray-700 px-2 2xl:px-4 py-2 rounded-lg hover:bg-gray-200"
                    onClick={handleSignOut}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Exit</span>
                  </button>
                )}
              </div>



              {/* Export Dropdown */}
              <div className="relative export-container">
                {user !== 'guest' && (
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title="Export data"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          exportToCSV();
                          setShowExportMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export to CSV
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Main View */}
        <div className="flex-1 p-2 2xl:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
          ) : activeView === 'Calendar' ? (
            <div className="bg-white rounded-lg shadow-lg border border-gray-400 h-full">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {daysOfWeek.map(day => (
                  <div key={day} className="p-2 2xl:p-4 text-center text-xs 2xl:text-sm font-medium text-gray-500 border-r border-gray-200 last:border-r-0">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>
              {/* Calendar Body */}
              <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
                {days.map((day, index) => (
                  <div
                    key={index}
                    id={day === today && isCurrentMonth ? 'today-calendar-day' : undefined}
                    className={`border-r border-b border-gray-200 last:border-r-0 p-1 2xl:p-2 min-h-[80px] 2xl:min-h-[120px] relative cursor-pointer hover:bg-gray-50 transition-all duration-500 group ${dragOverDate === day ? 'bg-blue-50 border-blue-300' : ''
                      } ${day === today && isCurrentMonth ? 'bg-blue-50' : ''
                      } ${highlightedToday && day === today && isCurrentMonth
                        ? todayHighlightPhase === 'appearing'
                          ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-md'
                          : todayHighlightPhase === 'glowing'
                            ? 'ring-4 ring-blue-400 ring-opacity-75 shadow-xl'
                            : todayHighlightPhase === 'disappearing'
                              ? 'ring-2 ring-blue-400 ring-opacity-25 shadow-sm'
                              : ''
                        : ''
                      }`}
                    onClick={day && user !== 'guest' ? () => handleDayClick(day) : undefined}
                    onMouseEnter={day && user !== 'guest' ? () => handleDayHover(day) : undefined}
                    onMouseLeave={day && user !== 'guest' ? () => handleDayLeave() : undefined}
                    onDragOver={day && user !== 'guest' ? (e) => handleCalendarDragOver(e, day) : undefined}
                    onDragLeave={day && user !== 'guest' ? handleCalendarDragLeave : undefined}
                    onDrop={day && user !== 'guest' ? (e) => handleCalendarDrop(e, day) : undefined}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-2 ${day === today && isCurrentMonth ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                          {day}
                        </div>
                        {/* Multi-day tasks container with negative margin */}
                        {getTasksForDate(day).filter(task => task.is_multiday).length > 0 && (
                          <div className="space-y-1 mb-2" style={{ margin: '0px -7px' }}>
                            {getTasksForDate(day).filter(task => task.is_multiday).map((task, index) => {
                              let isStart = false;
                              let isEnd = false;
                              let isMiddle = false;

                              try {
                                if (task.start_date) {
                                  const startDate = new Date(task.start_date + 'T00:00:00');
                                  isStart = startDate.getDate() === day && startDate.getMonth() === currentDate.getMonth() && startDate.getFullYear() === currentDate.getFullYear();
                                }
                                if (task.end_date) {
                                  const endDate = new Date(task.end_date + 'T00:00:00');
                                  isEnd = endDate.getDate() === day && endDate.getMonth() === currentDate.getMonth() && endDate.getFullYear() === currentDate.getFullYear();
                                }
                                isMiddle = !isStart && !isEnd;
                              } catch (error) {
                                console.error('Error parsing multi-day task dates for rendering:', error, task);
                                isStart = false;
                                isEnd = false;
                                isMiddle = true;
                              }

                              return (
                                <div
                                  key={`multiday-${task.id}-${day}`}
                                  className={`h-6 ${task.color} cursor-pointer hover:opacity-80 relative flex items-center border-t-4 border-b-4 ${isStart ? 'border-l-4' : ''
                                    } ${isEnd ? 'border-r-4' : ''} ${task.status === 'completed' ? 'opacity-50' : ''
                                    } ${draggedTask?.id === task.id ? 'opacity-50' : ''} rounded-none`}
                                  style={{
                                    marginLeft: isStart ? '0' : '-1px',
                                    marginRight: isEnd ? '0' : '-1px',
                                    zIndex: 10
                                  }}
                                  onClick={user !== 'guest' ? (e) => {
                                    e.stopPropagation();
                                    handleTaskClick(task);
                                  } : undefined}
                                  title={`${task.title}${isStart ? ' (Start)' : isEnd ? ' (End)' : ''}`}
                                >
                                  <div className="flex items-center justify-between w-full p-1 2xl:p-2 min-w-0">
                                    <div className="flex items-center space-x-1 min-w-0 flex-1">
                                      <div className="text-xs font-medium truncate min-w-0 flex-1">
                                        {task.title}
                                      </div>
                                      <div className="flex -space-x-1 ml-1 flex-shrink-0">
                                        {getAssigneesAvatars(task).map((avatar: string, index: number) => {
                                          const assigneeIds = task.assignees && task.assignees.length > 0 ? task.assignees : (task.assignee ? [task.assignee] : []);
                                          const member = teamMembers.find(m => m.id === assigneeIds[index]);
                                          return (
                                            <div key={index} className={`w-4 h-4 ${member?.color || 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-[8px] font-medium border border-white`}>
                                              {avatar}
                                            </div>
                                          );
                                        })}
                                        {task.assignees && task.assignees.length > 3 && (
                                          <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-[8px] font-medium border border-white">
                                            +{task.assignees.length - 3}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1 flex-shrink-0 ml-1">
                                      {task.priority && task.priority !== 'medium' && (
                                        <span className="text-xs">
                                          {priorityConfig[task.priority]?.icon || '🟡'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Regular tasks container with normal spacing */}
                        <div className={`space-y-1 ${getTasksForDate(day).filter(task => task.is_multiday).length > 0 ? 'mt-3' : ''}`}>
                          {getTasksForDate(day).filter(task => !task.is_multiday).map((task, index) => {
                            // Check for time conflicts
                            const hasTimeConflict = !task.is_all_day && getTasksForDate(day).filter(t =>
                              !t.is_all_day && !t.is_multiday && t.time === task.time && t.id !== task.id
                            ).length > 0;

                            return (
                              <div
                                key={task.id}
                                className={`text-xs p-1 md:p-2 rounded border ${task.color} cursor-move hover:shadow-sm relative ${task.status === 'completed' ? 'opacity-75' : ''
                                  } ${draggedTask?.id === task.id ? 'opacity-50' : ''} ${task.is_all_day ? 'border-2 border-dashed border-gray-400 bg-opacity-50' : ''
                                  } ${hasTimeConflict ? 'border-l-4 border-l-red-400' : ''} ${task.status === 'planned' ? 'border-r-[3px] border-r-green-500' :
                                    task.status === 'in-progress' ? 'border-r-[3px] border-r-yellow-500' :
                                      task.status === 'review' ? 'border-r-[3px] border-r-orange-500' :
                                        task.status === 'completed' ? 'border-r-[3px] border-r-blue-500' : ''
                                  }`}
                                onClick={user !== 'guest' ? (e) => {
                                  e.stopPropagation();
                                  handleTaskClick(task);
                                } : undefined}
                                draggable={user !== 'guest'}
                                onDragStart={user !== 'guest' ? (e) => handleCalendarDragStart(e, task) : undefined}
                              >
                                {task.status === 'completed' && (
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-full h-0.5 bg-gray-600 transform rotate-12"></div>
                                  </div>
                                )}
                                <div className="flex items-center justify-between min-w-0">
                                  <div className={`font-medium truncate min-w-0 flex-1 ${task.status === 'completed' ? 'text-gray-500' : ''
                                    }`}>{task.title}</div>
                                  <div className="flex items-center space-x-1 flex-shrink-0 ml-1">
                                    {task.is_recurring && (
                                      <Repeat className="w-3 h-3 text-blue-500" />
                                    )}
                                    {task.priority && task.priority !== 'medium' && (
                                      <span className="text-xs">
                                        {priorityConfig[task.priority]?.icon || '🟡'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className={`${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                                  }`}>{getTaskCategoryDisplayName(task)}</div>
                                <div className={`${task.status === 'completed' ? 'text-gray-400' : 'text-gray-500'
                                  }`}>{getAssigneesDisplay(task)}</div>
                                {task.is_all_day ? (
                                  <div className={`${task.status === 'completed' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>All Day</div>
                                ) : task.time && (
                                  <div className={`${task.status === 'completed' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>{task.time}</div>
                                )}
                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-1">
                                    {task.tags.slice(0, 2).map((tag: string, index: number) => (
                                      <span
                                        key={index}
                                        className="text-[9px] sm:text-[10px] bg-gray-50 text-gray-600 px-1 py-0.5 rounded truncate max-w-[60px] sm:max-w-none"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {task.tags.length > 2 && (
                                      <span className="text-[9px] sm:text-[10px] text-gray-500">+{task.tags.length - 2}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {/* Hover Popup with Day View and Create Task Options */}
                        {hoveredDay && hoveredDay.date === day && hoveredDay.month === currentDate.getMonth() && hoveredDay.year === currentDate.getFullYear() && user !== 'guest' && (
                          <div className="absolute inset-0 bg-white bg-opacity-95 border-2 border-blue-300 rounded-lg shadow-lg z-20 flex flex-col">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDayViewClick(day);
                              }}
                              className="flex-1 flex flex-col items-center justify-center p-2 hover:bg-blue-50 transition-colors rounded-t-lg border-b border-gray-200"
                              title="View day details"
                            >
                              <Eye className="w-6 h-6 text-blue-600 mb-1" />
                              <span className="text-xs font-medium text-gray-700">View Day</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNewTaskFromDay(day, e);
                              }}
                              className="flex-1 flex flex-col items-center justify-center p-2 hover:bg-green-50 transition-colors rounded-b-lg"
                              title="Create new task"
                            >
                              <FilePlus className="w-6 h-6 text-green-600 mb-1" />
                              <span className="text-xs font-medium text-gray-700">New Task</span>
                            </button>
                          </div>
                        )}


                        {/* Today indicator */}
                        {day === today && isCurrentMonth && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : activeView === 'Day' ? (
            /* Day View */
            <div className="bg-white rounded-lg shadow-lg border border-gray-400 h-full flex flex-col day-view-container">
              {/* Day View Header */}
              <div className="flex items-center p-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const prevDay = new Date(selectedDay);
                        prevDay.setDate(prevDay.getDate() - 1);
                        setSelectedDay(prevDay);

                        // Update top bar month if navigating to different month
                        const prevMonth = prevDay.getMonth();
                        const prevYear = prevDay.getFullYear();
                        const currentMonth = currentDate.getMonth();
                        const currentYear = currentDate.getFullYear();

                        if (prevMonth !== currentMonth || prevYear !== currentYear) {
                          setCurrentDate(new Date(prevYear, prevMonth, 1));
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        const nextDay = new Date(selectedDay);
                        nextDay.setDate(nextDay.getDate() + 1);
                        setSelectedDay(nextDay);

                        // Update top bar month if navigating to different month
                        const nextMonth = nextDay.getMonth();
                        const nextYear = nextDay.getFullYear();
                        const currentMonth = currentDate.getMonth();
                        const currentYear = currentDate.getFullYear();

                        if (nextMonth !== currentMonth || nextYear !== currentYear) {
                          setCurrentDate(new Date(nextYear, nextMonth, 1));
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="relative flex items-center space-x-3">
                    <button
                      onClick={() => setShowDayPicker(!showDayPicker)}
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {selectedDay.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </button>
                    <button
                      onClick={handleTodayClick}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200"
                    >
                      Today
                    </button>
                    {showDayPicker && <DayPicker />}
                  </div>
                </div>
              </div>

              {/* All-Day Tasks Section */}
              {getAllDayTasksForDay(selectedDay).length > 0 && (
                <div className="border-b border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">All-Day Tasks</h3>
                  <div className="space-y-2">
                    {getAllDayTasksForDay(selectedDay).map((task, index) => (
                      <div
                        key={`allday-${task.id}-${index}`}
                        className="p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-sm transition-shadow bg-gray-50"
                        style={{
                          borderLeftColor: getPriorityColor(task.priority),
                          backgroundColor: getPriorityColor(task.priority, 0.05)
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {task.title}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                All Day
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {task.description}
                              </p>
                            )}
                            {task.comments && (
                              <p className="text-xs text-gray-500 italic line-clamp-2 mb-2">
                                {task.comments}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 text-xs">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${task.category === 'blogPosts' || task.category === 'Blog Posts' ? 'bg-blue-100 text-blue-800' :
                                task.category === 'campaigns' || task.category === 'Campaigns' ? 'bg-purple-100 text-purple-800' :
                                  task.category === 'emailMarketing' || task.category === 'Email Marketing' ? 'bg-orange-100 text-orange-800' :
                                    task.category === 'socialMedia' || task.category === 'Social Media' ? 'bg-green-100 text-green-800' :
                                      task.category === 'vacations' || task.category === 'Vacations' ? 'bg-gray-100 text-gray-800' :
                                        task.category === 'eventsWebinars' || task.category === 'Events/webinars' ? 'bg-lime-100 text-lime-800' :
                                          task.category === 'halloween' || task.category === 'Halloween' ? 'bg-orange-100 text-orange-800' :
                                            'bg-gray-100 text-gray-800'
                                }`}>
                                {getCategoryDisplayName(task.category) || task.type}
                              </span>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day Timeline */}
              <div className="flex-1 overflow-y-auto">
                <div className="relative">
                  {/* Early Hours (0-7) - Collapsible */}
                  <div className="border-b border-gray-200">
                    <button
                      onClick={() => setShowEarlyHours(!showEarlyHours)}
                      className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Early Hours (12:00 AM - 7:00 AM)</span>
                        {getEarlyHoursTaskCount(selectedDay) > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getEarlyHoursTaskCount(selectedDay)} task{getEarlyHoursTaskCount(selectedDay) !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <svg
                        className={`w-4 h-4 transform transition-transform ${showEarlyHours ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showEarlyHours ? 'max-h-screen' : 'max-h-0'}`}>
                      <div className="bg-gray-50 border-b border-gray-200">
                        {Array.from({ length: 8 }, (_, i) => {
                          const hour = i;
                          const timeString = `${hour.toString().padStart(2, '0')}:00`;
                          const isCurrentHour = selectedDay.toDateString() === new Date().toDateString() &&
                            new Date().getHours() === hour;
                          const tasksForHour = getTasksForDayView(selectedDay, hour);
                          const hasTasks = tasksForHour.length > 0;

                          return (
                            <div key={hour} className="relative">
                              <div className="sticky top-0 bg-gray-50 z-10 flex items-center h-12 border-b border-gray-200">
                                <div className="w-16 text-right pr-3 text-sm text-gray-500 font-medium">
                                  {timeString}
                                </div>
                                <div className="flex-1 h-px bg-gray-200"></div>
                              </div>
                              <div
                                className={`relative bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${hasTasks ? 'min-h-20 py-2' : 'min-h-12'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleHourSlotClick(hour);
                                }}
                                title={user !== 'guest' ? `Click to add task at ${timeString}` : 'Guest users cannot add tasks'}
                              >
                                {isCurrentHour && (
                                  <div className="absolute left-16 right-0 h-0.5 bg-red-500 z-20">
                                    <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                  </div>
                                )}
                                <div className="ml-16 pr-4 min-h-12">
                                  {tasksForHour.map((task, index) => (
                                    <div
                                      key={`${task.id}-${index}`}
                                      className="mb-3 p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all duration-200"
                                      style={{
                                        borderLeftColor: getPriorityColor(task.priority),
                                        backgroundColor: getPriorityColor(task.priority, 0.05)
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedTask(task);
                                        setShowTaskModal(true);
                                      }}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center space-x-3 mb-2">
                                            <span className="text-base font-semibold text-gray-900 truncate">
                                              {task.title}
                                            </span>
                                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                              {task.time}
                                            </span>
                                          </div>
                                          {task.description && (
                                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                              {task.description}
                                            </p>
                                          )}
                                          <div className="flex items-center space-x-2 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.category === 'blogPosts' || task.category === 'Blog Posts' ? 'bg-blue-100 text-blue-800' :
                                              task.category === 'campaigns' || task.category === 'Campaigns' ? 'bg-purple-100 text-purple-800' :
                                                task.category === 'emailMarketing' || task.category === 'Email Marketing' ? 'bg-orange-100 text-orange-800' :
                                                  task.category === 'socialMedia' || task.category === 'Social Media' ? 'bg-green-100 text-green-800' :
                                                    task.category === 'vacations' || task.category === 'Vacations' ? 'bg-gray-100 text-gray-800' :
                                                      task.category === 'eventsWebinars' || task.category === 'Events/webinars' || task.category === 'events/webinars' ? 'bg-lime-100 text-lime-800' :
                                                        task.category === 'halloween' || task.category === 'Halloween' ? 'bg-orange-100 text-orange-800' :
                                                          'bg-gray-100 text-gray-800'
                                              }`}>
                                              {getCategoryDisplayName(task.category) || task.type}
                                            </span>
                                          </div>
                                          {task.tags && task.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                              {task.tags.slice(0, 4).map((tag, tagIndex) => (
                                                <span key={tagIndex} className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                  #{tag}
                                                </span>
                                              ))}
                                              {task.tags.length > 4 && (
                                                <span className="text-sm text-gray-400">+{task.tags.length - 4}</span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div className="ml-3 flex-shrink-0">
                                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-green-100 text-green-800'
                                            }`}>
                                            {task.priority}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Core Hours (8-20) - Always visible */}
                  {Array.from({ length: 13 }, (_, i) => {
                    const hour = i + 8;
                    const timeString = `${hour.toString().padStart(2, '0')}:00`;
                    const isCurrentHour = selectedDay.toDateString() === new Date().toDateString() &&
                      new Date().getHours() === hour;
                    const tasksForHour = getTasksForDayView(selectedDay, hour);
                    const hasTasks = tasksForHour.length > 0;

                    return (
                      <div key={hour} className="relative">
                        <div className="sticky top-0 bg-white z-10 flex items-center h-12 border-b border-gray-100">
                          <div className="w-16 text-right pr-3 text-sm text-gray-500 font-medium">
                            {timeString}
                          </div>
                          <div className="flex-1 h-px bg-gray-200"></div>
                        </div>
                        <div
                          className={`relative bg-white hover:bg-gray-50 transition-colors cursor-pointer ${hasTasks ? 'min-h-20 py-2' : 'min-h-12'
                            }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleHourSlotClick(hour);
                          }}
                          title={user !== 'guest' ? `Click to add task at ${timeString}` : 'Guest users cannot add tasks'}
                        >
                          {isCurrentHour && (
                            <div className="absolute left-16 right-0 h-0.5 bg-red-500 z-20">
                              <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                          <div className="ml-16 pr-4 min-h-12">
                            {tasksForHour.map((task, index) => (
                              <div
                                key={`${task.id}-${index}`}
                                className="mb-3 p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all duration-200"
                                style={{
                                  borderLeftColor: getPriorityColor(task.priority),
                                  backgroundColor: getPriorityColor(task.priority, 0.05)
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedTask(task);
                                  setShowTaskModal(true);
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <span className="text-base font-semibold text-gray-900 truncate">
                                        {task.title}
                                      </span>
                                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {task.time}
                                      </span>
                                    </div>
                                    {task.description && (
                                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                        {task.description}
                                      </p>
                                    )}
                                    {task.comments && (
                                      <p className="text-sm text-gray-500 italic mb-3 leading-relaxed">
                                        {task.comments}
                                      </p>
                                    )}
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.category === 'blogPosts' || task.category === 'Blog Posts' ? 'bg-blue-100 text-blue-800' :
                                        task.category === 'campaigns' || task.category === 'Campaigns' ? 'bg-purple-100 text-purple-800' :
                                          task.category === 'emailMarketing' || task.category === 'Email Marketing' ? 'bg-orange-100 text-orange-800' :
                                            task.category === 'socialMedia' || task.category === 'Social Media' ? 'bg-green-100 text-green-800' :
                                              task.category === 'vacations' || task.category === 'Vacations' ? 'bg-gray-100 text-gray-800' :
                                                task.category === 'eventsWebinars' || task.category === 'Events/webinars' || task.category === 'events/webinars' ? 'bg-lime-100 text-lime-800' :
                                                  task.category === 'halloween' || task.category === 'Halloween' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {getCategoryDisplayName(task.category) || task.type}
                                      </span>
                                    </div>
                                    {task.tags && task.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-2">
                                        {task.tags.slice(0, 4).map((tag, tagIndex) => (
                                          <span key={tagIndex} className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            #{tag}
                                          </span>
                                        ))}
                                        {task.tags.length > 4 && (
                                          <span className="text-sm text-gray-400">+{task.tags.length - 4}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-3 flex-shrink-0">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Late Hours (21-23) - Collapsible */}
                  <div className="border-t border-gray-200">
                    <button
                      onClick={() => setShowLateHours(!showLateHours)}
                      className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Late Hours (9:00 PM - 11:00 PM)</span>
                        {getLateHoursTaskCount(selectedDay) > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getLateHoursTaskCount(selectedDay)} task{getLateHoursTaskCount(selectedDay) !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <svg
                        className={`w-4 h-4 transform transition-transform ${showLateHours ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showLateHours && (
                      <div>
                        {Array.from({ length: 3 }, (_, i) => {
                          const hour = i + 21;
                          const timeString = `${hour.toString().padStart(2, '0')}:00`;
                          const isCurrentHour = selectedDay.toDateString() === new Date().toDateString() &&
                            new Date().getHours() === hour;
                          const tasksForHour = getTasksForDayView(selectedDay, hour);
                          const hasTasks = tasksForHour.length > 0;

                          return (
                            <div key={hour} className="relative">
                              <div className="sticky top-0 bg-white z-10 flex items-center h-12 border-b border-gray-100">
                                <div className="w-16 text-right pr-3 text-sm text-gray-500 font-medium">
                                  {timeString}
                                </div>
                                <div className="flex-1 h-px bg-gray-200"></div>
                              </div>
                              <div
                                className={`relative bg-white hover:bg-gray-50 transition-colors cursor-pointer ${hasTasks ? 'min-h-20 py-2' : 'min-h-12'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleHourSlotClick(hour);
                                }}
                                title={user !== 'guest' ? `Click to add task at ${timeString}` : 'Guest users cannot add tasks'}
                              >
                                {isCurrentHour && (
                                  <div className="absolute left-16 right-0 h-0.5 bg-red-500 z-20">
                                    <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                  </div>
                                )}
                                <div className="ml-16 pr-4 min-h-12">
                                  {tasksForHour.map((task, index) => (
                                    <div
                                      key={`${task.id}-${index}`}
                                      className="mb-3 p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all duration-200"
                                      style={{
                                        borderLeftColor: getPriorityColor(task.priority),
                                        backgroundColor: getPriorityColor(task.priority, 0.05)
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedTask(task);
                                        setShowTaskModal(true);
                                      }}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center space-x-3 mb-2">
                                            <span className="text-base font-semibold text-gray-900 truncate">
                                              {task.title}
                                            </span>
                                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                              {task.time}
                                            </span>
                                          </div>
                                          {task.description && (
                                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                              {task.description}
                                            </p>
                                          )}
                                          {task.comments && (
                                            <p className="text-sm text-gray-500 italic mb-3 leading-relaxed">
                                              {task.comments}
                                            </p>
                                          )}
                                          <div className="flex items-center space-x-2 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.category === 'blogPosts' || task.category === 'Blog Posts' ? 'bg-blue-100 text-blue-800' :
                                              task.category === 'campaigns' || task.category === 'Campaigns' ? 'bg-purple-100 text-purple-800' :
                                                task.category === 'emailMarketing' || task.category === 'Email Marketing' ? 'bg-orange-100 text-orange-800' :
                                                  task.category === 'socialMedia' || task.category === 'Social Media' ? 'bg-green-100 text-green-800' :
                                                    task.category === 'vacations' || task.category === 'Vacations' ? 'bg-gray-100 text-gray-800' :
                                                      task.category === 'eventsWebinars' || task.category === 'Events/webinars' || task.category === 'events/webinars' ? 'bg-lime-100 text-lime-800' :
                                                        task.category === 'halloween' || task.category === 'Halloween' ? 'bg-orange-100 text-orange-800' :
                                                          'bg-gray-100 text-gray-800'
                                              }`}>
                                              {getCategoryDisplayName(task.category) || task.type}
                                            </span>
                                          </div>
                                          {task.tags && task.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                              {task.tags.slice(0, 4).map((tag, tagIndex) => (
                                                <span key={tagIndex} className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                  #{tag}
                                                </span>
                                              ))}
                                              {task.tags.length > 4 && (
                                                <span className="text-sm text-gray-400">+{task.tags.length - 4}</span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div className="ml-3 flex-shrink-0">
                                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-green-100 text-green-800'
                                            }`}>
                                            {task.priority}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            activeView === 'Kanban' ? (
              /* Kanban View */
              <div className="h-full">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 h-full">
                  {kanbanColumns.map(column => (
                    <div
                      key={column.id}
                      className={`${column.color} rounded-lg p-4 transition-all duration-500 ${highlightedColumn === column.id
                        ? highlightPhase === 'appearing'
                          ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-md'
                          : highlightPhase === 'glowing'
                            ? 'ring-4 ring-blue-400 ring-opacity-75 shadow-xl'
                            : highlightPhase === 'disappearing'
                              ? 'ring-2 ring-blue-400 ring-opacity-25 shadow-sm'
                              : ''
                        : ''
                        }`}
                      style={{
                        border: `1px solid ${column.id === 'planned' ? '#bbf7d0' :  // green-200
                          column.id === 'in-progress' ? '#fef08a' :  // yellow-200
                            column.id === 'review' ? '#fed7aa' :  // orange-200
                              column.id === 'completed' ? '#bfdbfe' :  // blue-200
                                column.borderColor
                          }`,
                        borderRight: `5px solid ${column.id === 'planned' ? '#22c55e' :  // green-500
                          column.id === 'in-progress' ? '#eab308' :  // yellow-500
                            column.id === 'review' ? '#f97316' :  // orange-500
                              column.id === 'completed' ? '#3b82f6' :  // blue-500
                                column.borderColor
                          }`
                      }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column.id)}
                    >
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-between">
                        {column.title}
                        <span className="text-sm bg-white px-2 py-1 rounded-full">
                          {getTasksByStatus(column.id).length}
                        </span>
                      </h3>
                      <div className="space-y-3">
                        {getTasksByStatus(column.id).map(task => (
                          <div
                            key={task.id}
                            className={`bg-white p-4 rounded-lg shadow-sm border cursor-move hover:shadow-md transition-shadow ${draggedTask?.id === task.id ? 'opacity-50' : ''
                              }`}
                            draggable={user !== 'guest'}
                            onDragStart={user !== 'guest' ? (e) => handleDragStart(e, task) : undefined}
                            onClick={user !== 'guest' ? () => handleTaskClick(task) : undefined}
                          >
                            <div className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                              <span>{task.title}</span>
                              {task.is_recurring && (
                                <Repeat className="w-4 h-4 text-blue-500" />
                              )}
                              {task.priority && task.priority !== 'medium' && (
                                <span className="text-xs">
                                  {priorityConfig[(task.priority || 'medium') as string]?.icon || '🟡'}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mb-3">{task.description}</div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs px-2 py-1 rounded ${task.color}`}>
                                {getTaskCategoryDisplayName(task)}
                              </span>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {monthNames[task.month || currentDate.getMonth()]} {task.date}
                                </span>
                              </div>
                            </div>
                            {task.is_multiday ? (
                              <div className="flex items-center space-x-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {task.start_date && task.end_date ?
                                    `${new Date(task.start_date + 'T00:00:00').toLocaleDateString()} - ${new Date(task.end_date + 'T00:00:00').toLocaleDateString()}` :
                                    'Multi-Day'
                                  }
                                </span>
                              </div>
                            ) : task.is_all_day ? (
                              <div className="flex items-center space-x-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500">All Day</span>
                              </div>
                            ) : task.time && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500">{task.time}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex -space-x-1">
                                {getAssigneesAvatars(task).map((avatar: string, index: number) => {
                                  const assigneeIds = task.assignees && task.assignees.length > 0 ? task.assignees : (task.assignee ? [task.assignee] : []);
                                  const member = teamMembers.find(m => m.id === assigneeIds[index]);
                                  return (
                                    <div key={index} className={`w-6 h-6 ${member?.color || 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white`}>
                                      {avatar}
                                    </div>
                                  );
                                })}
                                {task.assignees && task.assignees.length > 3 && (
                                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                                    +{task.assignees.length - 3}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-gray-600">
                                {getAssigneesDisplay(task)}
                              </span>
                            </div>
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {task.tags.slice(0, 3).map((tag: string, index: number) => (
                                  <span
                                    key={index}
                                    className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded truncate max-w-[80px] sm:max-w-none"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {task.tags.length > 3 && (
                                  <span className="text-[10px] text-gray-500">+{task.tags.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Priority View */
              <div className="h-full">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 h-full">
                  {priorityColumns.map(column => (
                    <div
                      key={column.id}
                      className={`${column.color} rounded-lg p-4 transition-all duration-500 ${highlightedColumn === column.id
                        ? highlightPhase === 'appearing'
                          ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-md'
                          : highlightPhase === 'glowing'
                            ? 'ring-4 ring-blue-400 ring-opacity-75 shadow-xl'
                            : highlightPhase === 'disappearing'
                              ? 'ring-2 ring-blue-400 ring-opacity-25 shadow-sm'
                              : ''
                        : ''
                        }`}
                      style={{
                        border: `1px solid ${column.borderColor}`,
                        borderBottom: `5px solid ${column.borderColor === 'darkgreen' ? '#22c55e' : // green-500
                          column.borderColor === 'rosybrown' ? '#eab308' : // yellow-500
                            column.borderColor === 'darkred' ? '#ef4444' : // red-500
                              column.borderColor
                          }`
                      }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handlePriorityDrop(e, column.id)}
                    >
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="text-xl">{column.icon}</span>
                          {column.title}
                        </span>
                        <span className="text-sm bg-white px-2 py-1 rounded-full">
                          {getTasksByPriority(column.id).length}
                        </span>
                      </h3>
                      <div className="space-y-3">
                        {getTasksByPriority(column.id).map(task => (
                          <div
                            key={task.id}
                            className={`bg-white p-4 rounded-lg shadow-sm border cursor-move hover:shadow-md transition-shadow ${draggedTask?.id === task.id ? 'opacity-50' : ''
                              }`}
                            draggable={user !== 'guest'}
                            onDragStart={user !== 'guest' ? (e) => handleDragStart(e, task) : undefined}
                            onClick={user !== 'guest' ? () => handleTaskClick(task) : undefined}
                          >
                            <div className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                              <span>{task.title}</span>
                              {task.is_recurring && (
                                <Repeat className="w-4 h-4 text-blue-500" />
                              )}
                              {task.priority && task.priority !== 'medium' && (
                                <span className="text-xs">
                                  {priorityConfig[(task.priority || 'medium') as string]?.icon || '🟡'}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mb-3">{task.description}</div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs px-2 py-1 rounded ${task.color}`}>
                                {getTaskCategoryDisplayName(task)}
                              </span>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {monthNames[task.month || currentDate.getMonth()]} {task.date}
                                </span>
                              </div>
                            </div>
                            {task.is_multiday ? (
                              <div className="flex items-center space-x-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {task.start_date && task.end_date ?
                                    `${new Date(task.start_date + 'T00:00:00').toLocaleDateString()} - ${new Date(task.end_date + 'T00:00:00').toLocaleDateString()}` :
                                    'Multi-Day'
                                  }
                                </span>
                              </div>
                            ) : task.is_all_day ? (
                              <div className="flex items-center space-x-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500">All Day</span>
                              </div>
                            ) : task.time && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500">{task.time}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex -space-x-1">
                                {getAssigneesAvatars(task).map((avatar: string, index: number) => {
                                  const assigneeIds = task.assignees && task.assignees.length > 0 ? task.assignees : (task.assignee ? [task.assignee] : []);
                                  const member = teamMembers.find(m => m.id === assigneeIds[index]);
                                  return (
                                    <div key={index} className={`w-6 h-6 ${member?.color || 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white`}>
                                      {avatar}
                                    </div>
                                  );
                                })}
                                {task.assignees && task.assignees.length > 3 && (
                                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                                    +{task.assignees.length - 3}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-gray-600">
                                {getAssigneesDisplay(task)}
                              </span>
                            </div>
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {task.tags.slice(0, 3).map((tag: string, index: number) => (
                                  <span
                                    key={index}
                                    className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded truncate max-w-[80px] sm:max-w-none"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {task.tags.length > 3 && (
                                  <span className="text-[10px] text-gray-500">+{task.tags.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
      {/* New Entry Modal */}
      {showNewEntryModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 md:p-4"
          onClick={() => setShowNewEntryModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95vw] md:w-[800px] mx-2 md:mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                New Entry
                {preSelectedDate && (
                  <span className="text-sm text-blue-600 ml-2">
                    (for {monthNames[preSelectedDate.month]} {preSelectedDate.date}, {preSelectedDate.year})
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowNewEntryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask((prev: any) => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask((prev: any) => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={newTask.month}
                    onChange={(e) => setNewTask((prev: any) => ({ ...prev, month: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={newTask.year}
                    onChange={(e) => setNewTask((prev: any) => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="2020"
                    max="2099"
                    placeholder="Enter year"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_multiday"
                    checked={newTask.is_multiday}
                    onChange={(e) => {
                      const isMultiday = e.target.checked;
                      setNewTask((prev: any) => {
                        if (isMultiday) {
                          // When enabling multi-day, set start_date to current task date and end_date to +1 day
                          const startDate = new Date(prev.year, prev.month, prev.date);
                          const endDate = new Date(startDate);
                          endDate.setDate(endDate.getDate() + 1);

                          return {
                            ...prev,
                            is_multiday: isMultiday,
                            is_all_day: false,
                            time: '',
                            start_date: startDate.toISOString().split('T')[0],
                            end_date: endDate.toISOString().split('T')[0]
                          };
                        } else {
                          return {
                            ...prev,
                            is_multiday: isMultiday,
                            is_all_day: prev.is_all_day,
                            time: prev.time || '09:00',
                            start_date: '',
                            end_date: ''
                          };
                        }
                      });
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_multiday" className="ml-2 text-sm font-medium text-gray-700">
                    Multi-Day Task
                  </label>
                </div>

                {newTask.is_multiday ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={newTask.start_date || ''}
                        onChange={(e) => setNewTask((prev: any) => ({
                          ...prev,
                          start_date: e.target.value,
                          date: e.target.value ? parseInt(e.target.value.split('-')[2]) : prev.date,
                          month: e.target.value ? parseInt(e.target.value.split('-')[1]) - 1 : prev.month,
                          year: e.target.value ? parseInt(e.target.value.split('-')[0]) : prev.year
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={newTask.end_date || ''}
                        onChange={(e) => setNewTask((prev: any) => ({ ...prev, end_date: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                      <input
                        type="number"
                        min="1"
                        max={getDaysInMonthCount(newTask.year, newTask.month)}
                        value={newTask.date}
                        onChange={(e) => setNewTask((prev: any) => ({ ...prev, date: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="is_all_day"
                            checked={newTask.is_all_day}
                            onChange={(e) => setNewTask((prev: any) => ({
                              ...prev,
                              is_all_day: e.target.checked,
                              time: e.target.checked ? '' : prev.time || '09:00'
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="is_all_day" className="ml-2 text-sm text-gray-700">
                            All Day Event
                          </label>
                        </div>
                        {!newTask.is_all_day && (
                          <input
                            type="time"
                            value={newTask.time}
                            onChange={(e) => setNewTask((prev: any) => ({ ...prev, time: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="flex gap-2">
                    <select
                      value={newTask.category || ''}
                      onChange={(e) => {
                        setNewTask((prev: any) => ({
                          ...prev,
                          category: e.target.value,
                          type: getCategoryConfig(e.target.value).type
                        }));
                      }}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.display_name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCustomCategoryModal(true)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      + New
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignees</label>
                  <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newTask.assignees.length === teamMembers.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTask((prev: any) => ({
                                ...prev,
                                assignees: teamMembers.map(member => member.id),
                                assignee: teamMembers[0]?.id || null // Keep backward compatibility
                              }));
                            } else {
                              setNewTask((prev: any) => ({
                                ...prev,
                                assignees: [],
                                assignee: null
                              }));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">All Team Members</span>
                      </label>
                      {teamMembers.map(member => (
                        <label key={member.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newTask.assignees.includes(member.id)}
                            onChange={(e) => {
                              setNewTask((prev: any) => {
                                let newAssignees;
                                if (e.target.checked) {
                                  newAssignees = [...prev.assignees, member.id];
                                } else {
                                  newAssignees = prev.assignees.filter((id: number) => id !== member.id);
                                }
                                return {
                                  ...prev,
                                  assignees: newAssignees,
                                  assignee: newAssignees.length > 0 ? newAssignees[0] : null // Keep backward compatibility
                                };
                              });
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{member.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created by
                  {user && user !== 'guest' && (
                    <span className="text-xs text-gray-500 ml-2">(Auto-assigned)</span>
                  )}
                </label>
                <select
                  value={newTask.created_by || ''}
                  onChange={(e) => setNewTask((prev: any) => ({ ...prev, created_by: e.target.value ? parseInt(e.target.value) : null }))}
                  disabled={user && user !== 'guest'}
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${user && user !== 'guest' ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                >
                  <option value="">Select Created by</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask((prev: any) => ({ ...prev, priority: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recurring</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_recurring"
                      checked={newTask.is_recurring}
                      onChange={(e) => setNewTask((prev: any) => {
                        if (e.target.checked) {
                          // Set default end date to the same day as start date
                          const startDate = new Date(prev.year, prev.month, prev.date);

                          return {
                            ...prev,
                            is_recurring: true,
                            recurring_pattern: prev.recurring_pattern || 'weekly',
                            recurring_end_date: startDate.toISOString().split('T')[0]
                          };
                        } else {
                          return {
                            ...prev,
                            is_recurring: false,
                            recurring_pattern: '',
                            recurring_end_date: null
                          };
                        }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_recurring" className="text-sm text-gray-700">
                      Make this task recurring
                    </label>
                  </div>

                  {newTask.is_recurring && (
                    <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Pattern Type</label>
                        <select
                          value={newTask.recurring_unit || ''}
                          onChange={(e) => {
                            setNewTask((prev: any) => {
                              const unit = e.target.value;
                              let pattern = '';
                              let interval = 1;

                              // Set pattern based on selection
                              if (unit === 'day') pattern = 'daily';
                              else if (unit === 'week') pattern = 'weekly';
                              else if (unit === 'month') pattern = 'monthly';
                              else if (unit === 'year') pattern = 'yearly';
                              else if (unit === 'monthly_advanced') pattern = 'monthly_advanced';
                              else if (unit === 'yearly_advanced') pattern = 'yearly_advanced';

                              return {
                                ...prev,
                                recurring_unit: unit,
                                recurring_pattern: pattern,
                                recurring_interval: interval,
                                recurring_days: [],
                                recurring_occurrence: unit.includes('advanced') ? 'first' : null,
                                recurring_month: unit === 'yearly_advanced' ? 0 : null
                              };
                            });
                          }}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Please select pattern type</option>
                          <optgroup label="Simple Patterns">
                            <option value="day">Every X day(s)</option>
                            <option value="week">Every X week(s)</option>
                            <option value="month">Every X month(s)</option>
                            <option value="year">Every X year(s)</option>
                          </optgroup>
                          <optgroup label="Advanced Patterns">
                            <option value="monthly_advanced">Specific day of month (e.g., First Monday)</option>
                            <option value="yearly_advanced">Specific day of year (e.g., Last Sunday in September)</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Simple patterns: show interval */}
                      {(newTask.recurring_unit === 'day' || newTask.recurring_unit === 'week' || newTask.recurring_unit === 'month' || newTask.recurring_unit === 'year') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Repeat every</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={newTask.recurring_interval || 1}
                              onChange={(e) => setNewTask((prev: any) => ({
                                ...prev,
                                recurring_interval: parseInt(e.target.value) || 1
                              }))}
                              className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {newTask.recurring_unit === 'day' && 'day(s)'}
                              {newTask.recurring_unit === 'week' && 'week(s)'}
                              {newTask.recurring_unit === 'month' && 'month(s)'}
                              {newTask.recurring_unit === 'year' && 'year(s)'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Weekly: select days */}
                      {newTask.recurring_unit === 'week' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Repeat on</label>
                          <div className="flex flex-wrap gap-2">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  const currentDays = newTask.recurring_days || [];
                                  const newDays = currentDays.includes(index)
                                    ? currentDays.filter((d: number) => d !== index)
                                    : [...currentDays, index];
                                  setNewTask((prev: any) => ({
                                    ...prev,
                                    recurring_days: newDays
                                  }));
                                }}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${(newTask.recurring_days || []).includes(index)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Monthly Advanced: occurrence + day */}
                      {newTask.recurring_unit === 'monthly_advanced' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Repeat every</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="1"
                                max="12"
                                value={newTask.recurring_interval || 1}
                                onChange={(e) => setNewTask((prev: any) => ({
                                  ...prev,
                                  recurring_interval: parseInt(e.target.value) || 1
                                }))}
                                className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">month(s)</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">On the</label>
                            <select
                              value={newTask.recurring_occurrence || 'first'}
                              onChange={(e) => setNewTask((prev: any) => ({
                                ...prev,
                                recurring_occurrence: e.target.value
                              }))}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="first">First</option>
                              <option value="second">Second</option>
                              <option value="third">Third</option>
                              <option value="fourth">Fourth</option>
                              <option value="last">Last</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">Day of week</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => {
                                    setNewTask((prev: any) => ({
                                      ...prev,
                                      recurring_days: [index]
                                    }));
                                  }}
                                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${(newTask.recurring_days || []).includes(index)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Yearly Advanced: occurrence + day + month */}
                      {newTask.recurring_unit === 'yearly_advanced' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Repeat every</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={newTask.recurring_interval || 1}
                                onChange={(e) => setNewTask((prev: any) => ({
                                  ...prev,
                                  recurring_interval: parseInt(e.target.value) || 1
                                }))}
                                className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">year(s)</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">On the</label>
                            <select
                              value={newTask.recurring_occurrence || 'first'}
                              onChange={(e) => setNewTask((prev: any) => ({
                                ...prev,
                                recurring_occurrence: e.target.value
                              }))}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="first">First</option>
                              <option value="second">Second</option>
                              <option value="third">Third</option>
                              <option value="fourth">Fourth</option>
                              <option value="last">Last</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">Day of week</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => {
                                    setNewTask((prev: any) => ({
                                      ...prev,
                                      recurring_days: [index]
                                    }));
                                  }}
                                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${(newTask.recurring_days || []).includes(index)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">In</label>
                            <select
                              value={newTask.recurring_month !== null && newTask.recurring_month !== undefined ? newTask.recurring_month : 0}
                              onChange={(e) => setNewTask((prev: any) => ({
                                ...prev,
                                recurring_month: parseInt(e.target.value)
                              }))}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {monthNames.map((month, index) => (
                                <option key={index} value={index}>{month}</option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End date (optional)</label>
                        <input
                          type="date"
                          value={newTask.recurring_end_date ? newTask.recurring_end_date : ''}
                          onChange={(e) => setNewTask((prev: any) => ({
                            ...prev,
                            recurring_end_date: e.target.value || null
                          }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty for no end date</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes or comments</label>
                <textarea
                  value={newTask.comments}
                  onChange={(e) => setNewTask((prev: any) => ({ ...prev, comments: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Add any additional notes or comments..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminders</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has_reminders"
                    checked={newTask.has_reminders || false}
                    onChange={(e) => setNewTask((prev: any) => ({ ...prev, has_reminders: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="has_reminders" className="text-sm text-gray-700">
                    Set reminders for this task
                  </label>
                </div>
                {newTask.has_reminders && (
                  <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4 mt-3">
                    <div className="space-y-3">
                      {[
                        { value: '15min', label: '15 min before' },
                        { value: '30min', label: '30 min before' },
                        { value: '1hour', label: '1 hour before' },
                        { value: '2hours', label: '2 hours before' },
                        { value: '1day', label: '1 day before' },
                        { value: '2days', label: '2 days before' },
                        { value: '1week', label: '1 week before' }
                      ].map((reminder) => (
                        <div key={reminder.value} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={newTask.reminder_times?.includes(reminder.value) || false}
                            onChange={(e) => {
                              const currentTimes = newTask.reminder_times || [];
                              const newTimes = e.target.checked
                                ? [...currentTimes, reminder.value]
                                : currentTimes.filter((time: string) => time !== reminder.value);
                              setNewTask((prev: any) => ({ ...prev, reminder_times: newTimes }));
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700 w-24">{reminder.label}</span>
                          <input
                            type="text"
                            placeholder="Reminder name (optional)"
                            value={newTask.reminder_names?.[reminder.value] || ''}
                            onChange={(e) => {
                              const currentNames = newTask.reminder_names || {};
                              setNewTask((prev: any) => ({
                                ...prev,
                                reminder_names: {
                                  ...currentNames,
                                  [reminder.value]: e.target.value
                                }
                              }));
                            }}
                            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={!newTask.reminder_times?.includes(reminder.value)}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Custom reminder time</label>
                      <div className="space-y-2">
                        <input
                          type="datetime-local"
                          value={newTask.reminder_custom_time}
                          onChange={(e) => setNewTask((prev: any) => ({ ...prev, reminder_custom_time: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Custom reminder name (optional)"
                          value={newTask.reminder_custom_name || ''}
                          onChange={(e) => setNewTask((prev: any) => ({ ...prev, reminder_custom_name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Set a specific date and time for the reminder</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-600">Additional custom reminders</label>
                        <button
                          type="button"
                          onClick={() => setNewTask((prev: any) => ({
                            ...prev,
                            custom_reminders: [...(prev.custom_reminders || []), { time: '', name: '' }]
                          }))}
                          className="flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Reminder
                        </button>
                      </div>
                      <div className="space-y-2">
                        {newTask.custom_reminders?.map((reminder: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="datetime-local"
                              value={reminder.time}
                              onChange={(e) => {
                                const updatedReminders = [...(newTask.custom_reminders || [])];
                                updatedReminders[index] = { ...reminder, time: e.target.value };
                                setNewTask((prev: any) => ({ ...prev, custom_reminders: updatedReminders }));
                              }}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Reminder name (optional)"
                              value={reminder.name}
                              onChange={(e) => {
                                const updatedReminders = [...(newTask.custom_reminders || [])];
                                updatedReminders[index] = { ...reminder, name: e.target.value };
                                setNewTask((prev: any) => ({ ...prev, custom_reminders: updatedReminders }));
                              }}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedReminders = (newTask.custom_reminders || []).filter((_: any, i: number) => i !== index);
                                setNewTask((prev: any) => ({ ...prev, custom_reminders: updatedReminders }));
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {newTask.custom_reminders?.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">Click "Add Reminder" to create additional custom reminders</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  defaultValue={newTask.tags?.join(', ') || ''}
                  onBlur={(e) => setNewTask((prev: any) => ({
                    ...prev,
                    tags: e.target.value ? e.target.value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : []
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tags separated by commas (e.g., urgent, q4, marketing)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewEntryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewTask}
                disabled={!newTask.title.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Category Modal */}
      {showCustomCategoryModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-2 md:p-4"
          onClick={() => setShowCustomCategoryModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95vw] md:w-[500px] mx-2 md:mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create Custom Category</h3>
              <button
                onClick={() => setShowCustomCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customCategory.name}
                  onChange={(e) => setCustomCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Meetings, Projects, Events"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                <input
                  type="text"
                  value={customCategory.type}
                  disabled
                  className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Custom categories are automatically set to "Custom" type</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>

                {/* Preset Colors */}
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        setCustomCategory(prev => ({ ...prev, color_class: color.class }));
                      }}
                      className={`p-3 rounded-md border-2 ${customCategory.color_class === color.class
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      title={color.name}
                    >
                      <div className={`w-full h-6 rounded ${color.class} flex items-center justify-center text-xs font-medium`}>
                        {color.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCustomCategoryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomCategory}
                disabled={!customCategory.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 md:p-4"
          onClick={() => setShowTaskModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95vw] md:w-[800px] mx-2 md:mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Task Details</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{selectedTask.title || 'Unknown Task'}</h4>
                <p className="text-gray-600 text-sm">{selectedTask.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">CATEGORY</label>
                  <span className={`text-xs px-2 py-1 rounded ${selectedTask.color || 'bg-gray-100'}`}>
                    {getTaskCategoryDisplayName(selectedTask)}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">STATUS</label>
                  <span className={`text-xs px-2 py-1 rounded capitalize ${selectedTask.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    selectedTask.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      selectedTask.status === 'review' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {selectedTask.status?.replace('-', ' ') || 'Unknown'}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">PRIORITY</label>
                  <span className={`text-xs px-2 py-1 rounded ${priorityConfig[selectedTask.priority]?.color || priorityConfig.medium.color}`}>
                    {priorityConfig[selectedTask.priority]?.icon || '🟡'} {priorityConfig[selectedTask.priority]?.label || 'Medium'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">ASSIGNED TO</label>
                <div className="flex items-center space-x-2">
                  {(selectedTask.assignees && selectedTask.assignees.length > 0) || selectedTask.assignee ? (
                    <>
                      <div className="flex -space-x-1">
                        {getAssigneesAvatars(selectedTask).map((avatar: string, index: number) => {
                          const assigneeIds = selectedTask.assignees && selectedTask.assignees.length > 0 ? selectedTask.assignees : (selectedTask.assignee ? [selectedTask.assignee] : []);
                          const member = teamMembers.find(m => m.id === assigneeIds[index]);
                          return (
                            <div key={index} className={`w-6 h-6 ${member?.color || 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white`}>
                              {avatar}
                            </div>
                          );
                        })}
                        {selectedTask.assignees && selectedTask.assignees.length > 3 && (
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                            +{selectedTask.assignees.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-900">
                        {getAssigneesDisplay(selectedTask)}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        ?
                      </div>
                      <span className="text-sm text-gray-500">
                        Unassigned
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">DUE DATE</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {monthNames[selectedTask.month || currentDate.getMonth()]} {selectedTask.date}, {selectedTask.year || currentDate.getFullYear()}
                  </span>
                  {selectedTask.is_multiday ? (
                    <>
                      <Calendar className="w-4 h-4 text-gray-400 ml-4" />
                      <span className="text-sm text-gray-900">
                        {selectedTask.start_date && selectedTask.end_date ?
                          `${new Date(selectedTask.start_date + 'T00:00:00').toLocaleDateString()} - ${new Date(selectedTask.end_date + 'T00:00:00').toLocaleDateString()}` :
                          'Multi-Day'
                        }
                      </span>
                    </>
                  ) : selectedTask.is_all_day ? (
                    <>
                      <Calendar className="w-4 h-4 text-gray-400 ml-4" />
                      <span className="text-sm text-gray-900">All Day</span>
                    </>
                  ) : selectedTask.time && (
                    <>
                      <Clock className="w-4 h-4 text-gray-400 ml-4" />
                      <span className="text-sm text-gray-900">{selectedTask.time}</span>
                    </>
                  )}
                </div>
              </div>

              {selectedTask.comments && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">COMMENTS</label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedTask.comments}
                  </div>
                </div>
              )}

              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">TAGS</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">CREATED</label>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {selectedTask.created_at ? (
                    <>
                      <span className="text-sm text-gray-900">
                        {new Date(selectedTask.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        at {new Date(selectedTask.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {selectedTask.created_by && (
                        <span className="text-sm text-gray-600">
                          by {getTeamMemberName(selectedTask.created_by)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Date not available
                    </span>
                  )}
                </div>
              </div>

              {selectedTask.reminders && selectedTask.reminders.filter((r: any) => !r.dismissed).length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">REMINDERS</label>
                  <div className="space-y-2">
                    {selectedTask.reminders.filter((r: any) => !r.dismissed).map((reminder: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900">
                              {reminder.type === '15min' ? '15 min before' :
                                reminder.type === '30min' ? '30 min before' :
                                  reminder.type === '1hour' ? '1 hour before' :
                                    reminder.type === '2hours' ? '2 hours before' :
                                      reminder.type === '1day' ? '1 day before' :
                                        reminder.type === '2days' ? '2 days before' :
                                          reminder.type === '1week' ? '1 week before' :
                                            'Custom reminder'}
                            </span>
                            {reminder.name && (
                              <span className="text-sm font-medium text-blue-600">
                                - {reminder.name}
                              </span>
                            )}
                          </div>
                          {reminder.type === 'custom' && reminder.custom_time && (
                            <div className="text-xs text-gray-500">
                              {new Date(reminder.custom_time).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-3 mt-6">
              {(selectedTask.is_recurring || selectedTask.is_recurring_instance) ? (
                <>
                  <button
                    onClick={() => handleDeleteTask(false)}
                    className="px-4 py-2 border border-orange-300 text-orange-700 rounded-md hover:bg-orange-50"
                  >
                    Delete This One
                  </button>
                  <button
                    onClick={() => handleDeleteTask(true)}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                  >
                    Delete All
                  </button>
                  <button
                    onClick={() => handleEditRecurringTask()}
                    className="px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50"
                  >
                    Edit Recurring Task
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleDeleteTask()}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleDuplicateTask}
                className="px-4 py-2 border border-green-300 text-green-700 rounded-md hover:bg-green-50"
              >
                Duplicate
              </button>
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleEditTask}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
              >
                Edit Task
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 md:p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95vw] md:w-[800px] mx-2 md:mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Task</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Mode Selection for Recurring Tasks */}
            {(editingTask.is_recurring || editingTask.is_recurring_instance) && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Edit Mode</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="editMode"
                      value="single"
                      checked={editMode === 'single'}
                      onChange={(e) => setEditMode(e.target.value as 'single' | 'all')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Edit this occurrence only (other occurrences will remain unchanged)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="editMode"
                      value="all"
                      checked={editMode === 'all'}
                      onChange={(e) => setEditMode(e.target.value as 'single' | 'all')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Edit all occurrences of this recurring task
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask((prev: any) => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask((prev: any) => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={editingTask.month}
                    onChange={(e) => setEditingTask((prev: any) => ({ ...prev, month: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={editingTask.year}
                    onChange={(e) => setEditingTask((prev: any) => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="2020"
                    max="2099"
                    placeholder="Enter year"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit_is_multiday"
                    checked={editingTask.is_multiday}
                    onChange={(e) => {
                      const isMultiday = e.target.checked;
                      setEditingTask((prev: any) => {
                        if (isMultiday) {
                          // When enabling multi-day, set start_date to current task date and end_date to +1 day
                          const startDate = new Date(prev.year, prev.month, prev.date);
                          const endDate = new Date(startDate);
                          endDate.setDate(endDate.getDate() + 1);

                          return {
                            ...prev,
                            is_multiday: isMultiday,
                            is_all_day: false,
                            time: '',
                            start_date: startDate.toISOString().split('T')[0],
                            end_date: endDate.toISOString().split('T')[0]
                          };
                        } else {
                          return {
                            ...prev,
                            is_multiday: isMultiday,
                            is_all_day: prev.is_all_day,
                            time: prev.time || '09:00',
                            start_date: '',
                            end_date: ''
                          };
                        }
                      });
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit_is_multiday" className="ml-2 text-sm font-medium text-gray-700">
                    Multi-Day Task
                  </label>
                </div>

                {editingTask.is_multiday ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={editingTask.start_date || ''}
                        onChange={(e) => setEditingTask((prev: any) => ({
                          ...prev,
                          start_date: e.target.value,
                          date: e.target.value ? parseInt(e.target.value.split('-')[2]) : prev.date,
                          month: e.target.value ? parseInt(e.target.value.split('-')[1]) - 1 : prev.month,
                          year: e.target.value ? parseInt(e.target.value.split('-')[0]) : prev.year
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={editingTask.end_date || ''}
                        onChange={(e) => setEditingTask((prev: any) => ({ ...prev, end_date: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                      <input
                        type="number"
                        min="1"
                        max={getDaysInMonthCount(editingTask.year, editingTask.month)}
                        value={editingTask.date}
                        onChange={(e) => setEditingTask((prev: any) => ({ ...prev, date: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="edit_is_all_day"
                            checked={editingTask.is_all_day}
                            onChange={(e) => setEditingTask((prev: any) => ({
                              ...prev,
                              is_all_day: e.target.checked,
                              time: e.target.checked ? '' : prev.time || '09:00'
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="edit_is_all_day" className="ml-2 text-sm text-gray-700">
                            All Day Event
                          </label>
                        </div>
                        {!editingTask.is_all_day && (
                          <input
                            type="time"
                            value={editingTask.time}
                            onChange={(e) => setEditingTask((prev: any) => ({ ...prev, time: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingTask.category}
                    onChange={(e) => setEditingTask((prev: any) => ({
                      ...prev,
                      category: e.target.value,
                      type: getCategoryConfig(e.target.value).type
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignees</label>
                  <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingTask.assignees && editingTask.assignees.length === teamMembers.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditingTask((prev: any) => ({
                                ...prev,
                                assignees: teamMembers.map(member => member.id),
                                assignee: teamMembers[0]?.id || null // Keep backward compatibility
                              }));
                            } else {
                              setEditingTask((prev: any) => ({
                                ...prev,
                                assignees: [],
                                assignee: null
                              }));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">All Team Members</span>
                      </label>
                      {teamMembers.map(member => (
                        <label key={member.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingTask.assignees && editingTask.assignees.includes(member.id)}
                            onChange={(e) => {
                              setEditingTask((prev: any) => {
                                let newAssignees;
                                if (e.target.checked) {
                                  newAssignees = [...(prev.assignees || []), member.id];
                                } else {
                                  newAssignees = (prev.assignees || []).filter((id: number) => id !== member.id);
                                }
                                return {
                                  ...prev,
                                  assignees: newAssignees,
                                  assignee: newAssignees.length > 0 ? newAssignees[0] : null // Keep backward compatibility
                                };
                              });
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{member.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask((prev: any) => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={editingTask.priority || 'medium'}
                    onChange={(e) => setEditingTask((prev: any) => ({ ...prev, priority: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recurring</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit_is_recurring"
                      checked={editingTask.is_recurring || false}
                      onChange={(e) => setEditingTask((prev: any) => {
                        if (e.target.checked) {
                          // Set default end date to the same day as start date
                          const startDate = new Date(prev.year, prev.month, prev.date);

                          return {
                            ...prev,
                            is_recurring: true,
                            recurring_pattern: prev.recurring_pattern || 'weekly',
                            recurring_end_date: prev.recurring_end_date || startDate.toISOString().split('T')[0]
                          };
                        } else {
                          return {
                            ...prev,
                            is_recurring: false,
                            recurring_pattern: '',
                            recurring_end_date: null
                          };
                        }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit_is_recurring" className="text-sm text-gray-700">
                      Make this task recurring
                    </label>
                  </div>

                  {(editingTask.is_recurring || false) && (
                    <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Pattern Type</label>
                        <select
                          value={editingTask.recurring_unit || ''}
                          onChange={(e) => {
                            setEditingTask((prev: any) => {
                              const unit = e.target.value;
                              let pattern = '';
                              let interval = 1;

                              // Set pattern based on selection
                              if (unit === 'day') pattern = 'daily';
                              else if (unit === 'week') pattern = 'weekly';
                              else if (unit === 'month') pattern = 'monthly';
                              else if (unit === 'year') pattern = 'yearly';
                              else if (unit === 'monthly_advanced') pattern = 'monthly_advanced';
                              else if (unit === 'yearly_advanced') pattern = 'yearly_advanced';

                              return {
                                ...prev,
                                recurring_unit: unit,
                                recurring_pattern: pattern,
                                recurring_interval: interval,
                                recurring_days: [],
                                recurring_occurrence: unit.includes('advanced') ? 'first' : null,
                                recurring_month: unit === 'yearly_advanced' ? 0 : null
                              };
                            });
                          }}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Please select pattern type</option>
                          <optgroup label="Simple Patterns">
                            <option value="day">Every X day(s)</option>
                            <option value="week">Every X week(s)</option>
                            <option value="month">Every X month(s)</option>
                            <option value="year">Every X year(s)</option>
                          </optgroup>
                          <optgroup label="Advanced Patterns">
                            <option value="monthly_advanced">Specific day of month (e.g., First Monday)</option>
                            <option value="yearly_advanced">Specific day of year (e.g., Last Sunday in September)</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Simple patterns: show interval */}
                      {(editingTask.recurring_unit === 'day' || editingTask.recurring_unit === 'week' || editingTask.recurring_unit === 'month' || editingTask.recurring_unit === 'year') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Repeat every</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={editingTask.recurring_interval || 1}
                              onChange={(e) => setEditingTask((prev: any) => ({
                                ...prev,
                                recurring_interval: parseInt(e.target.value) || 1
                              }))}
                              className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {editingTask.recurring_unit === 'day' && 'day(s)'}
                              {editingTask.recurring_unit === 'week' && 'week(s)'}
                              {editingTask.recurring_unit === 'month' && 'month(s)'}
                              {editingTask.recurring_unit === 'year' && 'year(s)'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Weekly: select days */}
                      {editingTask.recurring_unit === 'week' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Repeat on</label>
                          <div className="flex flex-wrap gap-2">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  const currentDays = editingTask.recurring_days || [];
                                  const newDays = currentDays.includes(index)
                                    ? currentDays.filter((d: number) => d !== index)
                                    : [...currentDays, index];
                                  setEditingTask((prev: any) => ({
                                    ...prev,
                                    recurring_days: newDays
                                  }));
                                }}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${(editingTask.recurring_days || []).includes(index)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Monthly Advanced: occurrence + day */}
                      {editingTask.recurring_unit === 'monthly_advanced' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Repeat every</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="1"
                                max="12"
                                value={editingTask.recurring_interval || 1}
                                onChange={(e) => setEditingTask((prev: any) => ({
                                  ...prev,
                                  recurring_interval: parseInt(e.target.value) || 1
                                }))}
                                className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">month(s)</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">On the</label>
                            <select
                              value={editingTask.recurring_occurrence || 'first'}
                              onChange={(e) => setEditingTask((prev: any) => ({
                                ...prev,
                                recurring_occurrence: e.target.value
                              }))}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="first">First</option>
                              <option value="second">Second</option>
                              <option value="third">Third</option>
                              <option value="fourth">Fourth</option>
                              <option value="last">Last</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">Day of week</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => {
                                    setEditingTask((prev: any) => ({
                                      ...prev,
                                      recurring_days: [index]
                                    }));
                                  }}
                                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${(editingTask.recurring_days || []).includes(index)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Yearly Advanced: occurrence + day + month */}
                      {editingTask.recurring_unit === 'yearly_advanced' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Repeat every</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={editingTask.recurring_interval || 1}
                                onChange={(e) => setEditingTask((prev: any) => ({
                                  ...prev,
                                  recurring_interval: parseInt(e.target.value) || 1
                                }))}
                                className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">year(s)</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">On the</label>
                            <select
                              value={editingTask.recurring_occurrence || 'first'}
                              onChange={(e) => setEditingTask((prev: any) => ({
                                ...prev,
                                recurring_occurrence: e.target.value
                              }))}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="first">First</option>
                              <option value="second">Second</option>
                              <option value="third">Third</option>
                              <option value="fourth">Fourth</option>
                              <option value="last">Last</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">Day of week</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => {
                                    setEditingTask((prev: any) => ({
                                      ...prev,
                                      recurring_days: [index]
                                    }));
                                  }}
                                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${(editingTask.recurring_days || []).includes(index)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">In</label>
                            <select
                              value={editingTask.recurring_month !== null && editingTask.recurring_month !== undefined ? editingTask.recurring_month : 0}
                              onChange={(e) => setEditingTask((prev: any) => ({
                                ...prev,
                                recurring_month: parseInt(e.target.value)
                              }))}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {monthNames.map((month, index) => (
                                <option key={index} value={index}>{month}</option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End date (optional)</label>
                        <input
                          type="date"
                          value={editingTask.recurring_end_date ? editingTask.recurring_end_date : ''}
                          onChange={(e) => setEditingTask((prev: any) => ({
                            ...prev,
                            recurring_end_date: e.target.value || null
                          }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty for no end date</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes or comments</label>
                <textarea
                  value={editingTask.comments || ''}
                  onChange={(e) => setEditingTask((prev: any) => ({ ...prev, comments: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add any additional notes or comments..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminders</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_has_reminders"
                    checked={editingTask.has_reminders || false}
                    onChange={(e) => setEditingTask((prev: any) => ({ ...prev, has_reminders: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit_has_reminders" className="text-sm text-gray-700">
                    Set reminders for this task
                  </label>
                </div>
                {(editingTask.has_reminders || false) && (
                  <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4 mt-3">
                    <div className="space-y-3">
                      {[
                        { value: '15min', label: '15 min before' },
                        { value: '30min', label: '30 min before' },
                        { value: '1hour', label: '1 hour before' },
                        { value: '2hours', label: '2 hours before' },
                        { value: '1day', label: '1 day before' },
                        { value: '2days', label: '2 days before' },
                        { value: '1week', label: '1 week before' }
                      ].map((reminder) => (
                        <div key={reminder.value} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={editingTask.reminder_times?.includes(reminder.value) || false}
                            onChange={(e) => {
                              const currentTimes = editingTask.reminder_times || [];
                              const newTimes = e.target.checked
                                ? [...currentTimes, reminder.value]
                                : currentTimes.filter((time: string) => time !== reminder.value);
                              setEditingTask((prev: any) => ({ ...prev, reminder_times: newTimes }));
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700 w-24">{reminder.label}</span>
                          <input
                            type="text"
                            placeholder="Reminder name (optional)"
                            value={editingTask.reminder_names?.[reminder.value] || ''}
                            onChange={(e) => {
                              const currentNames = editingTask.reminder_names || {};
                              setEditingTask((prev: any) => ({
                                ...prev,
                                reminder_names: {
                                  ...currentNames,
                                  [reminder.value]: e.target.value
                                }
                              }));
                            }}
                            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={!editingTask.reminder_times?.includes(reminder.value)}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Custom reminder time</label>
                      <div className="space-y-2">
                        <input
                          type="datetime-local"
                          value={editingTask.reminder_custom_time || ''}
                          onChange={(e) => setEditingTask((prev: any) => ({ ...prev, reminder_custom_time: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Custom reminder name (optional)"
                          value={editingTask.reminder_custom_name || ''}
                          onChange={(e) => setEditingTask((prev: any) => ({ ...prev, reminder_custom_name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Set a specific date and time for the reminder</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-600">Additional custom reminders</label>
                        <button
                          type="button"
                          onClick={() => setEditingTask((prev: any) => ({
                            ...prev,
                            custom_reminders: [...(prev.custom_reminders || []), { time: '', name: '' }]
                          }))}
                          className="flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Reminder
                        </button>
                      </div>
                      <div className="space-y-2">
                        {editingTask.custom_reminders?.map((reminder: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="datetime-local"
                              value={reminder.time}
                              onChange={(e) => {
                                const updatedReminders = [...(editingTask.custom_reminders || [])];
                                updatedReminders[index] = { ...reminder, time: e.target.value };
                                setEditingTask((prev: any) => ({ ...prev, custom_reminders: updatedReminders }));
                              }}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Reminder name (optional)"
                              value={reminder.name}
                              onChange={(e) => {
                                const updatedReminders = [...(editingTask.custom_reminders || [])];
                                updatedReminders[index] = { ...reminder, name: e.target.value };
                                setEditingTask((prev: any) => ({ ...prev, custom_reminders: updatedReminders }));
                              }}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedReminders = (editingTask.custom_reminders || []).filter((_: any, i: number) => i !== index);
                                setEditingTask((prev: any) => ({ ...prev, custom_reminders: updatedReminders }));
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {editingTask.custom_reminders?.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">Click "Add Reminder" to create additional custom reminders</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  defaultValue={editingTask.tags?.join(', ') || ''}
                  onBlur={(e) => setEditingTask((prev: any) => ({
                    ...prev,
                    tags: e.target.value ? e.target.value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : []
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tags separated by commas (e.g., urgent, q4, marketing)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-500 mb-1">CREATED</label>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {editingTask.created_at ? new Date(editingTask.created_at).toLocaleDateString() : 'Unknown date'}
                  </span>
                  {editingTask.created_at && (
                    <span className="text-sm text-gray-500">
                      at {new Date(editingTask.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {editingTask.created_by && (
                    <span className="text-sm text-gray-600">
                      by {getTeamMemberName(editingTask.created_by)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditTask}
                disabled={!editingTask.title.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Overview Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black transition-all duration-300 ease-in-out ${isDrawerClosing
              ? 'bg-opacity-0 animate-[fadeOut_0.3s_ease-in-out_forwards]'
              : 'bg-opacity-50 animate-[fadeIn_0.3s_ease-in-out_forwards]'
              }`}
            onClick={user !== 'guest' ? closeDrawer : undefined}
          />

          {/* Drawer */}
          <div
            data-drawer="true"
            className={`absolute right-0 top-0 h-full w-full max-w-sm md:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isDrawerClosing
              ? 'translate-x-full animate-[slideOutRight_0.3s_ease-in-out_forwards]'
              : 'translate-x-0 animate-[slideInRight_0.3s_ease-in-out_forwards]'
              }`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {showPersonalTasks ? 'My Tasks' : 'Task Overview'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {showPersonalTasks ? 'Your personal tasks and assignments' : 'Overdue and high priority tasks'}
                  </p>
                </div>
                <button
                  onClick={user !== 'guest' ? closeDrawer : undefined}
                  className={`p-2 rounded-lg transition-colors ${user !== 'guest'
                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed'
                    }`}
                  disabled={user === 'guest'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Overdue Tasks */}
                {(showPersonalTasks ? getPersonalOverdueTasks() : getOverdueTasks()).length > 0 && (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <h3 className="text-lg font-medium text-gray-900">Overdue Tasks</h3>
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        {showPersonalTasks ? getPersonalOverdueTasks().length : getOverdueTasks().length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {(showPersonalTasks ? getPersonalOverdueTasks() : getOverdueTasks()).map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 bg-red-50 border border-red-200 rounded-lg transition-colors ${user !== 'guest'
                            ? 'cursor-pointer hover:bg-red-100'
                            : 'cursor-default'
                            }`}
                          onClick={user !== 'guest' ? () => {
                            setSelectedTask(ensureCompleteTaskData(task));
                            setShowTaskModal(true);
                            setShowDrawer(false);
                          } : undefined}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                              <div className="flex items-center mt-2 space-x-2">
                                <span className={`text-xs px-2 py-1 rounded ${task.color}`}>
                                  {getTaskCategoryDisplayName(task)}
                                </span>
                                <span className="text-xs text-red-600 font-medium">
                                  {monthNames[task.month]} {task.date}
                                </span>
                              </div>
                            </div>
                            <div className="ml-2">
                              <div className={`w-6 h-6 ${teamMembers.find(m => m.id === task.assignee)?.color} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                                {teamMembers.find(m => m.id === task.assignee)?.avatar}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* High Priority Tasks */}
                {(showPersonalTasks ? getPersonalHighPriorityTasks() : getHighPriorityTasks()).length > 0 && (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      <h3 className="text-lg font-medium text-gray-900">High Priority</h3>
                      <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                        {showPersonalTasks ? getPersonalHighPriorityTasks().length : getHighPriorityTasks().length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {(showPersonalTasks ? getPersonalHighPriorityTasks() : getHighPriorityTasks()).map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 bg-orange-50 border border-orange-200 rounded-lg transition-colors ${user !== 'guest'
                            ? 'cursor-pointer hover:bg-orange-100'
                            : 'cursor-default'
                            }`}
                          onClick={user !== 'guest' ? () => {
                            setSelectedTask(ensureCompleteTaskData(task));
                            setShowTaskModal(true);
                            setShowDrawer(false);
                          } : undefined}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                              <div className="flex items-center mt-2 space-x-2">
                                <span className={`text-xs px-2 py-1 rounded ${task.color}`}>
                                  {getTaskCategoryDisplayName(task)}
                                </span>
                                <span className="text-xs text-orange-600 font-medium">
                                  {monthNames[task.month]} {task.date}
                                </span>
                                <span className="text-xs">🔴</span>
                              </div>
                            </div>
                            <div className="ml-2">
                              <div className={`w-6 h-6 ${teamMembers.find(m => m.id === task.assignee)?.color} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                                {teamMembers.find(m => m.id === task.assignee)?.avatar}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* Empty State */}
                {(showPersonalTasks ? getPersonalOverdueTasks().length === 0 && getPersonalHighPriorityTasks().length === 0 : getOverdueTasks().length === 0 && getHighPriorityTasks().length === 0) && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">✓</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-500 text-sm">
                      {showPersonalTasks
                        ? "No overdue tasks or high priority items assigned to you at the moment."
                        : "No overdue tasks or high priority items at the moment."
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activities Drawer */}
      {showActivitiesDrawer && user !== 'guest' && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black transition-all duration-300 ease-in-out ${isActivitiesDrawerClosing
              ? 'bg-opacity-0 animate-[fadeOut_0.3s_ease-in-out_forwards]'
              : 'bg-opacity-50 animate-[fadeIn_0.3s_ease-in-out_forwards]'
              }`}
            onClick={closeActivitiesDrawer}
          />

          {/* Drawer */}
          <div
            data-drawer="true"
            className={`absolute right-0 top-0 h-full w-full max-w-sm md:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isActivitiesDrawerClosing
              ? 'translate-x-full animate-[slideOutRight_0.3s_ease-in-out_forwards]'
              : 'translate-x-0 animate-[slideInRight_0.3s_ease-in-out_forwards]'
              }`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
                  <p className="text-sm text-gray-500 mt-1">All activities for the past 7 days</p>
                </div>
                <button
                  onClick={closeActivitiesDrawer}
                  className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {getRecentActivities().map((activity) => (
                    <div
                      key={activity.id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={async () => {
                        // Try to find the task by title in all current tasks
                        const allTasksFlat = Object.values(allTasks).flat();
                        const taskTitle = activity.task?.title || activity.message?.replace(/^(Created|Updated) (new )?task: /, '');
                        let completeTask = allTasksFlat.find(t => t.title === taskTitle);

                        // If not found in current tasks, try to fetch it from the database by title
                        if (!completeTask) {
                          try {
                            const { data, error } = await supabase
                              .from('tasks')
                              .select('*')
                              .eq('title', taskTitle)
                              .order('created_at', { ascending: false })
                              .limit(1)
                              .single();

                            if (data && !error) {
                              completeTask = data;
                            }
                          } catch (err) {
                            console.error('Error fetching task by title:', err);
                          }
                        }

                        if (completeTask) {
                          setSelectedTask(ensureCompleteTaskData(completeTask));
                          setShowTaskModal(true);
                          setShowActivitiesDrawer(false);
                        } else {
                          // Show a message that the task is not available
                          showNotification('warning', `Task "${taskTitle}" not found - it may have been deleted or is not currently loaded.`);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded ${activity.type === 'task_created' ? 'bg-green-100 text-green-800' :
                              activity.type === 'task_updated' ? 'bg-blue-100 text-blue-800' :
                                activity.type === 'status_changed' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                              }`}>
                              {activity.type === 'task_created' ? 'Created' :
                                activity.type === 'task_updated' ? 'Updated' :
                                  activity.type === 'status_changed' ? 'Status Changed' : 'Activity'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 text-sm">{activity.message || 'Unknown activity'}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            by {activity.user || 'Unknown User'}
                          </p>
                          {activity.type === 'status_changed' && (
                            <div className="flex items-center mt-2 space-x-2">
                              <span className="text-xs text-gray-500">From:</span>
                              <span className={`text-xs px-2 py-1 rounded ${activity.oldStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                activity.oldStatus === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                {activity.oldStatus}
                              </span>
                              <span className="text-xs text-gray-500">→</span>
                              <span className={`text-xs px-2 py-1 rounded ${activity.newStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                activity.newStatus === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                {activity.newStatus}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {getRecentActivities().length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">📝</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                      <p className="text-gray-500 text-sm">
                        Overdue and high priority tasks will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminders Drawer */}
      {showRemindersDrawer && user !== 'guest' && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${isRemindersDrawerClosing
              ? 'bg-opacity-0 animate-[fadeOut_0.3s_ease-in-out_forwards]'
              : 'bg-opacity-50 animate-[fadeIn_0.3s_ease-in-out_forwards]'
              }`}
            onClick={closeRemindersDrawer}
          />

          {/* Drawer */}
          <div
            data-drawer="true"
            className={`absolute right-0 top-0 h-full w-full max-w-sm md:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isRemindersDrawerClosing
              ? 'translate-x-full animate-[slideOutRight_0.3s_ease-in-out_forwards]'
              : 'translate-x-0 animate-[slideInRight_0.3s_ease-in-out_forwards]'
              }`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Reminders</h2>
                  <p className="text-sm text-gray-500 mt-1">Next 14 days</p>
                </div>
                <button
                  onClick={closeRemindersDrawer}
                  className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Past Reminders */}
                  {dismissedReminders.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Past Reminders</h3>
                      {dismissedReminders.map((reminder) => (
                        <div
                          key={reminder.id}
                          className="p-4 bg-gray-50 border border-gray-200 rounded-lg transition-colors hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleReminderClick(reminder)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm mb-1">{reminder.taskTitle}</h4>
                              <p className="text-xs text-gray-600 mb-2">
                                Due: {reminder.taskDate.toLocaleDateString()}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded">
                                  {reminder.reminderType === '15min' ? '15 min before' :
                                    reminder.reminderType === '30min' ? '30 min before' :
                                      reminder.reminderType === '1hour' ? '1 hour before' :
                                        reminder.reminderType === '2hours' ? '2 hours before' :
                                          reminder.reminderType === '1day' ? '1 day before' :
                                            reminder.reminderType === '2days' ? '2 days before' :
                                              reminder.reminderType === '1week' ? '1 week before' :
                                                'Custom reminder'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {reminder.reminderTime.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-1 ml-3">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await dismissReminder(reminder.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Dismiss"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {reminder.reminderName && (
                            <div className="mt-2 w-full">
                              <span className="block text-xs text-blue-700 font-medium bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg text-center w-full">
                                {reminder.reminderName}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upcoming Reminders */}
                  {upcomingReminders.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Upcoming Reminders</h3>
                      {upcomingReminders.map((reminder) => (
                        <div
                          key={reminder.id}
                          className="p-4 bg-blue-50 border border-blue-200 rounded-lg transition-colors hover:bg-blue-100 cursor-pointer"
                          onClick={() => handleReminderClick(reminder)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm mb-1">{reminder.taskTitle}</h4>
                              <p className="text-xs text-gray-600 mb-2">
                                Due: {reminder.taskDate.toLocaleDateString()}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">
                                  {reminder.reminderType === '15min' ? '15 min before' :
                                    reminder.reminderType === '30min' ? '30 min before' :
                                      reminder.reminderType === '1hour' ? '1 hour before' :
                                        reminder.reminderType === '2hours' ? '2 hours before' :
                                          reminder.reminderType === '1day' ? '1 day before' :
                                            reminder.reminderType === '2days' ? '2 days before' :
                                              reminder.reminderType === '1week' ? '1 week before' :
                                                'Custom reminder'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {reminder.reminderTime.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-1 ml-3">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await dismissReminder(reminder.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Dismiss"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {reminder.reminderName && (
                            <div className="mt-2 w-full">
                              <span className="block text-xs text-blue-700 font-medium bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg text-center w-full">
                                {reminder.reminderName}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* Empty State - Only show if no reminders at all */}
                  {upcomingReminders.length === 0 && dismissedReminders.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">🔔</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders</h3>
                      <p className="text-gray-500 text-sm">
                        Set reminders when creating or editing tasks to see them here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && editingCategory && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-2 md:p-4"
          onClick={() => setShowEditCategoryModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95vw] md:w-[500px] mx-2 md:mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Category</h3>
              <button
                onClick={() => setShowEditCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingCategory.display_name}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Events/webinars"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editingCategory.type}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Blog">Blog</option>
                  <option value="Social">Social</option>
                  <option value="Campaign">Campaign</option>
                  <option value="Email">Email</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setEditingCategory(prev => ({ ...prev, color_class: color.class }))}
                      className={`p-3 rounded-md border-2 ${editingCategory.color_class === color.class
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      title={color.name}
                    >
                      <div className={`w-full h-6 rounded ${color.class} flex items-center justify-center text-xs font-medium`}>
                        {color.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditCategoryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditCategory}
                disabled={!editingCategory.display_name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {showDeleteCategoryModal && categoryToDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-2 md:p-4"
          onClick={() => setShowDeleteCategoryModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95vw] md:w-[500px] mx-2 md:mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Delete Category</h3>
              <button
                onClick={() => setShowDeleteCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.726-1.36 3.491 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Are you sure you want to delete "{categoryToDelete.display_name}"?
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>This action cannot be undone. All tasks using this category will need to be reassigned.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reassign tasks to:
                </label>
                <select
                  value={reassignToCategory}
                  onChange={(e) => setReassignToCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category...</option>
                  {categories
                    .filter(cat => cat.id !== categoryToDelete.id)
                    .map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.display_name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose where to move all tasks currently assigned to this category.
                </p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteCategoryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={!reassignToCategory}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-2 md:p-4"
          onClick={() => setShowEditUserModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95vw] md:w-[500px] mx-2 md:mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Manager, Developer, Designer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingUser.active ? 'active' : 'inactive'}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, active: e.target.value === 'active' }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-yellow-500'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingUser(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full ${color} ${editingUser.color === color
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : 'hover:opacity-80'
                        }`}
                      title={color.replace('bg-', '').replace('-500', '')}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditUserModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditUser}
                disabled={!editingUser.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordChangeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-2 md:p-4"
          onClick={() => setShowPasswordChangeModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95vw] md:w-[400px] mx-2 md:mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordChangeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordChangeForm.newPassword}
                  onChange={(e) => setPasswordChangeForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must contain at least 6 characters with lowercase, uppercase, number, and special character
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordChangeForm.confirmPassword}
                  onChange={(e) => setPasswordChangeForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {passwordChangeError && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {passwordChangeError}
                </div>
              )}

              {passwordChangeSuccess && (
                <div className="text-green-600 text-sm bg-green-50 p-2 rounded">
                  {passwordChangeSuccess}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!passwordChangeForm.newPassword || !passwordChangeForm.confirmPassword}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MMCCalendar; 