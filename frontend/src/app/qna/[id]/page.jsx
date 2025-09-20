'use client'
 
import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Eye,
  Clock,
  User,
  Tag,
  CheckCircle,
  Reply,
  Send,
  ChevronDown,
  ChevronUp,
  X,
  LogOut,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  getQuestionById,
  voteQuestion,
  markQuestionResolved,
  getAnswersByQuestion,
  createAnswer,
  voteAnswer,
  markAnswerHelpful,
  acceptAnswer
} from '@/services/qnaServices'
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
 
const QuestionDetailPage = () => {
  const { id } = useParams()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  
  const isActive = (path) => {
    return pathname === path;
  };

  const [user, setUser] = useState(null)
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [expandedReplies, setExpandedReplies] = useState({})

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
    fetchQuestion()
    fetchAnswers()
  }, [id])
 
  const fetchQuestion = async () => {
    try {
      const response = await getQuestionById(id)
      setQuestion(response.question)
    } catch (error) {
      console.error('Error fetching question:', error)
    }
  }
 
  const fetchAnswers = async () => {
    try {
      const response = await getAnswersByQuestion(id)
      setAnswers(response.answers)
    } catch (error) {
      console.error('Error fetching answers:', error)
    } finally {
      setLoading(false)
    }
  }
 
  const handleVoteQuestion = async (voteType) => {
    if (!user) {
      alert('Please login to vote')
      return
    }
 
    try {
      const response = await voteQuestion(id, voteType)
      setQuestion(prev => ({
        ...prev,
        voteCount: response.voteCount,
        upvotes: response.upvotes,
        downvotes: response.downvotes,
        upvotedBy: response.upvotedBy || prev.upvotedBy || [],
        downvotedBy: response.downvotedBy || prev.downvotedBy || []
      }))
    } catch (error) {
      console.error('Error voting on question:', error)
      alert('Error voting on question. Please try again.')
    }
  }
 
  const handleVoteAnswer = async (answerId, voteType) => {
    if (!user) {
      alert('Please login to vote')
      return
    }
 
    try {
      const response = await voteAnswer(answerId, voteType)
      setAnswers(answers.map(answer =>
        answer._id === answerId
          ? { 
              ...answer, 
              voteCount: response.voteCount, 
              upvotes: response.upvotes, 
              downvotes: response.downvotes,
              upvotedBy: response.upvotedBy || answer.upvotedBy || [],
              downvotedBy: response.downvotedBy || answer.downvotedBy || []
            }
          : answer
      ))
    } catch (error) {
      console.error('Error voting on answer:', error)
      alert('Error voting on answer. Please try again.')
    }
  }
 
  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Please login to reply')
      return
    }
 
    try {
      const answerData = {
        content: replyContent,
        questionId: id,
        userId: user.id
      }
      
      await createAnswer(answerData)
      setReplyContent('')
      setReplyingTo(null)
      setShowReplyForm(false)
      fetchAnswers()
    } catch (error) {
      console.error('Error creating answer:', error)
      alert('Error creating answer. Please try again.')
    }
  }
 
  const handleMarkResolved = async (answerId) => {
    if (!user || question.anonymousUsername) {
      alert('Only the question author can mark it as resolved')
      return
    }
 
    try {
      await acceptAnswer(answerId)
      setQuestion(prev => ({ ...prev, isResolved: true, acceptedAnswer: answerId }))
      setAnswers(answers.map(answer =>
        answer._id === answerId
          ? { ...answer, isAccepted: true }
          : { ...answer, isAccepted: false }
      ))
    } catch (error) {
      console.error('Error marking question as resolved:', error)
      alert('Error marking question as resolved. Please try again.')
    }
  }
 
  const handleMarkHelpful = async (answerId) => {
    if (!user) {
      alert('Please login to mark answers as helpful')
      return
    }
 
    try {
      await markAnswerHelpful(answerId)
      setAnswers(answers.map(answer =>
        answer._id === answerId
          ? { ...answer, isHelpful: !answer.isHelpful }
          : answer
      ))
    } catch (error) {
      console.error('Error marking answer as helpful:', error)
      alert('Error marking answer as helpful. Please try again.')
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
 
  const toggleReplies = (answerId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [answerId]: !prev[answerId]
    }))
  }
 
  const AnswerCard = memo(({ answer, isReply = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      variants={cardHoverVariants}
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${isReply ? 'ml-8 mt-4' : 'mb-4'}`}
    >
      <div className="flex gap-4">
        {/* Vote section */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => handleVoteAnswer(answer._id, 'upvote')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ThumbsUp className={`h-5 w-5 ${answer.upvotedBy?.includes(user?.id) ? 'text-green-500' : 'text-gray-400'}`} />
          </button>
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {answer.voteCount || 0}
          </span>
          <button
            onClick={() => handleVoteAnswer(answer._id, 'downvote')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ThumbsDown className={`h-5 w-5 ${answer.downvotedBy?.includes(user?.id) ? 'text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>
 
        {/* Answer content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {answer.anonymousUsername || 'Anonymous'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{formatDate(answer.createdAt)}</span>
              </div>
              {answer.isAccepted && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Accepted
                </span>
              )}
              {answer.isHelpful && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  Helpful
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isReply && (
                <button
                  onClick={() => handleMarkHelpful(answer._id)}
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  Mark as helpful
                </button>
              )}
              {!isReply && question.anonymousUsername && !question.isResolved && (
                <button
                  onClick={() => handleMarkResolved(answer._id)}
                  className="text-sm text-green-600 hover:text-green-700 transition-colors"
                >
                  Accept answer
                </button>
              )}
            </div>
          </div>
 
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {answer.content}
            </p>
          </div>
 
          {/* Reply button */}
          {!isReply && (
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => {
                  setReplyingTo(answer._id)
                  setShowReplyForm(true)
                }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Reply className="h-4 w-4" />
                Reply
              </button>
              
              {answer.replies && answer.replies.length > 0 && (
                <button
                  onClick={() => toggleReplies(answer._id)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {expandedReplies[answer._id] ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide {answer.replies.length} replies
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show {answer.replies.length} replies
                    </>
                  )}
                </button>
              )}
            </div>
          )}
 
          {/* Nested replies */}
          {isReply === false && answer.replies && expandedReplies[answer._id] && (
            <div className="mt-4 space-y-4">
              {answer.replies.map((reply) => (
                <AnswerCard key={reply._id} answer={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  ))

  AnswerCard.displayName = 'AnswerCard'

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading question...</p>
        </div>
      </div>
    )
  }

  if (!question) {
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

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Question not found</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">The question you're looking for doesn't exist or has been removed.</p>
            <Link href="/qna" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              ← Back to Q&A
            </Link>
          </div>
        </div>
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants} className="mb-6">
          <Link
            href="/qna"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Q&A
          </Link>
          </motion.div>
 
        {/* Question */}
        <motion.div
            variants={itemVariants}
            whileHover="hover"
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6"
            style={{ y: 20, opacity: 0 }}
        >
          <div className="flex gap-4">
            {/* Vote section */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => handleVoteQuestion('upvote')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                  <ThumbsUp className={`h-6 w-6 ${question.upvotedBy?.includes(user?.id) ? 'text-green-500' : 'text-gray-400'}`} />
              </button>
              <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                {question.voteCount || 0}
              </span>
              <button
                onClick={() => handleVoteQuestion('downvote')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                  <ThumbsDown className={`h-6 w-6 ${question.downvotedBy?.includes(user?.id) ? 'text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>
 
            {/* Question content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {question.title}
                </h1>
                {question.isResolved && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Resolved
                  </span>
                )}
              </div>
 
              <div className="prose dark:prose-invert max-w-none mb-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {question.content}
                </p>
              </div>
 
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full flex items-center gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
 
              {/* Meta information */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-6">
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
                    <span>{question.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                      <span>{question.answerCount || 0} answers</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                    {question.category || 'general'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
 
        {/* Answers */}
          <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              onClick={() => setShowReplyForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Reply className="h-4 w-4" />
              Answer Question
              </motion.button>
          </div>
 
          {answers.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No answers yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Be the first to answer this question!
              </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                onClick={() => setShowReplyForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Answer Question
                </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {answers.map((answer) => (
                <AnswerCard key={answer._id} answer={answer} />
              ))}
            </div>
          )}
          </motion.div>
 
        {/* Reply Form Modal */}
        {showReplyForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {replyingTo ? 'Reply to Answer' : 'Answer Question'}
                </h3>
                <button
                  onClick={() => {
                    setShowReplyForm(false)
                    setReplyingTo(null)
                    setReplyContent('')
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
 
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Answer *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your answer here..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
 
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyForm(false)
                      setReplyingTo(null)
                      setReplyContent('')
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {replyingTo ? 'Reply' : 'Answer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        </motion.div>
      </div>
    </div>
  )
}
 
export default QuestionDetailPage