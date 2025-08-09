'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Trophy,
  Target,
  Bot,
  TrendingUp,
  Star,
  Zap,
  Award
} from 'lucide-react'
import Link from 'next/link'
import { useTheme, toggleTheme } from '../../contexts/ThemeContext'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import useAuth from '@/hooks/useAuth'
import { getDashboardData, getBadges, getModules } from '@/services/userServices'
import { logout } from '@/services/authServices'
import { DashboardSharp } from '@mui/icons-material'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

const cardHoverVariants = {
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
}

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const bounceVariants = {
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export default function Dashboard() {
  useAuth()

  const [dashboard, setDashboard] = useState(null);
  const [badge, setBadge] = useState(null);
  const [modules, setModules] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        if(data.success){
          setDashboard(data.dashboard);

        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  console.log("dashboard data: ",dashboard)
  useEffect(() => {
    const fetchBadges = async () => {
      if (!dashboard || !dashboard.badges) return;
      
      try {
        const badgedata = await getBadges(dashboard.badges);
        if(badgedata.success){
          setBadge(badgedata.data)
        }
      }catch (err) {
        setError(err.response?.data?.message || "Failed to load badges");
      }
    };

    fetchBadges();
  }, [dashboard]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const modulesData = await getModules();
        if(modulesData.success){
          setModules(modulesData.modules);
        }
      }catch (err) {
        setError(err.response?.data?.message || "Failed to load modules");
      }
    };

    fetchModules();
  }, []);
  
  const [tabValue, setTabValue] = useState(0)
  const { theme, toggleTheme } = useTheme()

  const handleTabChange = (newValue) => {
    setTabValue(newValue)
  }

  // Use real data from API or fallback to defaults
  const userStats = dashboard ? {
    xp: dashboard.user.totalXP,
    level: dashboard.user.level,
    completedLessons: dashboard.progress.modulesCompleted,
    totalLessons: dashboard.progress.totalModules,
    badges: dashboard.badges.length,
    streak: dashboard.user.streak
  } : {
    xp: 0,
    level: 1,
    completedLessons: 0,
    totalLessons: 0,
    badges: 0,
    streak: 0
  };
  const badges = badge?.map(badgeItem => ({
    name: badgeItem.name,
    icon: badgeItem.icon || '🏆',
    earned: true,
  })) || dashboard?.badges?.map(badge => ({
    name: badge.name,
    icon: badge.icon || '🏆',
    earned: true
  })) || [
    { name: 'Budget Master', icon: '💰', earned: false },
    { name: 'Investment Rookie', icon: '📈', earned: false },
    { name: 'Savings Star', icon: '⭐', earned: false },
    { name: 'Debt Destroyer', icon: '🔥', earned: false },
    { name: 'Tax Ninja', icon: '🥷', earned: false }
  ]

  const recentLessons = modules ? modules
    .filter(module => 
      module.userProgress?.status === 'in_progress' || 
      module.userProgress?.status === 'completed' ||
      (dashboard?.progress?.currentModule && module._id === dashboard.progress.currentModule._id)
    )
    .map((module, index) => ({
      id: module._id || index,
      title: module.title || `Module ${index + 1}`,
      progress: module.userProgress?.status === 'completed' ? 100 : 
                module.userProgress?.status === 'in_progress' ? 50 : 0,
      xp: module.xpReward || 150,
      isCompleted: module.userProgress?.status === 'completed',
      description: module.description || '',
      status: module.userProgress?.status || 'not_started'
    }))
    .slice(0, 4) : [
    { title: 'Understanding Compound Interest', progress: 0, xp: 150 },
    { title: 'Creating Your First Budget', progress: 0, xp: 120 },
    { title: 'Emergency Fund Basics', progress: 0, xp: 90 },
    { title: 'Student Loan Strategies', progress: 0, xp: 0 }
  ]

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
      >
        {value === index && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-6">
              {children}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <header className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50`}>
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 no-underline">
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
            
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.1 }}>
                <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full">
                  <Zap className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{userStats.xp} XP</span>
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium">Level {userStats.level}</span>
                </div>
              </motion.div>
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

              <button onClick={logout} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                Logout
              </button>

            </div>
          </div>
        </header>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <>
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold mb-2 dark:text-white">Welcome back, {dashboard?.user?.name || 'User'}! 👋</h1>
              <p className="text-gray-600 dark:text-gray-300">You're on a {userStats.streak}-day learning streak! Keep it up!</p>
            </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} whileHover="hover">
              <motion.div variants={cardHoverVariants}>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total XP</p>
                      <p className="text-3xl font-bold">{userStats.xp}</p>
                    </div>
                    <motion.div variants={pulseVariants} animate="pulse">
                      <Star size={32} className="text-blue-200" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <motion.div variants={cardHoverVariants}>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Level</p>
                      <p className="text-3xl font-bold">{userStats.level}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Trophy size={32} className="text-purple-200" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <motion.div variants={cardHoverVariants}>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Lessons</p>
                      <p className="text-3xl font-bold">{userStats.completedLessons}/{userStats.totalLessons}</p>
                    </div>
                    <motion.div variants={bounceVariants} animate="bounce">
                      <BookOpen size={32} className="text-green-200" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <motion.div variants={cardHoverVariants}>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Badges</p>
                      <p className="text-3xl font-bold">{userStats.badges}</p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Award size={32} className="text-orange-200" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 mb-6 shadow-sm">
            <div className="flex space-x-1">
              {['Learn', 'Budget', 'Goals', 'AI Mentor'].map((tab, index) => (
                <button
                  key={index}
                  onClick={() => handleTabChange(index)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    tabValue === index 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <TabPanel value={tabValue} index={0}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-2 dark:text-white">Continue Learning</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Pick up where you left off</p>
                    
                    <div className="space-y-4">
                      {recentLessons.map((lesson, index) => (
                        <motion.div
                          key={lesson.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between border dark:border-gray-600 ${
                            lesson.isCompleted ? 'border-green-300 dark:border-green-600' : ''
                          }`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium dark:text-white">{lesson.title}</p>
                                {lesson.isCompleted && (
                                  <span className="text-green-600 dark:text-green-400 text-sm">✓ Completed</span>
                                )}
                              </div>
                              {lesson.description && (
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{lesson.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      lesson.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${lesson.progress}%` }}
                                  />
                                </div>
                                <span className="text-gray-600 dark:text-gray-300 text-sm">{lesson.progress}%</span>
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <p className="text-gray-600 dark:text-gray-300 text-sm">+{lesson.xp} XP</p>
                              <Link href={`/lessons/${lesson.id || index + 1}`} className="no-underline">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <button className={`mt-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    lesson.isCompleted 
                                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                                  }`}>
                                    {lesson.progress === 0 ? 'Start' : lesson.progress === 100 ? 'Review' : 'Continue'}
                                  </button>
                                </motion.div>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-2 dark:text-white">Your Badges</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Achievements unlocked</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {badges.map((badge, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className={`p-3 text-center border rounded-lg ${
                            badge.earned
                              ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 border-yellow-300 dark:border-yellow-600'
                              : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}>
                            <div className="text-2xl mb-1">{badge.icon}</div>
                            <p className={`text-xs font-medium ${badge.earned ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-500 dark:text-gray-400'}`}>
                              {badge.name}
                            </p>
                            {badge.description && (
                              <p className={`text-xs mt-1 ${badge.earned ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-400 dark:text-gray-500'}`}>
                                {badge.description}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-2 dark:text-white">Weekly Challenge</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Complete to earn bonus XP</p>
                    
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-3xl mb-2"
                      >
                        💰
                      </motion.div>
                      <p className="font-medium mb-2 dark:text-white">Track expenses for 7 days</p>
                                              <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((userStats.streak / 7) * 100, 100)}%` }} />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{userStats.streak}/7 days completed</p>
                      <Link href="/budget-planner" className="no-underline">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            Continue Challenge
                          </button>
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold mb-2 dark:text-white">Student Budget Planner</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Track your income and expenses</p>
                
                {dashboard?.budget ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Total Income</h4>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">${dashboard.budget.totalIncome}</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Total Spent</h4>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">${dashboard.budget.totalActual}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Remaining</h4>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${dashboard.budget.remainingBudget}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <Link href="/budget-planner" className="no-underline">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                            View Full Budget
                          </button>
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Target size={64} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    </motion.div>
                    <h4 className="text-lg font-medium mb-2 dark:text-white">No Budget Set Up</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Track your part-time job income, allowances, and student expenses</p>
                    <Link href="/budget-planner" className="no-underline">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                          Set Up Budget
                        </button>
                      </motion.div>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold mb-2 dark:text-white">Financial Goals</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Set and track your savings goals</p>
                
                {dashboard?.goals && dashboard.goals.length > 0 ? (
                  <div className="space-y-4">
                    {dashboard.goals.map((goal, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium dark:text-white">{goal.title}</h4>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {goal.daysRemaining} days left
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${goal.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-gray-600 dark:text-gray-300 text-sm">{Math.floor(goal.progressPercentage)}%</span>
                        </div>
                      </motion.div>
                    ))}
                    <div className="text-center pt-4">
                      <Link href="/goals" className="no-underline">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                            View All Goals
                          </button>
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <TrendingUp size={64} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    </motion.div>
                    <h4 className="text-lg font-medium mb-2 dark:text-white">No Goals Set</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Save for that laptop, trip, or emergency fund with visual progress</p>
                    <Link href="/goals" className="no-underline">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                          Create Goal
                        </button>
                      </motion.div>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold mb-2 dark:text-white">AI Financial Mentor</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Get personalized advice and quick answers</p>
                
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Bot size={64} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  </motion.div>
                  <h4 className="text-lg font-medium mb-2 dark:text-white">Your AI Mentor is Ready</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Ask questions about budgeting, investing, or any financial topic</p>
                  <Link href="/mentor" className="no-underline">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                        Start Chatting
                      </button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </TabPanel>
        </motion.div>
          </>
        )}
      </div>
    </div>
  )
}