'use client'

import { useState } from 'react'
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
  const [userStats] = useState({
    xp: 1250,
    level: 3,
    completedLessons: 12,
    totalLessons: 24,
    badges: 5,
    streak: 7
  })

  const [tabValue, setTabValue] = useState(0)
  const { theme, toggleTheme } = useTheme()

  const handleTabChange = (newValue) => {
    setTabValue(newValue)
  }

  const badges = [
    { name: 'Budget Master', icon: '💰', earned: true },
    { name: 'Investment Rookie', icon: '📈', earned: true },
    { name: 'Savings Star', icon: '⭐', earned: true },
    { name: 'Debt Destroyer', icon: '🔥', earned: false },
    { name: 'Tax Ninja', icon: '🥷', earned: false }
  ]

  const recentLessons = [
    { title: 'Understanding Compound Interest', progress: 100, xp: 150 },
    { title: 'Creating Your First Budget', progress: 100, xp: 120 },
    { title: 'Emergency Fund Basics', progress: 75, xp: 90 },
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
            </div>
          </div>
        </header>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Welcome back, Alex! 👋</h1>
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
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between border dark:border-gray-600">
                            <div className="flex-1">
                              <p className="font-medium dark:text-white">{lesson.title}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${lesson.progress}%` }}
                                  />
                                </div>
                                <span className="text-gray-600 dark:text-gray-300 text-sm">{lesson.progress}%</span>
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <p className="text-gray-600 dark:text-gray-300 text-sm">+{lesson.xp} XP</p>
                              <Link href={`/lessons/${index + 1}`} className="no-underline">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
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
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">4/7 days completed</p>
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
                
                <div className="text-center py-12">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Target size={64} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  </motion.div>
                  <h4 className="text-lg font-medium mb-2 dark:text-white">Budget Planner Coming Soon</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Track your part-time job income, allowances, and student expenses</p>
                  <Link href="/budget-planner" className="no-underline">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                        Set Up Budget
                      </button>
                    </motion.div>
                  </Link>
                </div>
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
                
                <div className="text-center py-12">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrendingUp size={64} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  </motion.div>
                  <h4 className="text-lg font-medium mb-2 dark:text-white">Goal Tracking Coming Soon</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Save for that laptop, trip, or emergency fund with visual progress</p>
                  <Link href="/goals" className="no-underline">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                        Create Goal
                      </button>
                    </motion.div>
                  </Link>
                </div>
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
      </div>
    </div>
  )
}