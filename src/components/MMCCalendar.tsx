import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, User, Calendar, Clock, UserCheck, Search, Download, Repeat } from 'lucide-react';
import { supabase } from '../supabaseClient';

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
    const endDate = task.recurring_end_date ? new Date(task.recurring_end_date) : new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
    const targetMonthStart = new Date(targetYear, targetMonth, 1);
    const targetMonthEnd = new Date(targetYear, targetMonth + 1, 0);

    // Only generate if the recurring period overlaps with target month
    if (startDate <= targetMonthEnd && endDate >= targetMonthStart) {
      let currentDate = new Date(startDate);
      let instanceCount = 0;
      const maxInstances = task.recurring_end_date ? 12 : 1000; // Higher limit if no end date

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
              parent_task_id: task.id,
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
  console.log('MMCCalendar component is rendering');
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('Calendar');
  const [selectedFilters, setSelectedFilters] = useState({
    blogPosts: true,
    socialMedia: true,
    campaigns: true,
    emailMarketing: true,
    vacations: true
  });
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
  const [allTasks, setAllTasks] = useState<{ [key: string]: any[] }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [dragOverDate, setDragOverDate] = useState<number | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [preSelectedDate, setPreSelectedDate] = useState<{date: number, month: number, year: number} | null>(null);
  const [deletedInstances, setDeletedInstances] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState<'single' | 'all'>('single'); // For recurring task editing
  const [newTask, setNewTask] = useState<any>({
    title: '',
    description: '',
    type: 'Blog',
    category: 'blogPosts',
    date: 1,
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
    time: '09:00',
    assignee: 1,
    status: 'planned',
    priority: 'medium',
    is_recurring: false,
    recurring_pattern: '',
    recurring_interval: 1,
    recurring_unit: 'week',
    recurring_days: [],
    recurring_end_date: '',
    comments: '',
    tags: [],
    created_by: 1,
    is_all_day: false,
    is_multiday: false,
    start_date: '',
    end_date: ''
  });

  const teamMembers = [
    { id: 1, name: 'Courtney Wright', role: 'Social and Digital Engagement Lead', avatar: 'CW', color: 'bg-blue-500', active: true },
    { id: 2, name: 'Ghislain Girard', role: 'Manager, Web Operations', avatar: 'GG', color: 'bg-green-500', active: true },
    { id: 3, name: 'Joy Pavelich', role: 'Executive Vice-President, Strategy and Operations', avatar: 'JP', color: 'bg-purple-500', active: true },
    { id: 4, name: 'Krystle Kung', role: 'Manager, Digital Marketing', avatar: 'KK', color: 'bg-pink-500', active: true },
    { id: 5, name: 'Lori-Anne Thibault', role: 'Bilingual Communications Specialist', avatar: 'LT', color: 'bg-indigo-500', active: true },
    { id: 6, name: 'Meg McLean', role: 'Social and Digital Engagement Lead', avatar: 'MM', color: 'bg-red-500', active: true }
  ];

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
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
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
      return memberFullName.toLowerCase() === fullName.toLowerCase();
    });
    
    if (matchingMember) {
      setLoggedInUserTeamMemberId(matchingMember.id);
      // Don't automatically set selectedTeamMember - let them see all tasks by default
    } else {
      setLoggedInUserTeamMemberId(null);
    }
  };

  // Fetch tasks from Supabase for the current month
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('year', currentDate.getFullYear())
          .eq('month', currentDate.getMonth());
        
        if (error) {
          console.error('Error fetching tasks:', error);
          alert(`Error loading tasks: ${error.message}`);
          return;
        }
        
        console.log('Tasks fetched successfully:', data);
        setAllTasks((prev) => ({ ...prev, [currentMonthKey]: data || [] }));
        
        // Load activities after tasks are loaded
        if (!activitiesLoaded) {
          await loadActivities();
        }
      } catch (err) {
        console.error('Unexpected error fetching tasks:', err);
        alert(`Unexpected error: ${err}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [currentDate, loadActivities, activitiesLoaded]);

  const refreshTasks = async () => {
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
        if (task.is_deleted_instance && task.instance_key) {
          deletedInstanceKeys.add(task.instance_key);
        }
      });
      setDeletedInstances(deletedInstanceKeys);
    } catch (err) {
      console.error('Unexpected error refreshing tasks:', err);
    }
  };

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setAuthError(error.message);
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
      return generateRecurringInstances(allTasksIncludingModified, currentDate.getMonth(), currentDate.getFullYear(), deletedInstances);
    } catch (error) {
      console.error('Error generating recurring instances:', error);
      // Return just the flat tasks as fallback
      return allTasksFlat || [];
    }
  }, [allTasks, currentDate.getMonth(), currentDate.getFullYear(), deletedInstances]);

  const getTasksForDate = useCallback((date: number) => {
    let tasks = allTasksWithRecurring.filter(task => 
      isTaskOnDate(task, date, currentDate.getMonth(), currentDate.getFullYear()) && 
      selectedFilters[task.category] &&
      task.status !== 'deleted' // Exclude deleted tasks
    );
    if (selectedTeamMember) tasks = tasks.filter(task => task.assignee === selectedTeamMember);
    
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
    if (selectedTeamMember) tasks = tasks.filter(task => task.assignee === selectedTeamMember);
    return tasks;
  }, [allTasksWithRecurring, selectedFilters, selectedTeamMember]);

  // Helper functions for drawer content
  const getOverdueTasks = useCallback(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    
    return allTasksWithRecurring.filter(task => {
      if (task.status === 'completed' || task.status === 'deleted') return false;
      
      const taskDate = new Date(task.year, task.month, task.date);
      const todayDate = new Date(currentYear, currentMonth, currentDate);
      
      return taskDate < todayDate;
    }).sort((a, b) => {
      const dateA = new Date(a.year, a.month, a.date);
      const dateB = new Date(b.year, b.month, b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [allTasksWithRecurring]);

  const getHighPriorityTasks = useCallback(() => {
    return allTasksWithRecurring.filter(task => 
      task.priority === 'high' && 
      task.status !== 'completed' && 
      task.status !== 'deleted'
    ).sort((a, b) => {
      const dateA = new Date(a.year, a.month, a.date);
      const dateB = new Date(b.year, b.month, b.date);
      return dateA.getTime() - dateB.getTime();
    });
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

  const getRecentActivities = useCallback(() => {
    // Return the stored recent activities, sorted by timestamp
    return recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  }, [recentActivities]);

  const filterCounts = {
    blogPosts: allTasksWithRecurring.filter(t => t.category === 'blogPosts' && t.status !== 'deleted' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length,
    socialMedia: allTasksWithRecurring.filter(t => t.category === 'socialMedia' && t.status !== 'deleted' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length,
    campaigns: allTasksWithRecurring.filter(t => t.category === 'campaigns' && t.status !== 'deleted' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length,
    emailMarketing: allTasksWithRecurring.filter(t => t.category === 'emailMarketing' && t.status !== 'deleted' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length,
    vacations: allTasksWithRecurring.filter(t => t.category === 'vacations' && t.status !== 'deleted' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length
  };

  const allFilteredTasks = getAllFilteredTasks();
  
  // Filter tasks to only include those for the current month
  const currentMonthFilteredTasks = allFilteredTasks.filter(task => 
    task.month === currentDate.getMonth() && task.year === currentDate.getFullYear()
  );
  
  const upcomingCount = currentMonthFilteredTasks.filter(t => t.status === 'planned').length;
  const inProgressCount = currentMonthFilteredTasks.filter(t => t.status === 'in-progress').length;
  const reviewCount = currentMonthFilteredTasks.filter(t => t.status === 'review').length;
  const completedCount = currentMonthFilteredTasks.filter(t => t.status === 'completed').length;

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
        created_at: completeTask.created_at || null,
        created_by: completeTask.created_by || null,
        description: completeTask.description || 'No description',
        color: completeTask.color || 'bg-gray-100',
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
      description: task.description || 'No description',
      color: task.color || 'bg-gray-100',
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
        alert('Please select a category');
        return;
      }
      if (!newTask.assignee) {
        alert('Please select an assignee');
        return;
      }
      if (!newTask.created_by) {
        alert('Please select who created this task');
        return;
      }
      
      // Clean up date fields - convert empty strings to null for database
      const cleanedTask = { ...newTask };
      if (cleanedTask.start_date === '') cleanedTask.start_date = null;
      if (cleanedTask.end_date === '') cleanedTask.end_date = null;
      if (cleanedTask.recurring_end_date === '') cleanedTask.recurring_end_date = null;
      
      const task = {
        ...cleanedTask,
        color: categoryConfig[newTask.category].color,
        created_by: newTask.created_by
      };
      
      const { data, error } = await supabase.from('tasks').insert([task]).select();
      
      if (error) {
        console.error('Error saving task:', error);
        alert(`Error saving task: ${error.message}`);
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
    } catch (err) {
      console.error('Unexpected error:', err);
      alert(`Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = () => {
    setEditingTask({ 
      ...selectedTask,
      start_date: selectedTask.start_date || '',
      end_date: selectedTask.end_date || '',
      recurring_end_date: selectedTask.recurring_end_date || ''
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
        alert(`Error loading recurring task: ${error.message}`);
        return;
      }
      
      setEditingTask({
        ...data,
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        recurring_end_date: data.recurring_end_date || ''
      });
      setEditMode('all'); // Set to edit all instances
      setShowTaskModal(false);
      setShowEditModal(true);
    } catch (err) {
      console.error('Unexpected error:', err);
      alert(`Unexpected error: ${err}`);
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
    const results = allTasksFlat.filter(task => 
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      task.description.toLowerCase().includes(query.toLowerCase()) ||
      task.type.toLowerCase().includes(query.toLowerCase()) ||
      getTeamMemberName(task.assignee).toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSearchResultClick = (task: any) => {
    setSelectedTask(ensureCompleteTaskData(task));
    setShowTaskModal(true);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
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
        getTeamMemberName(task.assignee),
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

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  const handleSaveEditTask = async () => {
    try {
      setLoading(true);
      
      // Clean up date fields - convert empty strings to null for database
      const cleanedTask = { ...editingTask };
      if (cleanedTask.start_date === '') cleanedTask.start_date = null;
      if (cleanedTask.end_date === '') cleanedTask.end_date = null;
      if (cleanedTask.recurring_end_date === '') cleanedTask.recurring_end_date = null;
      
      const updatedTask = { ...cleanedTask, color: categoryConfig[editingTask.category].color };
      
      const isRecurring = editingTask.is_recurring || editingTask.is_recurring_instance;
      
      if (isRecurring && editMode === 'single') {
        // For single instance editing of recurring tasks, create a modified instance record
        const instanceKey = editingTask.instance_key || `${editingTask.parent_task_id || editingTask.id}_${editingTask.year}_${editingTask.month}_${editingTask.date}`;
        
        // Create a "modified" task record to override this specific instance
        const modifiedInstance = {
          ...updatedTask,
          // Remove id field entirely - let database auto-generate
          parent_task_id: editingTask.parent_task_id || editingTask.id,
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
            alert(`Error updating task: ${error.message}`);
            return;
          }
        } else {
          // Create new modified instance
          const { error } = await supabase
            .from('tasks')
            .insert([modifiedInstance]);
          
          if (error) {
            console.error('Error creating modified instance:', error);
            alert(`Error updating task: ${error.message}`);
            return;
          }
        }
      } else {
        // For regular tasks or editing all recurring instances
        const taskIdToUpdate = editingTask.is_recurring_instance ? editingTask.parent_task_id : editingTask.id;
        
        const { data, error } = await supabase.from('tasks').update(updatedTask).eq('id', taskIdToUpdate);
        
        if (error) {
          console.error('Error updating task:', error);
          alert(`Error updating task: ${error.message}`);
          return;
        }
      }
      
      console.log('Task updated successfully');
      
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
    } catch (err) {
      console.error('Unexpected error:', err);
      alert(`Unexpected error: ${err}`);
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
              alert(`Error deleting recurring task: ${result.error.message}`);
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
              alert(`Error deleting task instance: ${result.error.message}`);
              return;
            }
            
            // Update local deletedInstances state
            setDeletedInstances(prev => new Set([...prev, instanceKey]));
          }
          
          console.log('Task deleted successfully:', data);
          setShowTaskModal(false);
          setSelectedTask(null);
          await refreshTasks();
        } catch (err) {
          console.error('Unexpected error:', err);
          alert(`Unexpected error: ${err}`);
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
            alert(`Error deleting task: ${result.error.message}`);
            return;
          }
          
          console.log('Task deleted successfully:', result.data);
          setShowTaskModal(false);
          setSelectedTask(null);
          await refreshTasks();
        } catch (err) {
          console.error('Unexpected error:', err);
          alert(`Unexpected error: ${err}`);
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
              <div className={`text-sm text-center ${
                resetMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
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
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isSignUp ? 'bg-gray-100 cursor-not-allowed' : ''
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
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isSignUp ? 'bg-gray-100 cursor-not-allowed' : ''
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
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isSignUp ? 'bg-gray-100 cursor-not-allowed' : ''
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
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isSignUp ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                    />
            </div>
            
            {authError && (
              <div className="text-red-600 text-sm text-center">
                {authError}
              </div>
            )}
            
                  <button
                    type="submit"
                    disabled={isSignUp}
                    className={`w-full py-2 px-4 rounded-md transition-colors ${
                      isSignUp 
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
    { id: 'planned', title: 'Planned', color: 'bg-green-50' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-50' },
    { id: 'review', title: 'Review', color: 'bg-orange-50' },
    { id: 'completed', title: 'Completed', color: 'bg-blue-50' }
  ];

  const getTasksByStatus = (status: string) => {
    const tasks = getAllFilteredTasks().filter(task => task.status === status);
    
    
    return tasks;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${
        isMobile 
          ? `fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'w-64'
      } bg-white border-r border-gray-200 flex flex-col min-h-screen ${
        user === 'guest' ? 'pointer-events-none opacity-60' : ''
      }`}>
        <div className="p-4 flex-1">
          <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
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
        {/* Monthly Overview */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Monthly Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{upcomingCount}</div>
              <div className="text-xs text-gray-600">Upcoming</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-600">{inProgressCount}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-600">{reviewCount}</div>
              <div className="text-xs text-gray-600">Under Review</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
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
            {[
              { key: 'blogPosts', label: 'Blog Posts', count: filterCounts.blogPosts },
              { key: 'socialMedia', label: 'Social Media', count: filterCounts.socialMedia },
              { key: 'campaigns', label: 'Campaigns', count: filterCounts.campaigns },
              { key: 'emailMarketing', label: 'Email Marketing', count: filterCounts.emailMarketing },
              { key: 'vacations', label: 'Vacations', count: filterCounts.vacations }
            ].map(filter => (
              <label key={filter.key} className={`flex items-center space-x-2 ${
                user !== 'guest' ? 'cursor-pointer' : 'cursor-default'
              }`}>
                <input
                  type="checkbox"
                  checked={selectedFilters[filter.key]}
                  onChange={user !== 'guest' ? () => toggleFilter(filter.key) : undefined}
                  disabled={user === 'guest'}
                  className="rounded border-gray-300"
                />
                <div className="flex items-center space-x-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${
                    filter.key === 'blogPosts' ? 'bg-blue-500' :
                    filter.key === 'socialMedia' ? 'bg-green-500' :
                    filter.key === 'campaigns' ? 'bg-purple-500' :
                    filter.key === 'emailMarketing' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-sm text-gray-700">{filter.label}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  filter.key === 'blogPosts' ? 'bg-blue-100 text-blue-800' :
                  filter.key === 'socialMedia' ? 'bg-green-100 text-green-800' :
                  filter.key === 'campaigns' ? 'bg-purple-100 text-purple-800' :
                  filter.key === 'emailMarketing' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {filter.count}
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
              className={`flex items-center space-x-3 p-2 rounded-lg ${
                user !== 'guest' ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
              } ${
                selectedTeamMember === null ? 'bg-blue-50 border border-blue-200' : ''
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
                className={`flex items-center space-x-3 p-2 rounded-lg ${
                  user !== 'guest' ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                } ${
                  selectedTeamMember === member.id ? 'bg-blue-50 border border-blue-200' : ''
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
        {/* Past Due Events */}
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-medium text-gray-900">Overdue Tasks</h3>
            {getOverdueTasks().length > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                {getOverdueTasks().length}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {getOverdueTasks().slice(0, 3).map(task => (
              <div 
                key={task.id} 
                className={`p-3 bg-red-50 border border-red-200 rounded-lg transition-colors ${
                  user !== 'guest' ? 'cursor-pointer hover:bg-red-100' : 'cursor-default'
                }`}
                onClick={user !== 'guest' ? () => {
                  setSelectedTask(ensureCompleteTaskData(task));
                  setShowTaskModal(true);
                } : undefined}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {task.type}
                      </span>
                      <span className="text-xs text-red-600 font-medium">
                        {monthNames[task.month]} {task.date}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium ml-2">
                    {teamMembers.find(m => m.id === task.created_by)?.avatar || '?'}
                  </div>
                </div>
              </div>
            ))}
            {getOverdueTasks().length === 0 && (
              <div className="text-center py-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div className="text-xs text-gray-500">No overdue tasks</div>
              </div>
            )}
          </div>
        </div>

        {/* High Priority Tasks */}
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-medium text-gray-900">High Priority</h3>
            {getHighPriorityTasks().length > 0 && (
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                {getHighPriorityTasks().length}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {getHighPriorityTasks().slice(0, 3).map(task => (
              <div 
                key={task.id} 
                className={`p-3 bg-orange-50 border border-orange-200 rounded-lg transition-colors ${
                  user !== 'guest' ? 'cursor-pointer hover:bg-orange-100' : 'cursor-default'
                }`}
                onClick={user !== 'guest' ? () => {
                  setSelectedTask(ensureCompleteTaskData(task));
                  setShowTaskModal(true);
                } : undefined}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {task.type}
                      </span>
                      <span className="text-xs text-orange-600 font-medium">
                        {monthNames[task.month]} {task.date}
                      </span>
                      <span className="text-xs">🔴</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium ml-2">
                    {teamMembers.find(m => m.id === task.created_by)?.avatar || '?'}
                  </div>
                </div>
              </div>
            ))}
            {getHighPriorityTasks().length === 0 && (
              <div className="text-center py-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div className="text-xs text-gray-500">No high priority tasks</div>
              </div>
            )}
          </div>
        </div>

        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-2 md:px-6 py-2 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button 
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </button>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Drawer Toggle Button */}
              <button
                onClick={user !== 'guest' ? () => setShowDrawer(!showDrawer) : undefined}
                className={`relative p-2 rounded-lg transition-colors ${
                  user !== 'guest' 
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
                {(getOverdueTasks().length > 0 || getHighPriorityTasks().length > 0) && (
                  <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full flex items-center justify-center px-1">
                    <span className="text-xs text-white font-bold">
                      {getOverdueTasks().length + getHighPriorityTasks().length}
                    </span>
                  </div>
                )}
              </button>
              
              {/* Search Box - Hidden on mobile, shown on desktop */}
              <div className="relative search-container hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={user !== 'guest' ? (e) => handleSearch(e.target.value) : undefined}
                    onFocus={user !== 'guest' ? () => searchQuery && setShowSearchResults(true) : undefined}
                    disabled={user === 'guest'}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
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
                            {task.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {monthNames[task.month || currentDate.getMonth()]} {task.date}, {task.year || currentDate.getFullYear()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getTeamMemberName(task.assignee)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* No Results Message */}
                {showSearchResults && searchResults.length === 0 && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
                    <div className="text-gray-500 text-sm">No tasks found matching "{searchQuery}"</div>
                  </div>
                )}
              </div>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-md ${
                    activeView === 'Calendar' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveView('Calendar')}
                >
                  <span className="hidden sm:inline">Calendar</span>
                  <span className="sm:hidden">Cal</span>
                </button>
                <button
                  className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-md ${
                    activeView === 'Kanban' 
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
                  className="flex items-center space-x-1 md:space-x-2 bg-blue-600 text-white px-2 md:px-4 py-2 rounded-lg hover:bg-blue-700"
                  onClick={handleNewEntry}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Entry</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}
              
              <div className="flex items-center space-x-1 md:space-x-2">
                {user && user !== 'guest' && (
                  <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">
                    Hi, {user.user_metadata?.first_name || user.email?.split('@')[0]}
                  </span>
                )}
                {user && user !== 'guest' && (
                  <span className="text-xs text-gray-600 sm:hidden">
                    {user.user_metadata?.first_name || user.email?.split('@')[0]}
                  </span>
                )}
                <button 
                  className="flex items-center space-x-1 md:space-x-2 bg-gray-100 text-gray-700 px-2 md:px-4 py-2 rounded-lg hover:bg-gray-200"
                  onClick={handleSignOut}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user === 'guest' ? 'Exit' : 'Logout'}</span>
                </button>
              </div>
              
              

              {/* Export Dropdown */}
              <div className="relative export-container">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="Export data"
                >
                  <Download className="w-5 h-5" />
                </button>
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
        <div className="flex-1 p-2 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
          ) : activeView === 'Calendar' ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {daysOfWeek.map(day => (
                  <div key={day} className="p-2 md:p-4 text-center text-xs md:text-sm font-medium text-gray-500 border-r border-gray-200 last:border-r-0">
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
                    className={`border-r border-b border-gray-200 last:border-r-0 p-1 md:p-2 min-h-[80px] md:min-h-[120px] relative cursor-pointer hover:bg-gray-50 ${
                      dragOverDate === day ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    onClick={day && user !== 'guest' ? () => handleDayClick(day) : undefined}
                    onDragOver={day && user !== 'guest' ? (e) => handleCalendarDragOver(e, day) : undefined}
                    onDragLeave={day && user !== 'guest' ? handleCalendarDragLeave : undefined}
                    onDrop={day && user !== 'guest' ? (e) => handleCalendarDrop(e, day) : undefined}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-2 ${
                          day === today && isCurrentMonth ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {/* Multi-day tasks as continuous bars at the top */}
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
                                className={`h-6 ${task.color} cursor-pointer hover:opacity-80 relative flex items-center border-t-2 ${
                                  task.status === 'completed' ? 'opacity-50' : ''
                                } ${draggedTask?.id === task.id ? 'opacity-50' : ''} rounded-none`}
                                onClick={user !== 'guest' ? (e) => {
                                  e.stopPropagation();
                                  handleTaskClick(task);
                                } : undefined}
                                title={`${task.title}${isStart ? ' (Start)' : isEnd ? ' (End)' : ''}`}
                                style={{
                                  marginLeft: isStart ? '0' : '-1px',
                                  marginRight: isEnd ? '0' : '-1px',
                                  zIndex: 10
                                }}
                              >
                                <div className="flex items-center justify-center w-full px-2">
                                  <div className="text-xs font-medium truncate text-center">
                                    {task.title}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Regular tasks */}
                          {getTasksForDate(day).filter(task => !task.is_multiday).map((task, index) => {
                            // Check for time conflicts
                            const hasTimeConflict = !task.is_all_day && getTasksForDate(day).filter(t => 
                              !t.is_all_day && !t.is_multiday && t.time === task.time && t.id !== task.id
                            ).length > 0;
                            
                            return (
                              <div
                                key={task.id}
                                className={`text-xs p-1 md:p-2 rounded border ${task.color} cursor-move hover:shadow-sm relative ${
                                  task.status === 'completed' ? 'opacity-75' : ''
                                } ${draggedTask?.id === task.id ? 'opacity-50' : ''} ${
                                  task.is_all_day ? 'border-2 border-dashed border-gray-400 bg-opacity-50' : ''
                                } ${hasTimeConflict ? 'border-l-4 border-l-red-400' : ''}`}
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
                              <div className="flex items-center justify-between">
                                <div className={`font-medium truncate ${
                                  task.status === 'completed' ? 'text-gray-500' : ''
                                }`}>{task.title}</div>
                                <div className="flex items-center space-x-1">
                                  {task.is_recurring && (
                                    <Repeat className="w-3 h-3 text-blue-500" />
                                  )}
                                  {task.priority && task.priority !== 'medium' && (
                                    <span className="text-xs ml-1">
                                      {priorityConfig[task.priority]?.icon || '🟡'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className={`${
                                task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                              }`}>{task.type}</div>
                              {task.is_all_day ? (
                                <div className={`${
                                  task.status === 'completed' ? 'text-gray-400' : 'text-gray-500'
                                }`}>All Day</div>
                              ) : task.time && (
                                <div className={`${
                                  task.status === 'completed' ? 'text-gray-400' : 'text-gray-500'
                                }`}>{task.time}</div>
                              )}
                              {task.tags && task.tags.length > 0 && (
                                <div className="absolute bottom-1 right-1 hidden sm:flex flex-wrap gap-1">
                                  {task.tags.slice(0, 2).map((tag: string, index: number) => (
                                    <span
                                      key={index}
                                      className="text-[10px] bg-gray-50 text-gray-600 px-1 py-0.5 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {task.tags.length > 2 && (
                                    <span className="text-[10px] text-gray-500">+{task.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            );
                          })}
                        </div>
                        {day === today && isCurrentMonth && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Kanban View */
            <div className="h-full">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 h-full">
                {kanbanColumns.map(column => (
                  <div 
                    key={column.id} 
                    className={`${column.color} rounded-lg p-4`}
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
                          className={`bg-white p-4 rounded-lg shadow-sm border cursor-move hover:shadow-md transition-shadow ${
                            draggedTask?.id === task.id ? 'opacity-50' : ''
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
                          </div>
                          <div className="text-sm text-gray-600 mb-3">{task.description}</div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs px-2 py-1 rounded ${task.color}`}>
                              {task.type}
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
                            <div className={`w-6 h-6 ${teamMembers.find(m => m.id === task.assignee)?.color} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                              {teamMembers.find(m => m.id === task.assignee)?.avatar}
                            </div>
                            <span className="text-xs text-gray-600">
                              {getTeamMemberName(task.assignee)}
                            </span>
                          </div>
                          {task.tags && task.tags.length > 0 && (
                            <div className="hidden sm:flex flex-wrap gap-1 mt-2">
                              {task.tags.slice(0, 3).map((tag: string, index: number) => (
                                <span
                                  key={index}
                                  className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded"
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
          )}
        </div>
      </div>
      {/* New Entry Modal */}
      {showNewEntryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 md:p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95vw] md:w-[800px] mx-2 md:mx-4 max-h-[90vh] overflow-y-auto">
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
                    max="2030"
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
                          date: e.target.value ? new Date(e.target.value).getDate() : prev.date,
                          month: e.target.value ? new Date(e.target.value).getMonth() : prev.month,
                          year: e.target.value ? new Date(e.target.value).getFullYear() : prev.year
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
                  <select
                    value={newTask.category || ''}
                    onChange={(e) => setNewTask((prev: any) => ({ 
                      ...prev, 
                      category: e.target.value,
                      type: categoryConfig[e.target.value].type
                    }))}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="blogPosts">Blog Posts</option>
                    <option value="socialMedia">Social Media</option>
                    <option value="campaigns">Campaigns</option>
                    <option value="emailMarketing">Email Marketing</option>
                    <option value="vacations">Vacations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <select
                    value={newTask.assignee || ''}
                    onChange={(e) => setNewTask((prev: any) => ({ ...prev, assignee: e.target.value ? parseInt(e.target.value) : null }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Assignee</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
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
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    user && user !== 'guest' ? 'bg-gray-100 cursor-not-allowed' : ''
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
                      onChange={(e) => setNewTask((prev: any) => ({ 
                        ...prev, 
                        is_recurring: e.target.checked,
                        recurring_pattern: e.target.checked ? prev.recurring_pattern || 'weekly' : '',
                        recurring_end_date: e.target.checked ? prev.recurring_end_date : null
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_recurring" className="text-sm text-gray-700">
                      Make this task recurring
                    </label>
                  </div>
                  
                  {newTask.is_recurring && (
                    <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Repeat every</label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={newTask.recurring_interval}
                            onChange={(e) => setNewTask((prev: any) => ({ 
                              ...prev, 
                              recurring_interval: parseInt(e.target.value) || 1
                            }))}
                            className="w-16 border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            value={newTask.recurring_unit}
                            onChange={(e) => setNewTask((prev: any) => ({ 
                              ...prev, 
                              recurring_unit: e.target.value
                            }))}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="day">day(s)</option>
                            <option value="week">week(s)</option>
                            <option value="month">month(s)</option>
                            <option value="year">year(s)</option>
                            <option value="first_day_of_month">first [day] of month</option>
                            <option value="2nd_day_of_month">2nd [day] of month</option>
                            <option value="3rd_day_of_month">3rd [day] of month</option>
                            <option value="4th_day_of_month">4th [day] of month</option>
                            <option value="last_day_of_month">last [day] of month</option>
                          </select>
                        </div>
                      </div>
                      
                      {newTask.recurring_unit === 'week' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Repeat on days</label>
                          <div className="flex space-x-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
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
                                className={`w-8 h-8 rounded-full text-xs font-medium ${
                                  (newTask.recurring_days || []).includes(index)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {day[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(newTask.recurring_unit === 'first_day_of_month' || newTask.recurring_unit === '2nd_day_of_month' || newTask.recurring_unit === '3rd_day_of_month' || newTask.recurring_unit === '4th_day_of_month' || newTask.recurring_unit === 'last_day_of_month') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Select day of week</label>
                          <div className="flex space-x-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  setNewTask((prev: any) => ({ 
                                    ...prev, 
                                    recurring_days: [index] // Only one day for first/last patterns
                                  }));
                                }}
                                className={`w-8 h-8 rounded-full text-xs font-medium ${
                                  (newTask.recurring_days || []).includes(index)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {day[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End date (optional)</label>
                        <input
                          type="date"
                          value={newTask.recurring_end_date || ''}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={newTask.tags?.join(', ') || ''}
                  onChange={(e) => setNewTask((prev: any) => ({ 
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
                  <label className="block text-xs font-medium text-gray-500 mb-1">TYPE</label>
                  <span className={`text-xs px-2 py-1 rounded ${selectedTask.color || 'bg-gray-100'}`}>
                    {selectedTask.type || 'General'}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">STATUS</label>
                  <span className={`text-xs px-2 py-1 rounded capitalize ${
                    selectedTask.status === 'completed' ? 'bg-blue-100 text-blue-800' :
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
                  {selectedTask.assignee ? (
                    <>
                      <div className={`w-6 h-6 ${teamMembers.find(m => m.id === selectedTask.assignee)?.color || 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                        {teamMembers.find(m => m.id === selectedTask.assignee)?.avatar || '?'}
                      </div>
                      <span className="text-sm text-gray-900">
                        {getTeamMemberName(selectedTask.assignee)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 md:p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95vw] md:w-[800px] mx-2 md:mx-4 max-h-[90vh] overflow-y-auto">
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
                    max="2030"
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
                          date: e.target.value ? new Date(e.target.value).getDate() : prev.date,
                          month: e.target.value ? new Date(e.target.value).getMonth() : prev.month,
                          year: e.target.value ? new Date(e.target.value).getFullYear() : prev.year
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
                      type: categoryConfig[e.target.value].type
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="blogPosts">Blog Posts</option>
                    <option value="socialMedia">Social Media</option>
                    <option value="campaigns">Campaigns</option>
                    <option value="emailMarketing">Email Marketing</option>
                    <option value="vacations">Vacations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <select
                    value={editingTask.assignee}
                    onChange={(e) => setEditingTask((prev: any) => ({ ...prev, assignee: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
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
                      onChange={(e) => setEditingTask((prev: any) => ({ 
                        ...prev, 
                        is_recurring: e.target.checked,
                        recurring_pattern: e.target.checked ? prev.recurring_pattern || 'weekly' : '',
                        recurring_end_date: e.target.checked ? prev.recurring_end_date : null
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit_is_recurring" className="text-sm text-gray-700">
                      Make this task recurring
                    </label>
                  </div>
                  
                  {(editingTask.is_recurring || false) && (
                    <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Repeat every</label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={editingTask.recurring_interval || 1}
                            onChange={(e) => setEditingTask((prev: any) => ({ 
                              ...prev, 
                              recurring_interval: parseInt(e.target.value) || 1
                            }))}
                            className="w-16 border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            value={editingTask.recurring_unit || 'week'}
                            onChange={(e) => setEditingTask((prev: any) => ({ 
                              ...prev, 
                              recurring_unit: e.target.value
                            }))}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="day">day(s)</option>
                            <option value="week">week(s)</option>
                            <option value="month">month(s)</option>
                            <option value="year">year(s)</option>
                            <option value="first_day_of_month">first [day] of month</option>
                            <option value="2nd_day_of_month">2nd [day] of month</option>
                            <option value="3rd_day_of_month">3rd [day] of month</option>
                            <option value="4th_day_of_month">4th [day] of month</option>
                            <option value="last_day_of_month">last [day] of month</option>
                          </select>
                        </div>
                      </div>
                      
                      {(editingTask.recurring_unit || 'week') === 'week' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Repeat on days</label>
                          <div className="flex space-x-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
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
                                className={`w-8 h-8 rounded-full text-xs font-medium ${
                                  (editingTask.recurring_days || []).includes(index)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {day[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {((editingTask.recurring_unit || 'week') === 'first_day_of_month' || (editingTask.recurring_unit || 'week') === '2nd_day_of_month' || (editingTask.recurring_unit || 'week') === '3rd_day_of_month' || (editingTask.recurring_unit || 'week') === '4th_day_of_month' || (editingTask.recurring_unit || 'week') === 'last_day_of_month') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Select day of week</label>
                          <div className="flex space-x-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  setEditingTask((prev: any) => ({ 
                                    ...prev, 
                                    recurring_days: [index] // Only one day for first/last patterns
                                  }));
                                }}
                                className={`w-8 h-8 rounded-full text-xs font-medium ${
                                  (editingTask.recurring_days || []).includes(index)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {day[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End date (optional)</label>
                        <input
                          type="date"
                          value={editingTask.recurring_end_date || ''}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={editingTask.tags?.join(', ') || ''}
                  onChange={(e) => setEditingTask((prev: any) => ({ 
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
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={user !== 'guest' ? () => setShowDrawer(false) : undefined}
          />
          
          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Task Overview</h2>
                <button
                  onClick={user !== 'guest' ? () => setShowDrawer(false) : undefined}
                  className={`p-2 rounded-lg transition-colors ${
                    user !== 'guest' 
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
                {getOverdueTasks().length > 0 && (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <h3 className="text-lg font-medium text-gray-900">Overdue Tasks</h3>
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        {getOverdueTasks().length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {getOverdueTasks().slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 bg-red-50 border border-red-200 rounded-lg transition-colors ${
                            user !== 'guest' 
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
                                  {task.type}
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
                {getHighPriorityTasks().length > 0 && (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      <h3 className="text-lg font-medium text-gray-900">High Priority</h3>
                      <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                        {getHighPriorityTasks().length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {getHighPriorityTasks().slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 bg-orange-50 border border-orange-200 rounded-lg transition-colors ${
                            user !== 'guest' 
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
                                  {task.type}
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

                {/* Recent Activities */}
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
                  </div>
                  <div className="space-y-3">
                    {getRecentActivities().slice(0, 5).map((activity) => (
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
                            setShowDrawer(false);
                          } else {
                            // Show a message that the task is not available
                            alert(`Task "${taskTitle}" not found - it may have been deleted or is not currently loaded.`);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`text-xs px-2 py-1 rounded ${
                                activity.type === 'task_created' ? 'bg-green-100 text-green-800' :
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
                                <span className={`text-xs px-2 py-1 rounded ${
                                  activity.oldStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                  activity.oldStatus === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {activity.oldStatus}
                                </span>
                                <span className="text-xs text-gray-500">→</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  activity.newStatus === 'completed' ? 'bg-green-100 text-green-800' :
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
                      <div className="text-center py-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-gray-400 text-sm">📝</span>
                        </div>
                        <div className="text-xs text-gray-500">No recent activities</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Empty State */}
                {getOverdueTasks().length === 0 && getHighPriorityTasks().length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">✓</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-500 text-sm">No overdue tasks or high priority items at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MMCCalendar; 