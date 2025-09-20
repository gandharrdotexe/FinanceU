'use client'

import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  User,
  Tag,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X,
  LogOut,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import { getQuestions, getPopularTags, voteQuestion, createQuestion } from '@/services/qnaServices'
import { getCurrentUser } from '@/services/authServices'
import { logout } from '@/services/authServices'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import { usePathname } from 'next/navigation'

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

const QnAPage = () => {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  
  const isActive = (path) => {
    return pathname === path;
  };

  const [user, setUser] = useState(null)
  const [questions, setQuestions] = useState([])
  const [popularTags, setPopularTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAskForm, setShowAskForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  // Form state for asking questions
  const [questionForm, setQuestionForm] = useState({
    title: '',
    content: '',
    tags: '',
    category: 'general',
    priority: 'medium'
  })

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'budgeting', label: 'Budgeting' },
    { value: 'investing', label: 'Investing' },
    { value: 'saving', label: 'Saving' },
    { value: 'credit', label: 'Credit' },
    { value: 'banking', label: 'Banking' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'other', label: 'Other' }
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'voteCount', label: 'Most Voted' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'answerCount', label: 'Most Replies' }
  ]

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          setUser(JSON.parse(userData))
        } else {
          // Try to get current user from API
          const response = await getCurrentUser()
          if (response.success) {
            setUser(response.user)
            localStorage.setItem('user', JSON.stringify(response.user))
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    fetchQuestions()
    fetchPopularTags()
  }, [currentPage, selectedCategory, selectedTags, sortBy, sortOrder, searchTerm])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        category: selectedCategory,
        sortBy,
        sortOrder,
        search: searchTerm,
        tags: selectedTags.join(',')
      }
      
      const response = await getQuestions(params)
      setQuestions(response.questions)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPopularTags = async () => {
    try {
      const response = await getPopularTags()
      setPopularTags(response)
    } catch (error) {
      console.error('Error fetching popular tags:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchQuestions()
  }

  const handleVote = async (questionId, voteType) => {
    if (!user) {
      alert('Please login to vote')
      return
    }

    try {
      const response = await voteQuestion(questionId, voteType)
      // Update the question in the list
      setQuestions(questions.map(q =>
        q._id === questionId
          ? { 
              ...q, 
              voteCount: response.voteCount, 
              upvotes: response.upvotes, 
              downvotes: response.downvotes,
              upvotedBy: response.upvotedBy || q.upvotedBy || [],
              downvotedBy: response.downvotedBy || q.downvotedBy || []
            }
          : q
      ))
    } catch (error) {
      console.error('Error voting:', error)
      alert('Error voting on question. Please try again.')
    }
  }

  const handleAskQuestion = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Please login to ask a question')
      return
    }

    try {
      const tagsArray = questionForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      const questionData = {
        ...questionForm,
        tags: tagsArray
      }
      
      await createQuestion(questionData)
      setQuestionForm({ title: '', content: '', tags: '', category: 'general', priority: 'medium' })
      setShowAskForm(false)
      fetchQuestions()
    } catch (error) {
      console.error('Error creating question:', error)
      alert('Error creating question. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const QuestionCard = memo(({ question }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      variants={cardHoverVariants}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4">
        {/* Vote section */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => handleVote(question._id, 'upvote')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ThumbsUp className={`h-5 w-5 ${question.upvotedBy?.includes(user?.id) ? 'text-green-500' : 'text-gray-400'}`} />
          </button>
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {question.voteCount || 0}
          </span>
          <button
            onClick={() => handleVote(question._id, 'downvote')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ThumbsDown className={`h-5 w-5 ${question.downvotedBy?.includes(user?.id) ? 'text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Question content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
              <Link href={`/qna/${question._id}`} className="hover:underline">
                {question.title}
              </Link>
            </h3>
            {question.isResolved && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {question.content}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {question.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Meta information */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{question.anonymousUsername || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDate(question.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{question.views || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{question.answerCount || 0} replies</span>
              </div>
            </div>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
              {question.category || 'general'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  ))

  QuestionCard.displayName = 'QuestionCard'

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
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
                href="/qna" 
                className={`${isActive('/qna') ? 
                  'text-blue-600 dark:text-blue-400 font-medium' : 
                  'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                } transition-colors no-underline`}
              >
                Q&A
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Page Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <HelpCircle className="h-8 w-8 text-blue-600" />
                  Q&A Community
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Ask questions, share knowledge, and help others learn about finance
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAskForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Ask Question
              </motion.button>
            </div>

            {/* Search and Filters */}
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4 mb-6">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Search
                </button>
              </form>

              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-')
                    setSortBy(sort)
                    setSortOrder(order)
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={`${option.value}-desc`}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>

            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <motion.div variants={itemVariants} className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Popular Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.slice(0, 10).map((tag, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const tagName = tag._id || tag.name || tag;
                        if (selectedTags.includes(tagName)) {
                          setSelectedTags(selectedTags.filter(t => t !== tagName))
                        } else {
                          setSelectedTags([...selectedTags, tagName])
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag._id || tag.name || tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag._id || tag.name || tag} ({tag.count || 0})
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Questions List */}
          <motion.div variants={itemVariants}>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-12 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard key={question._id} question={question} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Ask Question Modal */}
      {showAskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ask a Question</h2>
              <button
                onClick={() => setShowAskForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question Title *
                </label>
                <input
                  type="text"
                  required
                  value={questionForm.title}
                  onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                  placeholder="What's your question?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question Details *
                </label>
                <textarea
                  required
                  rows={6}
                  value={questionForm.content}
                  onChange={(e) => setQuestionForm({ ...questionForm, content: e.target.value })}
                  placeholder="Provide more details about your question..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={questionForm.category}
                    onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={questionForm.priority}
                    onChange={(e) => setQuestionForm({ ...questionForm, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={questionForm.tags}
                  onChange={(e) => setQuestionForm({ ...questionForm, tags: e.target.value })}
                  placeholder="e.g., budgeting, savings, investment"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Add tags to help others find your question
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAskForm(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Ask Question
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default QnAPage