'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Target,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { logout } from '@/services/authServices';
import { LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { getGoalData, createGoal, updateGoal, addMilestone, deleteGoal } from '@/services/goalServices'
import useAuth from '@/hooks/useAuth'
  
const GoalTracker = () => {

  useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedGoal, setSelectedGoal] = useState(null);

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: 'other'
  });

  const [editGoalData, setEditGoalData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: 'other',
    status: 'active'
  });

  const [milestoneData, setMilestoneData] = useState({
    amount: '',
    note: ''
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGoalData();
        if(data.success){
          setGoals(data.goals);
        } else {
          setError('Failed to fetch goals');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch goals');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const isActive = (path) => {
    return pathname === path;
  };
  
    const getCategoryColor = (category) => {
      switch(category) {
        case "laptop": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
        case "trip": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
        case "emergency-fund": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
        case "car": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
        case "house": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
        case "education": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
        case "business": return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100"
        default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
      }
    }
  
    const getPriorityColor = (priority) => {
      switch(priority) {
        case "High": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
        case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
        case "Low": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
        default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
      }
    }
  
    const calculateDaysLeft = (deadline) => {
      const today = new Date()
      const targetDate = new Date(deadline)
      const diffTime = targetDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }

  // Handlers
  const refreshGoals = async () => {
    try {
      const data = await getGoalData();
      if (data.success) setGoals(data.goals);
    } catch (_) {}
  };

  const handleOpenCreate = () => {
    setNewGoal({ title: '', description: '', targetAmount: '', deadline: '', category: 'other' });
    setShowCreateModal(true);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    try {
      const payload = {
        title: newGoal.title.trim(),
        description: newGoal.description.trim(),
        targetAmount: Number(newGoal.targetAmount),
        deadline: newGoal.deadline,
        category: newGoal.category
      };
      await createGoal(payload);
      setShowCreateModal(false);
      await refreshGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (goal) => {
    setSelectedGoal(goal);
    setEditGoalData({
      title: goal.title || '',
      description: goal.description || '',
      targetAmount: goal.targetAmount?.toString() || '',
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().slice(0,10) : '',
      category: goal.category || 'other',
      status: goal.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    setActionLoading(true);
    setError(null);
    try {
      const updates = {
        title: editGoalData.title.trim(),
        description: editGoalData.description.trim(),
        targetAmount: Number(editGoalData.targetAmount),
        deadline: editGoalData.deadline,
        category: editGoalData.category,
        status: editGoalData.status
      };
      const updated = await updateGoal(selectedGoal._id, updates);
      if (updated.success) {
        setShowEditModal(false);
        await refreshGoals();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update goal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenMilestone = (goal) => {
    setSelectedGoal(goal);
    setMilestoneData({ amount: '', note: '' });
    setShowMilestoneModal(true);
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    setActionLoading(true);
    setError(null);
    try {
      await addMilestone(selectedGoal._id, {
        amount: Number(milestoneData.amount),
        note: milestoneData.note.trim()
      });
      setShowMilestoneModal(false);
      await refreshGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add milestone');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDelete = (goal) => {
    setSelectedGoal(goal);
    setShowDeleteModal(true);
  };

  const handleDeleteGoal = async () => {
    if (!selectedGoal) return;
    setActionLoading(true);
    setError(null);
    try {
      await deleteGoal(selectedGoal._id);
      setShowDeleteModal(false);
      await refreshGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete goal');
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your goals...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-xl">!</span>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
           {/* Header */}
           <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 no-underline">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-sm">F</span>
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinanceU
            </span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className={`${isActive('/dashboard') ? 
                'text-blue-600 dark:text-blue-400 font-medium' : 
                'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              } transition-colors no-underline`}
            >
              Dashboard
            </Link>
            <Link 
              href="/budget-planner" 
              className={`${isActive('/budget-planner') ? 
                'text-blue-600 dark:text-blue-400 font-medium' : 
                'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              } transition-colors no-underline`}
            >
              Budget
            </Link>
            <Link 
              href="/goals" 
              className={`${isActive('/goals') ? 
                'text-blue-600 dark:text-blue-400 font-medium' : 
                'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              } transition-colors no-underline`}
            >
              Goals
            </Link>
            <Link 
              href="/mentor" 
              className={`${isActive('/mentor') ? 
                'text-blue-600 dark:text-blue-400 font-medium' : 
                'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              } transition-colors no-underline`}
            >
              AI Mentor
            </Link>
            <button 
              onClick={logout} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <LogOut size={20} />
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <SunIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </nav>
        </div>
      </header>
    </motion.div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Goals Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Financial Goals
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Track your savings progress and achieve your dreams
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenCreate}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Goal
            </motion.button>
          </div>
        </motion.div>

        {/* Empty State */}
        {goals.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No goals yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Start your financial journey by creating your first goal. Whether it's saving for a vacation, emergency fund, or a new purchase, we're here to help you achieve it.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenCreate}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Create Your First Goal
            </motion.button>
          </motion.div>
        )}
  
        {/* Goals Grid */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {goals.map((goal, index) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              const daysLeft = calculateDaysLeft(goal.deadline)
              const isUrgent = daysLeft <= 30 && daysLeft > 0
              const isOverdue = daysLeft < 0

              return (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="text-blue-600" size={20} />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {goal.title}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <span className={`${getCategoryColor(goal.category)} px-2 py-1 rounded-full text-xs font-medium`}>
                          {goal.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className={`${goal.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'} px-2 py-1 rounded-full text-xs font-medium border`}>
                          {goal.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {goal.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Card Content */}
                  <div className="px-6 pb-6 space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Progress
                        </span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          ₹{goal.currentAmount.toLocaleString()} saved
                        </span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          ₹{goal.targetAmount.toLocaleString()} goal
                        </span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="text-gray-500" size={16} />
                        <span className="text-gray-600 dark:text-gray-300">
                          {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <span 
                        className={`flex items-center gap-1 ${
                          isOverdue ? "text-red-500" : 
                          isUrgent ? "text-yellow-500" : "text-gray-500"
                        }`}
                      >
                        {isOverdue ? `${Math.abs(daysLeft)} days overdue` :
                         daysLeft === 0 ? "Due today" :
                         `${daysLeft} days left`}
                      </span>
                    </div>

                    {/* Remaining Amount */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Need to save
                        </span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="text-blue-600" size={16} />
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            ₹{(goal.targetAmount - goal.currentAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {daysLeft > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          ₹{Math.ceil((goal.targetAmount - goal.currentAmount) / daysLeft).toLocaleString()} per day
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenMilestone(goal)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Add Money
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenEdit(goal)}
                        className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Edit Goal
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenDelete(goal)}
                        className="flex-1 border border-red-300 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      
      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Goal</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Title</label>
                <input value={newGoal.title} onChange={(e)=>setNewGoal({...newGoal, title: e.target.value})} required className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Description</label>
                <textarea value={newGoal.description} onChange={(e)=>setNewGoal({...newGoal, description: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Target Amount</label>
                  <input type="number" min="0" value={newGoal.targetAmount} onChange={(e)=>setNewGoal({...newGoal, targetAmount: e.target.value})} required className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Deadline</label>
                  <input type="date" value={newGoal.deadline} onChange={(e)=>setNewGoal({...newGoal, deadline: e.target.value})} required className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Category</label>
                <select value={newGoal.category} onChange={(e)=>setNewGoal({...newGoal, category: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2">
                  {['laptop','trip','emergency-fund','car','house','education','business','other'].map(c => (
                    <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setShowCreateModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Cancel</button>
                <button disabled={actionLoading} type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-60">{actionLoading ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Goal</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
            </div>
            <form onSubmit={handleUpdateGoal} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Title</label>
                <input value={editGoalData.title} onChange={(e)=>setEditGoalData({...editGoalData, title: e.target.value})} required className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Description</label>
                <textarea value={editGoalData.description} onChange={(e)=>setEditGoalData({...editGoalData, description: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Target Amount</label>
                  <input type="number" min="0" value={editGoalData.targetAmount} onChange={(e)=>setEditGoalData({...editGoalData, targetAmount: e.target.value})} required className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Deadline</label>
                  <input type="date" value={editGoalData.deadline} onChange={(e)=>setEditGoalData({...editGoalData, deadline: e.target.value})} required className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Category</label>
                  <select value={editGoalData.category} onChange={(e)=>setEditGoalData({...editGoalData, category: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2">
                    {['laptop','trip','emergency-fund','car','house','education','business','other'].map(c => (
                      <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Status</label>
                  <select value={editGoalData.status} onChange={(e)=>setEditGoalData({...editGoalData, status: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2">
                    {['active','completed','paused','cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setShowEditModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Cancel</button>
                <button disabled={actionLoading} type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-60">{actionLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money (Milestone) Modal */}
      {showMilestoneModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Money to "{selectedGoal.title}"</h2>
              <button onClick={() => setShowMilestoneModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
            </div>
            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Amount</label>
                <input type="number" min="0" value={milestoneData.amount} onChange={(e)=>setMilestoneData({...milestoneData, amount: e.target.value})} required className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Note (optional)</label>
                <input value={milestoneData.note} onChange={(e)=>setMilestoneData({...milestoneData, note: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setShowMilestoneModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Cancel</button>
                <button disabled={actionLoading} type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-60">{actionLoading ? 'Adding...' : 'Add Money'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Goal</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Are you sure you want to delete "{selectedGoal.title}"? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={()=>setShowDeleteModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Cancel</button>
              <button disabled={actionLoading} onClick={handleDeleteGoal} className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60">{actionLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
  
  export default GoalTracker