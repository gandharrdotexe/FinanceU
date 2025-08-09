'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Play,
  Calculator,
  BookOpen,
  GraduationCap,
  LogOut,
  Sun,
  Moon,
  Clock,
  Award,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { usePathname } from 'next/navigation'
import { logout } from '@/services/authServices'
import { 
  getModuleById,
  startModule as startLessonModule,
  submitModuleQuiz,
  completeModule as completeLessonModule
} from '@/services/lessonServices'


// Use services for API interactions

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const moduleId = params.id
  
  // State management
  const [module, setModule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState([])
  const [quizResults, setQuizResults] = useState(null)
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completionData, setCompletionData] = useState(null)
  const [startTime, setStartTime] = useState(null)

  const isActive = (path) => {
    return pathname === path
  }

  // Fetch module data
  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true)
        const response = await getModuleById(moduleId)
        if (response.success) {
          setModule(response.module)
          setQuizAnswers(new Array(response.module.content.quiz?.length || 0).fill(null))
          setStartTime(Date.now())
          
          // Start the module if not already started
          if (response.module.userProgress?.status === 'not_started') {
            await startLessonModule(moduleId)
          }
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (moduleId) {
      fetchModule()
    }
  }, [moduleId])

  // Create content array from sections and quiz
  const getContentArray = () => {
    if (!module) return []
    
    const sections = module.content.sections || []
    const quiz = module.content.quiz || []
    
    // Convert sections to content format and add quiz as final step
    const sectionContent = sections.map(section => ({
      type: section.type,
      title: section.title,
      content: section.content,
      interactiveData: section.interactiveData
    }))
    
    if (quiz.length > 0) {
      sectionContent.push({
        type: 'quiz',
        title: 'Quiz Time!',
        questions: quiz
      })
    }
    
    return sectionContent
  }

  const contentArray = getContentArray()
  const progress = contentArray.length > 0 ? ((currentStep + 1) / contentArray.length) * 100 : 0

  // Handle quiz answer selection
  const handleQuizAnswer = (questionIndex, answerIndex) => {
    const newAnswers = [...quizAnswers]
    newAnswers[questionIndex] = answerIndex
    setQuizAnswers(newAnswers)
  }

  // Submit quiz
  const handleQuizSubmit = async () => {
    try {
      const response = await submitModuleQuiz(moduleId, quizAnswers)
      
      if (response.success) {
        setQuizResults(response)
        setShowQuizResult(true)
      }
    } catch (err) {
      setError('Failed to submit quiz: ' + err.message)
    }
  }

  // Handle navigation
  const handleNext = () => {
    if (currentStep < contentArray.length - 1) {
      setCurrentStep(currentStep + 1)
      setShowQuizResult(false)
    } else {
      completeModule()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setShowQuizResult(false)
    }
  }

  // Complete module
  const completeModule = async () => {
    try {
      const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000 / 60) : module.estimatedTime
      const quizScore = quizResults ? quizResults.score : 0
      
      const response = await completeLessonModule(moduleId, { quizScore, timeSpent })
      
      if (response.success) {
        setCompleted(true)
        setCompletionData(response)
      }
    } catch (err) {
      setError('Failed to complete module: ' + err.message)
    }
  }

  // Render different content types
  const renderContent = (content) => {
    switch (content.type) {
      case 'text':
        return (
          <div>
            {content.title && (
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {content.title}
              </h3>
            )}
            <div 
              className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          </div>
        )

      case 'interactive':
        return (
          <div className="text-center py-8">
            <Calculator className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {content.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {content.content}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              Launch {content.interactiveData?.type === 'budget_planner' ? 'Budget Planner' : 'Tool'}
            </motion.button>
          </div>
        )

      case 'quiz':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {content.title}
            </h3>
            
            {content.questions.map((question, questionIndex) => (
              <motion.div 
                key={questionIndex}
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Question {questionIndex + 1}: {question.question}
                </h4>
                
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <motion.button
                      key={optionIndex}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleQuizAnswer(questionIndex, optionIndex)}
                      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                        quizAnswers[questionIndex] === optionIndex
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      } ${
                        showQuizResult && quizResults
                          ? optionIndex === question.correctAnswer
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                            : quizAnswers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                            : ''
                          : ''
                      }`}
                    >
                      <p className="text-gray-800 dark:text-gray-200">
                        {option}
                      </p>
                    </motion.button>
                  ))}
                </div>
                
                {showQuizResult && quizResults && (
                  <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <p className={`font-medium mb-2 ${
                      quizResults.results[questionIndex]?.isCorrect 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {quizResults.results[questionIndex]?.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
            
            {!showQuizResult && quizAnswers.every(answer => answer !== null) && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleQuizSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Submit Quiz
              </motion.button>
            )}
            
            {showQuizResult && quizResults && (
              <div className={`p-4 rounded-lg ${
                quizResults.score >= 70 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
              }`}>
                <h4 className="text-lg font-semibold mb-1">
                  Quiz Score: {quizResults.score}%
                </h4>
                <p className="text-sm">
                  You got {quizResults.correctAnswers} out of {quizResults.totalQuestions} questions correct.
                </p>
              </div>
            )}
          </div>
        )

      default:
        return <p className="text-gray-700 dark:text-gray-300">Unknown content type: {content.type}</p>
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Error loading module</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Module not found
  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Module not found</h3>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentContent = contentArray[currentStep]

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
                onClick={logout}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                <LogOut size={20} />
              </button>
            </nav>
          </div>
        </header>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!completed ? (
          <>
            {/* Progress Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {module.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {module.description}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-medium">+{module.xpReward} XP</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{module.estimatedTime} min</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{currentStep + 1} of {contentArray.length}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden mb-8">
                <div className="p-6">
                  {currentContent && renderContent(currentContent)}
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div
              className="flex justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentStep === 0
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={
                  currentContent?.type === 'quiz' && 
                  (!showQuizResult || !quizResults)
                }
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentContent?.type === 'quiz' && (!showQuizResult || !quizResults)
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                }`}
              >
                {currentStep === contentArray.length - 1 ? 'Complete Module' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </>
        ) : (
          /* Completion Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden text-center"
          >
            <div className="p-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Module Complete! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
                You've earned <span className="font-semibold text-blue-600 dark:text-blue-400">{completionData?.xpEarned || module.xpReward} XP</span> and completed {module.title}!
                {completionData?.newLevel && (
                  <><br /><span className="inline-block mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">🎊 Level {completionData.newLevel} Unlocked!</span></>
                )}
              </p>
              {quizResults && (
                <div className={`inline-block px-4 py-2 rounded-lg mb-6 ${
                  quizResults.score >= 70 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                }`}>
                  <p className="font-medium">
                    Final Quiz Score: {quizResults.score}%
                  </p>
                  <p className="text-sm">
                    {quizResults.correctAnswers} out of {quizResults.totalQuestions} correct
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Back to Dashboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/lessons')}
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Continue Learning
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

