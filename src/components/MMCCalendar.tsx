import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, User, Calendar, Clock, UserCheck, Search, Download } from 'lucide-react';
import { supabase } from '../supabaseClient';

const MMCCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('Calendar');
  const [selectedFilters, setSelectedFilters] = useState({
    blogPosts: true,
    socialMedia: true,
    campaigns: true,
    emailMarketing: true
  });
  const [selectedTeamMember, setSelectedTeamMember] = useState<number | null>(null);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [allTasks, setAllTasks] = useState<{ [key: string]: any[] }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [dragOverDate, setDragOverDate] = useState<number | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [preSelectedDate, setPreSelectedDate] = useState<{date: number, month: number, year: number} | null>(null);
  const [recurringCache, setRecurringCache] = useState<{[key: string]: any[]}>({});
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
    recurring_end_date: null,
    comments: ''
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
    emailMarketing: { color: 'bg-orange-100 text-orange-800 border-orange-200', type: 'Email' }
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
      } catch (err) {
        console.error('Unexpected error fetching tasks:', err);
        alert(`Unexpected error: ${err}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [currentDate]);

  const refreshTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('year', currentDate.getFullYear())
        .eq('month', currentDate.getMonth());
      
      if (error) {
        console.error('Error refreshing tasks:', error);
        return;
      }
      
      setAllTasks((prev) => ({ ...prev, [currentMonthKey]: data || [] }));
    } catch (err) {
      console.error('Unexpected error refreshing tasks:', err);
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

  const getTasksForDate = (date: number) => {
    const tasksWithRecurring = generateRecurringForMonth(currentMonthTasks, currentDate.getMonth(), currentDate.getFullYear());
    let tasks = tasksWithRecurring.filter(task => task.date === date && selectedFilters[task.category]);
    if (selectedTeamMember) tasks = tasks.filter(task => task.assignee === selectedTeamMember);
    return tasks;
  };

  const getAllFilteredTasks = () => {
    const tasksWithRecurring = generateRecurringForMonth(currentMonthTasks, currentDate.getMonth(), currentDate.getFullYear());
    let tasks = tasksWithRecurring.filter(task => selectedFilters[task.category]);
    if (selectedTeamMember) tasks = tasks.filter(task => task.assignee === selectedTeamMember);
    return tasks;
  };

  const allTasksWithRecurring = generateRecurringForMonth(currentMonthTasks, currentDate.getMonth(), currentDate.getFullYear());

  const filterCounts = {
    blogPosts: allTasksWithRecurring.filter(t => t.category === 'blogPosts' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length,
    socialMedia: allTasksWithRecurring.filter(t => t.category === 'socialMedia' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length,
    campaigns: allTasksWithRecurring.filter(t => t.category === 'campaigns' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length,
    emailMarketing: allTasksWithRecurring.filter(t => t.category === 'emailMarketing' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length
  };

  const allFilteredTasks = getAllFilteredTasks();
  const upcomingCount = allFilteredTasks.filter(t => t.status === 'planned').length;
  const inProgressCount = allFilteredTasks.filter(t => t.status === 'in-progress').length;
  const reviewCount = allFilteredTasks.filter(t => t.status === 'review').length;
  const completedCount = allFilteredTasks.filter(t => t.status === 'completed').length;

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleTeamMemberClick = (memberId: number) => {
    setSelectedTeamMember(selectedTeamMember === memberId ? null : memberId);
  };

  const handleNewEntry = () => {
    setPreSelectedDate(null);
    setNewTask({
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
      comments: ''
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
      category: 'blogPosts',
      date: day,
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      time: '09:00',
      assignee: 1,
      status: 'planned',
      priority: 'medium',
      comments: ''
    });
    setShowNewEntryModal(true);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleSaveNewTask = async () => {
    try {
      setLoading(true);
      const task = {
        ...newTask,
        color: categoryConfig[newTask.category].color
      };
      
      const { data, error } = await supabase.from('tasks').insert([task]);
      
      if (error) {
        console.error('Error saving task:', error);
        alert(`Error saving task: ${error.message}`);
        return;
      }
      
      console.log('Task saved successfully:', data);
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
    setEditingTask({ ...selectedTask });
    setShowTaskModal(false);
    setShowEditModal(true);
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
    setSelectedTask(task);
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


  // Custom categories functionality
  const addCustomCategory = () => {
    if (newCategoryName.trim() && !customCategories.includes(newCategoryName.trim())) {
      setCustomCategories([...customCategories, newCategoryName.trim()]);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };


  const removeCustomCategory = (category: string) => {
    setCustomCategories(customCategories.filter(c => c !== category));
  };

  // Simple recurring instance generator - isolated function
  const generateRecurringForMonth = (tasks: any[], month: number, year: number) => {
    const cacheKey = `${month}-${year}`;
    
    // Check cache first
    if (recurringCache[cacheKey]) {
      return recurringCache[cacheKey];
    }

    const instances: any[] = [];
    
    tasks.forEach(task => {
      if (!task.is_recurring || !task.recurring_pattern) {
        instances.push(task);
        return;
      }

      const startDate = new Date(task.year, task.month, task.date);
      const endDate = task.recurring_end_date ? new Date(task.recurring_end_date) : new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
      const targetMonthStart = new Date(year, month, 1);
      const targetMonthEnd = new Date(year, month + 1, 0);

      // Only generate if the recurring period overlaps with target month
      if (startDate <= targetMonthEnd && endDate >= targetMonthStart) {
        let currentDate = new Date(startDate);
        let instanceCount = 0;
        const maxInstances = 12; // Limit to prevent infinite loops

        while (currentDate <= endDate && instanceCount < maxInstances) {
          // Check if this instance falls within the target month
          if (currentDate.getMonth() === month && currentDate.getFullYear() === year) {
            const newInstance = {
              ...task,
              id: `${task.id}_${currentDate.getFullYear()}_${currentDate.getMonth()}_${currentDate.getDate()}`,
              date: currentDate.getDate(),
              month: currentDate.getMonth(),
              year: currentDate.getFullYear(),
              parent_task_id: task.id,
              is_recurring: false
            };
            instances.push(newInstance);
          }

          // Calculate next occurrence
          let nextDate: Date;
          switch (task.recurring_pattern) {
            case 'daily':
              nextDate = new Date(currentDate);
              nextDate.setDate(currentDate.getDate() + 1);
              break;
            case 'weekly':
              nextDate = new Date(currentDate);
              nextDate.setDate(currentDate.getDate() + 7);
              break;
            case 'monthly':
              nextDate = new Date(currentDate);
              nextDate.setMonth(currentDate.getMonth() + 1);
              break;
            default:
              nextDate = new Date(currentDate);
              nextDate.setDate(currentDate.getDate() + 1);
          }

          currentDate = nextDate;
          instanceCount++;
        }
      } else {
        // If not recurring or doesn't overlap, just add the original task
        instances.push(task);
      }
    });

    // Cache the result
    setRecurringCache(prev => ({ ...prev, [cacheKey]: instances }));
    return instances;
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

  const handleSaveEditTask = async () => {
    try {
      setLoading(true);
      const updatedTask = { ...editingTask, color: categoryConfig[editingTask.category].color };
      
      const { data, error } = await supabase.from('tasks').update(updatedTask).eq('id', editingTask.id);
      
      if (error) {
        console.error('Error updating task:', error);
        alert(`Error updating task: ${error.message}`);
        return;
      }
      
      console.log('Task updated successfully:', data);
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

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('tasks').delete().eq('id', selectedTask.id);
        
        if (error) {
          console.error('Error deleting task:', error);
          alert(`Error deleting task: ${error.message}`);
          return;
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

  // Kanban columns
  const kanbanColumns = [
    { id: 'planned', title: 'Planned', color: 'bg-green-50' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-50' },
    { id: 'review', title: 'Review', color: 'bg-orange-50' },
    { id: 'completed', title: 'Completed', color: 'bg-blue-50' }
  ];

  const getTasksByStatus = (status: string) => {
    return getAllFilteredTasks().filter(task => task.status === status);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/atlas-logo.png" 
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
              { key: 'emailMarketing', label: 'Email Marketing', count: filterCounts.emailMarketing }
            ].map(filter => (
              <label key={filter.key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFilters[filter.key]}
                  onChange={() => toggleFilter(filter.key)}
                  className="rounded border-gray-300"
                />
                <div className="flex items-center space-x-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${
                    filter.key === 'blogPosts' ? 'bg-blue-500' :
                    filter.key === 'socialMedia' ? 'bg-green-500' :
                    filter.key === 'campaigns' ? 'bg-purple-500' :
                    'bg-orange-500'
                  }`}></div>
                  <span className="text-sm text-gray-700">{filter.label}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  filter.key === 'blogPosts' ? 'bg-blue-100 text-blue-800' :
                  filter.key === 'socialMedia' ? 'bg-green-100 text-green-800' :
                  filter.key === 'campaigns' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {filter.count}
                </span>
              </label>
            ))}
          </div>
        </div>
        {/* Team Members */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Team Members</h3>
          
          
          <div className="space-y-3">
            {teamMembers.map(member => (
              <div 
                key={member.id} 
                className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 ${
                  selectedTeamMember === member.id ? 'bg-blue-50 border border-blue-200' : ''
                }`}
                onClick={() => handleTeamMemberClick(member.id)}
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
        {/* Recent Activity */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {allFilteredTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-start space-x-2">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  task.status === 'completed' ? 'bg-blue-500' :
                  task.status === 'in-progress' ? 'bg-yellow-500' : 
                  task.status === 'review' ? 'bg-orange-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900">{task.title}</div>
                  <div className="text-xs text-gray-500">
                    {task.status === 'completed' ? 'completed' : 
                     task.status === 'in-progress' ? 'in progress' :
                     task.status === 'review' ? 'ready for review' : 'planned'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
            <div className="flex items-center space-x-4">
              {/* Search Box */}
              <div className="relative search-container">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
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
                  className={`px-3 py-1 text-sm rounded-md ${
                    activeView === 'Calendar' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveView('Calendar')}
                >
                  Calendar
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md ${
                    activeView === 'Kanban' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveView('Kanban')}
                >
                  Kanban
                </button>
              </div>
              
              <button 
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                onClick={handleNewEntry}
              >
                <Plus className="w-4 h-4" />
                <span>New Entry</span>
              </button>
              
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
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
          ) : activeView === 'Calendar' ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {daysOfWeek.map(day => (
                  <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 border-r border-gray-200 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              {/* Calendar Body */}
              <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`border-r border-b border-gray-200 last:border-r-0 p-2 min-h-[120px] relative cursor-pointer hover:bg-gray-50 ${
                      dragOverDate === day ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    onClick={day ? () => handleDayClick(day) : undefined}
                    onDragOver={day ? (e) => handleCalendarDragOver(e, day) : undefined}
                    onDragLeave={day ? handleCalendarDragLeave : undefined}
                    onDrop={day ? (e) => handleCalendarDrop(e, day) : undefined}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-2 ${
                          day === today && isCurrentMonth ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {getTasksForDate(day).map(task => (
                            <div
                              key={task.id}
                              className={`text-xs p-2 rounded border ${task.color} cursor-move hover:shadow-sm relative ${
                                task.status === 'completed' ? 'opacity-75' : ''
                              } ${draggedTask?.id === task.id ? 'opacity-50' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskClick(task);
                              }}
                              draggable
                              onDragStart={(e) => handleCalendarDragStart(e, task)}
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
                                {task.priority && task.priority !== 'medium' && (
                                  <span className="text-xs ml-1">
                                    {priorityConfig[task.priority]?.icon || '🟡'}
                                  </span>
                                )}
                              </div>
                              <div className={`${
                                task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                              }`}>{task.type}</div>
                              {task.time && (
                                <div className={`${
                                  task.status === 'completed' ? 'text-gray-400' : 'text-gray-500'
                                }`}>{task.time}</div>
                              )}
                            </div>
                          ))}
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
              <div className="grid grid-cols-4 gap-6 h-full">
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
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="font-medium text-gray-900 mb-2">{task.title}</div>
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
                          {task.time && (
                            <div className="flex items-center space-x-2 mb-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">{task.time}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 ${teamMembers.find(m => m.id === task.assignee)?.color} rounded-full flex items-center justify-center text-white text-xs`}>
                              {teamMembers.find(m => m.id === task.assignee)?.avatar}
                            </div>
                            <span className="text-xs text-gray-600">
                              {getTeamMemberName(task.assignee)}
                            </span>
                          </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] mx-4">
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
            <div className="space-y-4">
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
                  rows={3}
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
                  <input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask((prev: any) => ({ ...prev, time: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="flex space-x-2">
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask((prev: any) => ({ 
                        ...prev, 
                        category: e.target.value,
                        type: categoryConfig[e.target.value]?.type || 'Custom'
                      }))}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="blogPosts">Blog Posts</option>
                      <option value="socialMedia">Social Media</option>
                      <option value="campaigns">Campaigns</option>
                      <option value="emailMarketing">Email Marketing</option>
                      {customCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowAddCategory(!showAddCategory)}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm"
                      title="Add custom category"
                    >
                      +
                    </button>
                  </div>
                  {showAddCategory && (
                    <div className="mt-2 flex space-x-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category name"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
                      />
                      <button
                        onClick={addCustomCategory}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategoryName('');
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask((prev: any) => ({ ...prev, assignee: parseInt(e.target.value) }))}
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
                        <select
                          value={newTask.recurring_pattern}
                          onChange={(e) => setNewTask((prev: any) => ({ 
                            ...prev, 
                            recurring_pattern: e.target.value
                          }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  value={newTask.comments}
                  onChange={(e) => setNewTask((prev: any) => ({ ...prev, comments: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Add any additional notes or comments..."
                />
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowTaskModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] mx-4"
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
                <h4 className="font-medium text-gray-900 mb-2">{selectedTask.title}</h4>
                <p className="text-gray-600 text-sm">{selectedTask.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">TYPE</label>
                  <span className={`text-xs px-2 py-1 rounded ${selectedTask.color}`}>
                    {selectedTask.type}
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
                    {selectedTask.status.replace('-', ' ')}
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
                  <div className={`w-6 h-6 ${teamMembers.find(m => m.id === selectedTask.assignee)?.color} rounded-full flex items-center justify-center text-white text-xs`}>
                    {teamMembers.find(m => m.id === selectedTask.assignee)?.avatar}
                  </div>
                  <span className="text-sm text-gray-900">
                    {getTeamMemberName(selectedTask.assignee)}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">DUE DATE</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {monthNames[selectedTask.month || currentDate.getMonth()]} {selectedTask.date}, {selectedTask.year || currentDate.getFullYear()}
                  </span>
                  {selectedTask.time && (
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
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleDeleteTask}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
              >
                Delete
              </button>
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Task
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Task</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                  <input
                    type="time"
                    value={editingTask.time}
                    onChange={(e) => setEditingTask((prev: any) => ({ ...prev, time: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                        <select
                          value={editingTask.recurring_pattern || ''}
                          onChange={(e) => setEditingTask((prev: any) => ({ 
                            ...prev, 
                            recurring_pattern: e.target.value
                          }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  value={editingTask.comments || ''}
                  onChange={(e) => setEditingTask((prev: any) => ({ ...prev, comments: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add any additional notes or comments..."
                />
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
    </div>
  );
};

export default MMCCalendar; 