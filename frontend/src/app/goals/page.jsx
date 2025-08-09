'use client'

import { useState } from 'react'
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
  
const GoalTracker = () => {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  
  const isActive = (path) => {
    return pathname === path;
  };
  const [goals, setGoals] = useState([
    {
      id: "1",
      title: "Emergency Fund",
      description: "Build a safety net for unexpected expenses",
      targetAmount: 15000,
      currentAmount: 8500,
      deadline: "2024-12-31",
      category: "Emergency",
      priority: "High"
    },
    {
      id: "2", 
      title: "New Laptop",
      description: "MacBook Air for college work",
      targetAmount: 85000,
      currentAmount: 32000,
      deadline: "2024-08-15",
      category: "Purchase",
      priority: "High"
    },
    {
      id: "3",
      title: "Europe Trip",
      description: "Summer vacation with friends",
      targetAmount: 120000,
      currentAmount: 25000,
      deadline: "2025-06-01",
      category: "Travel", 
      priority: "Medium"
    },
    {
      id: "4",
      title: "Course Certification",
      description: "Online coding bootcamp",
      targetAmount: 25000,
      currentAmount: 18000,
      deadline: "2024-09-30",
      category: "Education",
      priority: "Medium"
    }
  ])
  
    const getCategoryColor = (category) => {
      switch(category) {
        case "Emergency": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
        case "Purchase": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
        case "Travel": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
        case "Education": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Goal
            </motion.button>
          </div>
        </motion.div>
  
                {/* Goals Grid */}
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
                key={goal.id}
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
                        {goal.category}
                      </span>
                      <span className={`${getPriorityColor(goal.priority)} px-2 py-1 rounded-full text-xs font-medium border`}>
                        {goal.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {goal.description}
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
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      Add Money
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      Edit Goal
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
  
  export default GoalTracker