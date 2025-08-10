'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BookOpen,
  CheckCircle,
  Play,
  Lock,
  Search,
  Filter,
  TrendingUp,
  Wallet,
  CreditCard,
  FileText,
  GraduationCap,
  LogOut,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { usePathname } from 'next/navigation'
import { logout } from '@/services/authServices'
import { getModules as getLessonModules } from '@/services/lessonServices'
import useAuth from '@/hooks/useAuth'


// Category icons mapping
const categoryIcons = {
  budgeting: Wallet,
  investing: TrendingUp,
  debt: CreditCard,
  taxes: FileText,
  general: BookOpen
}

// Difficulty colors
const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
}

// Status colors
const statusColors = {
  not_started: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
}

export default function LessonsPage() {
  useAuth();
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  
  // State management
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const isActive = (path) => {
    return pathname === path
  }

  // Fetch modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true)
        const response = await getLessonModules()
        if (response.success) {
          // Sort modules by order
          const sortedModules = response.modules.sort((a, b) => a.order - b.order)
          setModules(sortedModules)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchModules()
  }, [])

  // Filter modules based on search and filters
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || module.category === categoryFilter
    const matchesDifficulty = !difficultyFilter || module.difficulty === difficultyFilter
    const matchesStatus = !statusFilter || 
                         (module.userProgress ? module.userProgress.status === statusFilter : statusFilter === 'not_started')
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus
  })

  // Get unique categories and difficulties for filters
  const categories = [...new Set(modules.map(m => m.category))]
  const difficulties = [...new Set(modules.map(m => m.difficulty))]

  // Calculate progress statistics
  const completedCount = modules.filter(m => m.userProgress?.status === 'completed').length
  const totalXP = modules.filter(m => m.userProgress?.status === 'completed')
                         .reduce((sum, m) => sum + m.xpReward, 0)

  // Handle module start
  const handleStartModule = async (moduleId) => {
    router.push(`/lessons/${moduleId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg mb-4">
            Failed to load modules: {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    )
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
                href="/lessons" 
                className={`${isActive('/lessons') ? 
                  'text-blue-600 dark:text-blue-400 font-medium' : 
                  'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                } transition-colors no-underline`}
              >
                Learn
              </Link>
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
              <button 
                onClick={() => logout()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                <LogOut size={20} />
              </button>
            </nav>
          </div>
        </header>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Financial Learning
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Master personal finance with interactive lessons
              </p>
            </div>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <GraduationCap size={20} />
                Dashboard
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Progress Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-sm"
          >
            <p className="text-sm opacity-90">Total Modules</p>
            <h3 className="text-2xl font-bold">{modules.length}</h3>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-sm"
          >
            <p className="text-sm opacity-90">Completed</p>
            <h3 className="text-2xl font-bold">{completedCount}</h3>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-sm"
          >
            <p className="text-sm opacity-90">Total XP Earned</p>
            <h3 className="text-2xl font-bold">{totalXP}</h3>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty} className="capitalize">
                  {difficulty}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </motion.div>

        {/* Modules Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredModules.map((module, index) => {
            const CategoryIcon = categoryIcons[module.category] || BookOpen
            const userProgress = module.userProgress
            const status = userProgress?.status || 'not_started'
            const difficultyColor = difficultyColors[module.difficulty]
            const statusColor = statusColors[status]
            const progressPercentage = status === 'in_progress' && userProgress 
              ? Math.round((userProgress.timeSpent / module.estimatedTime) * 100)
              : 0
            
            return (
              <motion.div
                key={module._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Card Content */}
                <div className="p-6 flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <CategoryIcon className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`${difficultyColor} px-2 py-1 rounded-full text-xs font-medium capitalize`}>
                        {module.difficulty}
                      </span>
                      <span className={`${statusColor} px-2 py-1 rounded-full text-xs font-medium capitalize`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {module.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {module.description}
                  </p>

                  {/* Progress bar for in-progress modules */}
                  {status === 'in_progress' && userProgress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Quiz Score for completed modules */}
                  {status === 'completed' && userProgress?.quizScore && (
                    <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ Quiz Score: {userProgress.quizScore}%
                      </p>
                    </div>
                  )}

                  {/* Module Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <span>{module.estimatedTime} min</span>
                    <span>+{module.xpReward} XP</span>
                  </div>

                  {/* Prerequisites */}
                  {module.prerequisites && module.prerequisites.length > 0 && (
                    <div className="mb-4 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Lock className="w-3 h-3" />
                      <span>Requires {module.prerequisites.length} module(s)</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="p-6 pt-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStartModule(module._id)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      status === 'completed' 
                        ? 'border border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50' 
                        : status === 'in_progress'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    }`}
                  >
                    {status === 'completed' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Review
                      </>
                    ) : status === 'in_progress' ? (
                      <>
                        <Play className="w-4 h-4" />
                        Continue
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start Learning
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Empty State */}
        {filteredModules.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No modules found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('')
                setDifficultyFilter('')
                setStatusFilter('')
              }}
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}