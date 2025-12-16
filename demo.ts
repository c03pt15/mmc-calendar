import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, User, Calendar, Clock, UserCheck } from 'lucide-react';

const MMCCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // July 2025
  const [activeView, setActiveView] = useState('Calendar');
  const [selectedFilters, setSelectedFilters] = useState({
    blogPosts: true,
    socialMedia: true,
    campaigns: true,
    emailMarketing: true
  });
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'Blog',
    category: 'blogPosts',
    date: 1,
    month: 6, // July
    year: 2025,
    time: '09:00',
    assignee: 1,
    status: 'planned'
  });

  // Sample data with month-specific tasks and assignees
  const [allTasks, setAllTasks] = useState({
    '2025-5': [ // June 2025
      {
        id: 101,
        title: 'Summer Campaign Launch',
        description: 'Launch our summer marketing campaign across all channels',
        type: 'Campaign',
        date: 15,
        month: 5,
        year: 2025,
        time: '10:00',
        category: 'campaigns',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        assignee: 3,
        status: 'in-progress'
      },
      {
        id: 102,
        title: 'Product Update Blog',
        description: 'Write blog post about new product features',
        type: 'Blog',
        date: 20,
        month: 5,
        year: 2025,
        time: '14:30',
        category: 'blogPosts',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        assignee: 6,
        status: 'planned'
      }
    ],
    '2025-6': [ // July 2025 (original data)
      {
        id: 1,
        title: 'Product Feature Announcement',
        description: 'Announce new product features across social media platforms',
        type: 'Social',
        date: 21,
        month: 6,
        year: 2025,
        time: '11:00',
        category: 'socialMedia',
        color: 'bg-green-100 text-green-800 border-green-200',
        assignee: 1,
        status: 'completed'
      },
      {
        id: 2,
        title: 'How to Build Better User Interfaces',
        description: 'Technical blog post about UI/UX best practices',
        type: 'Blog',
        date: 26,
        month: 6,
        year: 2025,
        time: '13:00',
        category: 'blogPosts',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        assignee: 2,
        status: 'review'
      },
      {
        id: 3,
        title: 'Weekly Newsletter - Tech Updates',
        description: 'Curate and send weekly newsletter with latest tech updates',
        type: 'Email',
        date: 28,
        month: 6,
        year: 2025,
        time: '09:30',
        category: 'emailMarketing',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        assignee: 6,
        status: 'planned'
      },
      {
        id: 4,
        title: 'Q1 Marketing Campaign',
        description: 'Launch Q1 marketing campaign with focus on lead generation',
        type: 'Campaign',
        date: 30,
        month: 6,
        year: 2025,
        time: '15:00',
        category: 'campaigns',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        assignee: 4,
        status: 'planned'
      }
    ],
    '2025-7': [ // August 2025
      {
        id: 201,
        title: 'Back to School Campaign',
        description: 'Educational content for back to school season',
        type: 'Campaign',
        date: 5,
        month: 7,
        year: 2025,
        time: '08:00',
        category: 'campaigns',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        assignee: 4,
        status: 'planned'
      },
      {
        id: 202,
        title: 'Instagram Story Series',
        description: 'Create engaging Instagram story series',
        type: 'Social',
        date: 12,
        month: 7,
        year: 2025,
        time: '16:00',
        category: 'socialMedia',
        color: 'bg-green-100 text-green-800 border-green-200',
        assignee: 1,
        status: 'planned'
      }
    ]
  });

  const teamMembers = [
    { id: 1, name: 'Courtney Wright', role: 'Social and Digital Engagement Lead', avatar: 'CW', color: 'bg-blue-500', active: true },
    { id: 2, name: 'Ghislain Girard', role: 'Manager, Web Operations', avatar: 'GG', color: 'bg-green-500', active: true },
    { id: 3, name: 'Joy Pavelich', role: 'Executive Vice-President, Strategy and Operations', avatar: 'JP', color: 'bg-purple-500', active: true },
    { id: 4, name: 'Krystle Kung', role: 'Manager, Digital Marketing', avatar: 'KK', color: 'bg-pink-500', active: true },
    { id: 5, name: 'Lori-Anne Knarr', role: 'Bilingual Communications Specialist', avatar: 'LK', color: 'bg-indigo-500', active: true },
    { id: 6, name: 'Meg McLean', role: 'Social and Digital Engagement Lead', avatar: 'MM', color: 'bg-red-500', active: true }
  ];

  const categoryConfig = {
    blogPosts: { color: 'bg-blue-100 text-blue-800 border-blue-200', type: 'Blog' },
    socialMedia: { color: 'bg-green-100 text-green-800 border-green-200', type: 'Social' },
    campaigns: { color: 'bg-purple-100 text-purple-800 border-purple-200', type: 'Campaign' },
    emailMarketing: { color: 'bg-orange-100 text-orange-800 border-orange-200', type: 'Email' }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  const currentMonthTasks = allTasks[currentMonthKey] || [];

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getDaysInMonthCount = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getTasksForDate = (date) => {
    let tasks = currentMonthTasks.filter(task => task.date === date && selectedFilters[task.category]);

    if (selectedTeamMember) {
      tasks = tasks.filter(task => task.assignee === selectedTeamMember);
    }

    return tasks;
  };

  const getAllFilteredTasks = () => {
    let tasks = currentMonthTasks.filter(task => selectedFilters[task.category]);

    if (selectedTeamMember) {
      tasks = tasks.filter(task => task.assignee === selectedTeamMember);
    }

    return tasks;
  };

  const filterCounts = {
    blogPosts: currentMonthTasks.filter(t => t.category === 'blogPosts' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length,
    socialMedia: currentMonthTasks.filter(t => t.category === 'socialMedia' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length,
    campaigns: currentMonthTasks.filter(t => t.category === 'campaigns' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length,
    emailMarketing: currentMonthTasks.filter(t => t.category === 'emailMarketing' && (!selectedTeamMember || t.assignee === selectedTeamMember)).length
  };

  const allFilteredTasks = getAllFilteredTasks();
  const upcomingCount = allFilteredTasks.filter(t => t.status === 'planned').length;
  const inProgressCount = allFilteredTasks.filter(t => t.status === 'in-progress').length;

  const toggleFilter = (filter) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const handleTeamMemberClick = (memberId) => {
    setSelectedTeamMember(selectedTeamMember === memberId ? null : memberId);
  };

  const handleNewEntry = () => {
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
      status: 'planned'
    });
    setShowNewEntryModal(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleSaveNewTask = () => {
    const taskId = Date.now();
    const task = {
      ...newTask,
      id: taskId,
      color: categoryConfig[newTask.category].color
    };

    const monthKey = `${newTask.year}-${newTask.month}`;
    setAllTasks(prev => ({
      ...prev,
      [monthKey]: [...(prev[monthKey] || []), task]
    }));

    setShowNewEntryModal(false);
  };

  const handleEditTask = () => {
    setEditingTask({ ...selectedTask });
    setShowTaskModal(false);
    setShowEditModal(true);
  };

  const handleSaveEditTask = () => {
    const oldMonthKey = `${editingTask.year || currentDate.getFullYear()}-${editingTask.month !== undefined ? editingTask.month : currentDate.getMonth()}`;
    const newMonthKey = `${editingTask.year}-${editingTask.month}`;

    setAllTasks(prev => {
      const newTasks = { ...prev };

      // Remove from old month if it exists
      if (newTasks[oldMonthKey]) {
        newTasks[oldMonthKey] = newTasks[oldMonthKey].filter(task => task.id !== editingTask.id);
      }

      // Add to new month
      const updatedTask = { ...editingTask, color: categoryConfig[editingTask.category].color };
      newTasks[newMonthKey] = [...(newTasks[newMonthKey] || []), updatedTask];

      return newTasks;
    });

    setShowEditModal(false);
    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setAllTasks(prev => ({
        ...prev,
        [currentMonthKey]: prev[currentMonthKey].filter(task => task.id !== selectedTask.id)
      }));

      setShowTaskModal(false);
      setSelectedTask(null);
    }
  };

  // Drag and drop handlers for Kanban
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();

    if (draggedTask && draggedTask.status !== newStatus) {
      setAllTasks(prev => ({
        ...prev,
        [currentMonthKey]: prev[currentMonthKey].map(task =>
          task.id === draggedTask.id
            ? { ...task, status: newStatus }
            : task
        )
      }));
    }

    setDraggedTask(null);
  };

  const getTeamMemberName = (id) => {
    return teamMembers.find(member => member.id === id)?.name || 'Unknown';
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date().getDate();
  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  // Kanban columns
  const kanbanColumns = [
    { id: 'planned', title: 'Planned', color: 'bg-gray-50' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'review', title: 'Review', color: 'bg-yellow-50' },
    { id: 'completed', title: 'Completed', color: 'bg-green-50' }
  ];

  const getTasksByStatus = (status) => {
    return getAllFilteredTasks().filter(task => task.status === status);
  };

  return (
    <div className= "flex h-screen bg-gray-50" >
    {/* Sidebar */ }
    < div className = "w-64 bg-white border-r border-gray-200 p-4" >
      <div className="mb-6" >
        <div className="flex items-center space-x-2 mb-4" >
          <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center text-white font-bold" >
            A
            </div>
            < h1 className = "text-lg font-semibold text-gray-900" > MMC Calendar </h1>
              </div>
              </div>

  {/* Overview */ }
  <div className="mb-6" >
    <h3 className="text-sm font-medium text-gray-900 mb-3" > Overview </h3>
      < div className = "flex space-x-4" >
        <div className="bg-gray-100 rounded-lg p-3 flex-1" >
          <div className="text-2xl font-bold text-blue-600" > { upcomingCount } </div>
            < div className = "text-xs text-gray-600" > Upcoming </div>
              </div>
              < div className = "bg-yellow-50 rounded-lg p-3 flex-1" >
                <div className="text-2xl font-bold text-yellow-600" > { inProgressCount } </div>
                  < div className = "text-xs text-gray-600" > In Progress </div>
                    </div>
                    </div>
                    </div>

  {/* Team Filter */ }
  {
    selectedTeamMember && (
      <div className="mb-4 p-3 bg-blue-50 rounded-lg" >
        <div className="flex items-center justify-between" >
          <div className="flex items-center space-x-2" >
            <UserCheck className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800" >
                { teamMembers.find(m => m.id === selectedTeamMember)?.name }
                </span>
                </div>
                < button
    onClick = {() => setSelectedTeamMember(null)}
className = "text-blue-600 hover:text-blue-800"
  >
  <X className="w-4 h-4" />
    </button>
    </div>
    </div>
        )}

{/* Filters */ }
<div className="mb-6" >
  <h3 className="text-sm font-medium text-gray-900 mb-3" > Filters </h3>
    < div className = "space-y-2" >
    {
      [
      { key: 'blogPosts', label: 'Blog Posts', count: filterCounts.blogPosts },
      { key: 'socialMedia', label: 'Social Media', count: filterCounts.socialMedia },
      { key: 'campaigns', label: 'Campaigns', count: filterCounts.campaigns },
      { key: 'emailMarketing', label: 'Email Marketing', count: filterCounts.emailMarketing }
      ].map(filter => (
        <label key= { filter.key } className = "flex items-center space-x-2 cursor-pointer" >
        <input
                  type="checkbox"
                  checked = { selectedFilters[filter.key]}
                  onChange = {() => toggleFilter(filter.key)}
className = "rounded border-gray-300"
  />
  <span className="text-sm text-gray-700 flex-1" > { filter.label } </span>
    < span className = "text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded" >
      { filter.count }
      </span>
      </label>
            ))}
</div>
  </div>

{/* Team Members */ }
<div className="mb-6" >
  <h3 className="text-sm font-medium text-gray-900 mb-3" > Team Members </h3>
    < div className = "space-y-3" >
    {
      teamMembers.map(member => (
        <div 
                key= { member.id } 
                className = {`flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 ${selectedTeamMember === member.id ? 'bg-blue-50 border border-blue-200' : ''
          }`}
onClick = {() => handleTeamMemberClick(member.id)}
              >
  <div className={ `w-8 h-8 ${member.color} rounded-full flex items-center justify-center text-white text-xs font-medium` }>
    { member.avatar }
    </div>
    < div className = "flex-1 min-w-0" >
      <div className="text-sm font-medium text-gray-900" > { member.name } </div>
        < div className = "text-xs text-gray-500 truncate" > { member.role } </div>
          </div>
{
  member.active && (
    <div className="w-2 h-2 bg-green-400 rounded-full" > </div>
                )
}
</div>
            ))}
</div>
  </div>

{/* Recent Activity */ }
<div>
  <h3 className="text-sm font-medium text-gray-900 mb-3" > Recent Activity </h3>
    < div className = "space-y-3" >
    {
      allFilteredTasks.slice(0, 3).map(task => (
        <div key= { task.id } className = "flex items-start space-x-2" >
        <div className={`w-2 h-2 rounded-full mt-2 ${task.status === 'completed' ? 'bg-green-400' :
            task.status === 'in-progress' ? 'bg-blue-400' :
              task.status === 'review' ? 'bg-yellow-400' : 'bg-gray-400'
          }`} > </div>
      < div className = "flex-1 min-w-0" >
        <div className="text-sm text-gray-900" > { task.title } </div>
          < div className = "text-xs text-gray-500" >
          {
            task.status === 'completed' ? 'completed' :
              task.status === 'in-progress' ? 'in progress' :
                task.status === 'review' ? 'ready for review' : 'planned'
          }
            </div>
            </div>
            </div>
            ))}
</div>
  </div>
  </div>

{/* Main Content */ }
<div className="flex-1 flex flex-col" >
  {/* Header */ }
  < div className = "bg-white border-b border-gray-200 px-6 py-4" >
    <div className="flex items-center justify-between" >
      <div className="flex items-center space-x-4" >
        <div className="flex items-center space-x-2" >
          <button
                  onClick={ () => navigateMonth(-1) }
className = "p-1 hover:bg-gray-100 rounded"
  >
  <ChevronLeft className="w-5 h-5" />
    </button>
    < h2 className = "text-xl font-semibold text-gray-900" >
      { monthNames[currentDate.getMonth()]} { currentDate.getFullYear() }
</h2>
  < button
onClick = {() => navigateMonth(1)}
className = "p-1 hover:bg-gray-100 rounded"
  >
  <ChevronRight className="w-5 h-5" />
    </button>
    </div>
    < button
className = "px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200"
onClick = {() => setCurrentDate(new Date())}
              >
  Today
  </button>
  </div>

  < div className = "flex items-center space-x-4" >
    <div className="flex bg-gray-100 rounded-lg p-1" >
      <button
                  className={
  `px-3 py-1 text-sm rounded-md ${activeView === 'Calendar'
    ? 'bg-white text-gray-900 shadow-sm'
    : 'text-gray-600 hover:text-gray-900'
  }`
}
onClick = {() => setActiveView('Calendar')}
                >
  Calendar
  </button>
  < button
className = {`px-3 py-1 text-sm rounded-md ${activeView === 'Kanban'
    ? 'bg-white text-gray-900 shadow-sm'
    : 'text-gray-600 hover:text-gray-900'
  }`}
onClick = {() => setActiveView('Kanban')}
                >
  Kanban
  </button>
  </div>
  < button
className = "flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
onClick = { handleNewEntry }
  >
  <Plus className="w-4 h-4" />
    <span>New Entry </span>
      </button>
      < div className = "text-sm text-gray-500" > MMC Content Calendar </div>
        </div>
        </div>
        </div>

{/* Main View */ }
<div className="flex-1 p-6" >
  { activeView === 'Calendar' ? (
    <div className= "bg-white rounded-lg shadow-sm border border-gray-200 h-full" >
    {/* Calendar Header */ }
< div className = "grid grid-cols-7 border-b border-gray-200" >
{
  daysOfWeek.map(day => (
    <div key= { day } className = "p-4 text-center text-sm font-medium text-gray-500 border-r border-gray-200 last:border-r-0" >
    { day }
    </div>
  ))
}
  </div>

{/* Calendar Body */ }
<div className="grid grid-cols-7 flex-1" style = {{ gridTemplateRows: 'repeat(6, 1fr)' }}>
{
  days.map((day, index) => (
    <div
                    key= { index }
                    className = "border-r border-b border-gray-200 last:border-r-0 p-2 min-h-[120px] relative"
    >
    { day && (
      <>
      <div className={`text-sm font-medium mb-2 ${day === today && isCurrentMonth ? 'text-blue-600' : 'text-gray-900'
        }`} >
  { day }
  </div>
  < div className = "space-y-1" >
  {
    getTasksForDate(day).map(task => (
      <div
                              key= { task.id }
                              className = {`text-xs p-2 rounded border ${task.color} cursor-pointer hover:shadow-sm`}
onClick = {() => handleTaskClick(task)}
                            >
  <div className="font-medium truncate" > { task.title } </div>
    < div className = "text-gray-600" > { task.type } </div>
{
  task.time && (
    <div className="text-gray-500" > { task.time } </div>
                              )
}
</div>
                          ))}
</div>
{
  day === today && isCurrentMonth && (
    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" > </div>
                        )
}
</>
                    )}
</div>
                ))}
</div>
  </div>
          ) : (
  /* Kanban View */
  <div className= "h-full" >
  <div className="grid grid-cols-4 gap-6 h-full" >
  {
    kanbanColumns.map(column => (
      <div 
                    key= { column.id } 
                    className = {`${column.color} rounded-lg p-4`}
onDragOver = { handleDragOver }
onDrop = {(e) => handleDrop(e, column.id)}
                  >
  <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-between" >
    { column.title }
    < span className = "text-sm bg-white px-2 py-1 rounded-full" >
      { getTasksByStatus(column.id).length }
      </span>
      </h3>
      < div className = "space-y-3" >
      {
        getTasksByStatus(column.id).map(task => (
          <div
                          key= { task.id }
                          className = {`bg-white p-4 rounded-lg shadow-sm border cursor-move hover:shadow-md transition-shadow ${draggedTask?.id === task.id ? 'opacity-50' : ''
            }`}
draggable
onDragStart = {(e) => handleDragStart(e, task)}
onClick = {() => handleTaskClick(task)}
                        >
  <div className="font-medium text-gray-900 mb-2" > { task.title } </div>
    < div className = "text-sm text-gray-600 mb-3" > { task.description } </div>
      < div className = "flex items-center justify-between mb-2" >
        <span className={ `text-xs px-2 py-1 rounded ${task.color}` }>
          { task.type }
          </span>
          < div className = "flex items-center space-x-2" >
            <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500" >
                { monthNames[task.month || currentDate.getMonth()]} { task.date }
</span>
  </div>
  </div>
{
  task.time && (
    <div className="flex items-center space-x-2 mb-2" >
      <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500" > { task.time } </span>
          </div>
                          )
}
<div className="flex items-center space-x-2" >
  <div className={ `w-6 h-6 ${teamMembers.find(m => m.id === task.assignee)?.color} rounded-full flex items-center justify-center text-white text-xs` }>
    { teamMembers.find(m => m.id === task.assignee)?.avatar }
    </div>
    < span className = "text-xs text-gray-600" >
      { getTeamMemberName(task.assignee) }
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

{/* New Entry Modal */ }
{
  showNewEntryModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4" >
        <div className="flex items-center justify-between mb-4" >
          <h3 className="text-lg font-medium text-gray-900" > New Entry </h3>
            < button
  onClick = {() => setShowNewEntryModal(false)
}
className = "text-gray-400 hover:text-gray-600"
  >
  <X className="w-5 h-5" />
    </button>
    </div>

    < div className = "space-y-4" >
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-1" > Title </label>
        < input
type = "text"
value = { newTask.title }
onChange = {(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder = "Enter task title"
  />
  </div>

  < div >
  <label className="block text-sm font-medium text-gray-700 mb-1" > Description </label>
    < textarea
value = { newTask.description }
onChange = {(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
rows = "3"
placeholder = "Enter task description"
  />
  </div>

  < div className = "grid grid-cols-2 gap-4" >
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1" > Month </label>
      < select
value = { newTask.month }
onChange = {(e) => setNewTask(prev => ({ ...prev, month: parseInt(e.target.value) }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
{
  monthNames.map((month, index) => (
    <option key= { index } value = { index } > { month } </option>
  ))
}
  </select>
  </div>

  < div >
  <label className="block text-sm font-medium text-gray-700 mb-1" > Year </label>
    < select
value = { newTask.year }
onChange = {(e) => setNewTask(prev => ({ ...prev, year: parseInt(e.target.value) }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
  <option value={ 2024 }> 2024 </option>
    < option value = { 2025} > 2025 </option>
      < option value = { 2026} > 2026 </option>
        </select>
        </div>
        </div>

        < div className = "grid grid-cols-2 gap-4" >
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" > Day </label>
            < input
type = "number"
min = "1"
max = { getDaysInMonthCount(newTask.year, newTask.month) }
value = { newTask.date }
onChange = {(e) => setNewTask(prev => ({ ...prev, date: parseInt(e.target.value) }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  </div>

  < div >
  <label className="block text-sm font-medium text-gray-700 mb-1" > Time </label>
    < input
type = "time"
value = { newTask.time }
onChange = {(e) => setNewTask(prev => ({ ...prev, time: e.target.value }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  </div>
  </div>

  < div className = "grid grid-cols-2 gap-4" >
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1" > Category </label>
      < select
value = { newTask.category }
onChange = {(e) => setNewTask(prev => ({
  ...prev,
  category: e.target.value,
  type: categoryConfig[e.target.value].type
}))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
  <option value="blogPosts" > Blog Posts </option>
    < option value = "socialMedia" > Social Media </option>
      < option value = "campaigns" > Campaigns </option>
        < option value = "emailMarketing" > Email Marketing </option>
          </select>
          </div>

          < div >
          <label className="block text-sm font-medium text-gray-700 mb-1" > Assignee </label>
            < select
value = { newTask.assignee }
onChange = {(e) => setNewTask(prev => ({ ...prev, assignee: parseInt(e.target.value) }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
{
  teamMembers.map(member => (
    <option key= { member.id } value = { member.id } > { member.name } </option>
  ))
}
  </select>
  </div>
  </div>
  </div>

  < div className = "flex space-x-3 mt-6" >
    <button
                onClick={ () => setShowNewEntryModal(false) }
className = "flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
  >
  Cancel
  </button>
  < button
onClick = { handleSaveNewTask }
disabled = {!newTask.title.trim()}
className = "flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
  >
  Save Task
    </button>
    </div>
    </div>
    </div>
      )}

{/* Task Details Modal */ }
{
  showTaskModal && selectedTask && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4" >
        <div className="flex items-center justify-between mb-4" >
          <h3 className="text-lg font-medium text-gray-900" > Task Details </h3>
            < button
  onClick = {() => setShowTaskModal(false)
}
className = "text-gray-400 hover:text-gray-600"
  >
  <X className="w-5 h-5" />
    </button>
    </div>

    < div className = "space-y-4" >
      <div>
      <h4 className="font-medium text-gray-900 mb-2" > { selectedTask.title } </h4>
        < p className = "text-gray-600 text-sm" > { selectedTask.description } </p>
          </div>

          < div className = "grid grid-cols-2 gap-4" >
            <div>
            <label className="block text-xs font-medium text-gray-500 mb-1" > TYPE </label>
              < span className = {`text-xs px-2 py-1 rounded ${selectedTask.color}`}>
                { selectedTask.type }
                </span>
                </div>
                < div >
                <label className="block text-xs font-medium text-gray-500 mb-1" > STATUS </label>
                  < span className = {`text-xs px-2 py-1 rounded capitalize ${selectedTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedTask.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        selectedTask.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                      { selectedTask.status.replace('-', ' ') }
                      </span>
                      </div>
                      </div>

                      < div >
                      <label className="block text-xs font-medium text-gray-500 mb-1" > ASSIGNED TO </label>
                        < div className = "flex items-center space-x-2" >
                          <div className={ `w-6 h-6 ${teamMembers.find(m => m.id === selectedTask.assignee)?.color} rounded-full flex items-center justify-center text-white text-xs` }>
                            { teamMembers.find(m => m.id === selectedTask.assignee)?.avatar }
                            </div>
                            < span className = "text-sm text-gray-900" >
                              { getTeamMemberName(selectedTask.assignee) }
                              </span>
                              </div>
                              </div>

                              < div >
                              <label className="block text-xs font-medium text-gray-500 mb-1" > DUE DATE </label>
                                < div className = "flex items-center space-x-2" >
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900" >
                                      { monthNames[selectedTask.month || currentDate.getMonth()]} { selectedTask.date }, { selectedTask.year || currentDate.getFullYear() }
</span>
{
  selectedTask.time && (
    <>
    <Clock className="w-4 h-4 text-gray-400 ml-4" />
      <span className="text-sm text-gray-900" > { selectedTask.time } </span>
        </>
                  )
}
</div>
  </div>
  </div>

  < div className = "flex space-x-3 mt-6" >
    <button
                onClick={ handleDeleteTask }
className = "px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
  >
  Delete
  </button>
  < button
onClick = {() => setShowTaskModal(false)}
className = "flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
  >
  Close
  </button>
  < button
onClick = { handleEditTask }
className = "flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
  >
  Edit Task
    </button>
    </div>
    </div>
    </div>
      )}

{/* Edit Task Modal */ }
{
  showEditModal && editingTask && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4" >
        <div className="flex items-center justify-between mb-4" >
          <h3 className="text-lg font-medium text-gray-900" > Edit Task </h3>
            < button
  onClick = {() => setShowEditModal(false)
}
className = "text-gray-400 hover:text-gray-600"
  >
  <X className="w-5 h-5" />
    </button>
    </div>

    < div className = "space-y-4" >
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-1" > Title </label>
        < input
type = "text"
value = { editingTask.title }
onChange = {(e) => setEditingTask(prev => ({ ...prev, title: e.target.value }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder = "Enter task title"
  />
  </div>

  < div >
  <label className="block text-sm font-medium text-gray-700 mb-1" > Description </label>
    < textarea
value = { editingTask.description }
onChange = {(e) => setEditingTask(prev => ({ ...prev, description: e.target.value }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
rows = "3"
placeholder = "Enter task description"
  />
  </div>

  < div className = "grid grid-cols-2 gap-4" >
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1" > Month </label>
      < select
value = { editingTask.month }
onChange = {(e) => setEditingTask(prev => ({ ...prev, month: parseInt(e.target.value) }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
{
  monthNames.map((month, index) => (
    <option key= { index } value = { index } > { month } </option>
  ))
}
  </select>
  </div>

  < div >
  <label className="block text-sm font-medium text-gray-700 mb-1" > Year </label>
    < select
value = { editingTask.year }
onChange = {(e) => setEditingTask(prev => ({ ...prev, year: parseInt(e.target.value) }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
  <option value={ 2024 }> 2024 </option>
    < option value = { 2025} > 2025 </option>
      < option value = { 2026} > 2026 </option>
        </select>
        </div>
        </div>

        < div className = "grid grid-cols-2 gap-4" >
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" > Day </label>
            < input
type = "number"
min = "1"
max = { getDaysInMonthCount(editingTask.year, editingTask.month) }
value = { editingTask.date }
onChange = {(e) => setEditingTask(prev => ({ ...prev, date: parseInt(e.target.value) }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  </div>

  < div >
  <label className="block text-sm font-medium text-gray-700 mb-1" > Time </label>
    < input
type = "time"
value = { editingTask.time }
onChange = {(e) => setEditingTask(prev => ({ ...prev, time: e.target.value }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  </div>
  </div>

  < div className = "grid grid-cols-2 gap-4" >
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1" > Category </label>
      < select
value = { editingTask.category }
onChange = {(e) => setEditingTask(prev => ({
  ...prev,
  category: e.target.value,
  type: categoryConfig[e.target.value].type
}))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
  <option value="blogPosts" > Blog Posts </option>
    < option value = "socialMedia" > Social Media </option>
      < option value = "campaigns" > Campaigns </option>
        < option value = "emailMarketing" > Email Marketing </option>
          </select>
          </div>

          < div >
          <label className="block text-sm font-medium text-gray-700 mb-1" > Assignee </label>
            < select
value = { editingTask.assignee }
onChange = {(e) => setEditingTask(prev => ({ ...prev, assignee: parseInt(e.target.value) }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
{
  teamMembers.map(member => (
    <option key= { member.id } value = { member.id } > { member.name } </option>
  ))
}
  </select>
  </div>
  </div>

  < div >
  <label className="block text-sm font-medium text-gray-700 mb-1" > Status </label>
    < select
value = { editingTask.status }
onChange = {(e) => setEditingTask(prev => ({ ...prev, status: e.target.value }))}
className = "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
  <option value="planned" > Planned </option>
    < option value = "in-progress" > In Progress </option>
      < option value = "review" > Review </option>
        < option value = "completed" > Completed </option>
          </select>
          </div>
          </div>

          < div className = "flex space-x-3 mt-6" >
            <button
                onClick={ () => setShowEditModal(false) }
className = "flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
  >
  Cancel
  </button>
  < button
onClick = { handleSaveEditTask }
disabled = {!editingTask.title.trim()}
className = "flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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