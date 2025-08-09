// // 'use client'

// // import { useState } from 'react'
// // import { useParams, useRouter } from 'next/navigation'
// // import { 
// //   Card,
// //   CardContent,
// //   CardHeader,
// //   Typography,
// //   Button,
// //   Badge,
// //   LinearProgress,
// //   Box,
// //   Divider
// // } from '@mui/material'
// // import {
// //   ChevronLeft as ChevronLeftIcon,
// //   ChevronRight as ChevronRightIcon,
// //   CheckCircle as CheckCircleIcon,
// //   PlayArrow as PlayIcon,
// //   Calculate as CalculatorIcon
// // } from '@mui/icons-material'
// // import Link from 'next/link'

// // const lessons = {
// //   '1': {
// //     title: 'Understanding Compound Interest',
// //     description: 'Learn how your money can grow exponentially over time',
// //     xp: 150,
// //     duration: '8 min',
// //     content: [
// //       {
// //         type: 'text',
// //         content: 'Compound interest is often called the "eighth wonder of the world." It\'s the interest you earn on both your original money and on the interest you\'ve already earned.'
// //       },
// //       {
// //         type: 'example',
// //         title: 'Real-World Example',
// //         content: 'If you invest ₹1,000 at 10% annual interest, after one year you\'ll have ₹1,100. In year two, you earn 10% on ₹1,100 (not just the original ₹1,000), giving you ₹1,210.'
// //       },
// //       {
// //         type: 'interactive',
// //         title: 'Compound Interest Calculator',
// //         content: 'Try different amounts and see how compound interest works!'
// //       },
// //       {
// //         type: 'quiz',
// //         question: 'What makes compound interest so powerful?',
// //         options: [
// //           'You earn interest on your interest',
// //           'It only works with large amounts',
// //           'Banks give you extra money',
// //           'It doubles your money instantly'
// //         ],
// //         correct: 0
// //       }
// //     ]
// //   },
// //   '2': {
// //     title: 'Creating Your First Budget',
// //     description: 'Master the 50/30/20 rule and track your student expenses',
// //     xp: 120,
// //     duration: '10 min',
// //     content: [
// //       {
// //         type: 'text',
// //         content: 'Budgeting is like having a GPS for your money. The 50/30/20 rule is perfect for students: 50% for needs, 30% for wants, and 20% for savings.'
// //       },
// //       {
// //         type: 'example',
// //         title: 'Student Budget Example',
// //         content: 'Monthly income: ₹10,000\n• Needs (₹5,000): Food, books, transport\n• Wants (₹3,000): Entertainment, dining out\n• Savings (₹2,000): Emergency fund, goals'
// //       }
// //     ]
// //   }
// // }

// // export default function LessonPage() {
// //   const params = useParams()
// //   const router = useRouter()
// //   const lessonId = params.id
// //   const lesson = lessons[lessonId]
  
// //   const [currentStep, setCurrentStep] = useState(0)
// //   const [quizAnswer, setQuizAnswer] = useState(null)
// //   const [showResult, setShowResult] = useState(false)
// //   const [completed, setCompleted] = useState(false)

// //   if (!lesson) {
// //     return <div>Lesson not found</div>
// //   }

// //   const progress = ((currentStep + 1) / lesson.content.length) * 100

// //   const handleNext = () => {
// //     if (currentStep < lesson.content.length - 1) {
// //       setCurrentStep(currentStep + 1)
// //       setQuizAnswer(null)
// //       setShowResult(false)
// //     } else {
// //       setCompleted(true)
// //     }
// //   }

// //   const handlePrevious = () => {
// //     if (currentStep > 0) {
// //       setCurrentStep(currentStep - 1)
// //       setQuizAnswer(null)
// //       setShowResult(false)
// //     }
// //   }

// //   const handleQuizSubmit = () => {
// //     setShowResult(true)
// //   }

// //   const currentContent = lesson.content[currentStep]

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
// //       {/* Header */}
// //       <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
// //         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
// //           <Link href="/dashboard" className="flex items-center space-x-2 no-underline">
// //             <ChevronLeftIcon className="w-5 h-5" />
// //             <span className="text-gray-700">Back to Dashboard</span>
// //           </Link>
// //           <div className="flex items-center space-x-4">
// //             <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-md">
// //               +{lesson.xp} XP
// //             </Badge>
// //             <Badge variant="outline" className="border-gray-300 text-gray-700 px-3 py-1 rounded-md">
// //               {lesson.duration}
// //             </Badge>
// //           </div>
// //         </div>
// //       </header>

// //       <div className="container mx-auto px-4 py-8 max-w-4xl">
// //         {!completed ? (
// //           <>
// //             {/* Progress */}
// //             <div className="mb-8">
// //               <div className="flex items-center justify-between mb-2">
// //                 <Typography variant="h4" component="h1" className="font-bold">
// //                   {lesson.title}
// //                 </Typography>
// //                 <Typography variant="body2" color="text.secondary">
// //                   {currentStep + 1} of {lesson.content.length}
// //                 </Typography>
// //               </div>
// //               <LinearProgress 
// //                 variant="determinate" 
// //                 value={progress} 
// //                 sx={{
// //                   height: 8,
// //                   borderRadius: 4,
// //                   backgroundColor: 'rgba(0, 0, 0, 0.1)',
// //                   '& .MuiLinearProgress-bar': {
// //                     borderRadius: 4,
// //                     backgroundColor: '#3b82f6'
// //                   }
// //                 }}
// //               />
// //               <Typography variant="body1" color="text.secondary" className="mt-2">
// //                 {lesson.description}
// //               </Typography>
// //             </div>

// //             {/* Content */}
// //             <Card className="mb-8">
// //               <CardContent className="p-8">
// //                 {currentContent.type === 'text' && (
// //                   <Typography variant="body1" className="text-lg leading-relaxed">
// //                     {currentContent.content}
// //                   </Typography>
// //                 )}

// //                 {currentContent.type === 'example' && (
// //                   <Box className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
// //                     <Typography variant="h6" className="font-semibold text-blue-900 mb-3">
// //                       {currentContent.title}
// //                     </Typography>
// //                     <Typography className="text-blue-800 whitespace-pre-line">
// //                       {currentContent.content}
// //                     </Typography>
// //                   </Box>
// //                 )}

// //                 {currentContent.type === 'interactive' && (
// //                   <Box className="text-center py-8">
// //                     <CalculatorIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
// //                     <Typography variant="h5" className="font-semibold mb-2">
// //                       {currentContent.title}
// //                     </Typography>
// //                     <Typography variant="body1" color="text.secondary" className="mb-4">
// //                       {currentContent.content}
// //                     </Typography>
// //                     <Button 
// //                       variant="contained" 
// //                       className="bg-blue-600 hover:bg-blue-700"
// //                       startIcon={<PlayIcon />}
// //                     >
// //                       Launch Calculator
// //                     </Button>
// //                   </Box>
// //                 )}

// //                 {currentContent.type === 'quiz' && (
// //                   <Box className="space-y-4">
// //                     <Typography variant="h5" className="font-semibold mb-4">
// //                       {currentContent.question}
// //                     </Typography>
// //                     <div className="space-y-2">
// //                       {currentContent.options?.map((option, index) => (
// //                         <Button
// //                           key={index}
// //                           fullWidth
// //                           variant="outlined"
// //                           onClick={() => setQuizAnswer(index)}
// //                           className={`text-left normal-case p-4 ${
// //                             quizAnswer === index
// //                               ? 'border-blue-500 bg-blue-50'
// //                               : 'border-gray-200 hover:border-gray-300'
// //                           } ${
// //                             showResult && index === currentContent.correct
// //                               ? 'border-green-500 bg-green-50'
// //                               : showResult && quizAnswer === index && index !== currentContent.correct
// //                               ? 'border-red-500 bg-red-50'
// //                               : ''
// //                           }`}
// //                         >
// //                           {option}
// //                         </Button>
// //                       ))}
// //                     </div>
// //                     {quizAnswer !== null && !showResult && (
// //                       <Button 
// //                         variant="contained" 
// //                         onClick={handleQuizSubmit} 
// //                         className="mt-4"
// //                       >
// //                         Submit Answer
// //                       </Button>
// //                     )}
// //                     {showResult && (
// //                       <Box className={`p-4 rounded-lg ${
// //                         quizAnswer === currentContent.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
// //                       }`}>
// //                         <Typography>
// //                           {quizAnswer === currentContent.correct ? '🎉 Correct!' : '❌ Not quite right. The correct answer is highlighted above.'}
// //                         </Typography>
// //                       </Box>
// //                     )}
// //                   </Box>
// //                 )}
// //               </CardContent>
// //             </Card>

// //             {/* Navigation */}
// //             <div className="flex justify-between">
// //               <Button
// //                 variant="outlined"
// //                 onClick={handlePrevious}
// //                 disabled={currentStep === 0}
// //                 startIcon={<ChevronLeftIcon />}
// //               >
// //                 Previous
// //               </Button>
// //               <Button
// //                 variant="contained"
// //                 onClick={handleNext}
// //                 disabled={currentContent.type === 'quiz' && !showResult}
// //                 endIcon={<ChevronRightIcon />}
// //               >
// //                 {currentStep === lesson.content.length - 1 ? 'Complete Lesson' : 'Next'}
// //               </Button>
// //             </div>
// //           </>
// //         ) : (
// //           /* Completion Screen */
// //           <Card className="text-center">
// //             <CardContent className="p-12">
// //               <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
// //               <Typography variant="h4" component="h2" className="font-bold mb-2">
// //                 Lesson Complete! 🎉
// //               </Typography>
// //               <Typography variant="body1" color="text.secondary" className="mb-6">
// //                 You've earned <strong>{lesson.xp} XP</strong> and unlocked new insights about {lesson.title.toLowerCase()}.
// //               </Typography>
// //               <div className="flex flex-col sm:flex-row gap-4 justify-center">
// //                 <Button 
// //                   variant="contained"
// //                   component={Link}
// //                   href="/dashboard"
// //                 >
// //                   Back to Dashboard
// //                 </Button>
// //                 <Button 
// //                   variant="outlined"
// //                   component={Link}
// //                   href={`/lessons/${parseInt(lessonId) + 1}`}
// //                 >
// //                   Next Lesson
// //                 </Button>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         )}
// //       </div>
// //     </div>
// //   )
// // }

// 'use client'

// import { useState, useEffect } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { 
//   Card,
//   CardContent,
//   CardHeader,
//   Typography,
//   Button,
//   Badge,
//   LinearProgress,
//   Box,
//   Divider,
//   CircularProgress,
//   Alert
// } from '@mui/material'
// import {
//   ChevronLeft as ChevronLeftIcon,
//   ChevronRight as ChevronRightIcon,
//   CheckCircle as CheckCircleIcon,
//   PlayArrow as PlayIcon,
//   Calculate as CalculatorIcon
// } from '@mui/icons-material'
// import Link from 'next/link'

// // Utility function to get auth token
// const getAuthToken = () => {
//   return localStorage.getItem('token') || sessionStorage.getItem('token')
// }

// // API functions
// const apiCall = async (url, options = {}) => {
//   const token = getAuthToken()
//   const response = await fetch(url, {
//     ...options,
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json',
//       ...options.headers
//     }
//   })
  
//   if (!response.ok) {
//     throw new Error(`API call failed: ${response.statusText}`)
//   }
  
//   return response.json()
// }

// export default function LessonPage() {
//   const params = useParams()
//   const router = useRouter()
//   const moduleId = params.id
  
//   // State management
//   const [module, setModule] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [currentStep, setCurrentStep] = useState(0)
//   const [quizAnswers, setQuizAnswers] = useState([])
//   const [quizResults, setQuizResults] = useState(null)
//   const [showQuizResult, setShowQuizResult] = useState(false)
//   const [completed, setCompleted] = useState(false)
//   const [completionData, setCompletionData] = useState(null)
//   const [startTime, setStartTime] = useState(null)

//   // Fetch module data
//   useEffect(() => {
//     const fetchModule = async () => {
//       try {
//         setLoading(true)
//         const response = await apiCall(`http://localhost:5001/api/modules/${moduleId}`)
//         if (response.success) {
//           setModule(response.module)
//           setQuizAnswers(new Array(response.module.content.quiz?.length || 0).fill(null))
//           setStartTime(Date.now())
          
//           // Start the module if not already started
//           if (response.module.userProgress?.status === 'not_started') {
//             await apiCall(`http://localhost:5001/api/modules/${moduleId}/start`, { method: 'POST' })
//           }
//         }
//       } catch (err) {
//         setError(err.message)
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (moduleId) {
//       fetchModule()
//     }
//   }, [moduleId])

//   // Create content array from sections and quiz
//   const getContentArray = () => {
//     if (!module) return []
    
//     const sections = module.content.sections || []
//     const quiz = module.content.quiz || []
    
//     // Convert sections to content format and add quiz as final step
//     const sectionContent = sections.map(section => ({
//       type: section.type,
//       title: section.title,
//       content: section.content,
//       interactiveData: section.interactiveData
//     }))
    
//     if (quiz.length > 0) {
//       sectionContent.push({
//         type: 'quiz',
//         title: 'Quiz Time!',
//         questions: quiz
//       })
//     }
    
//     return sectionContent
//   }

//   const contentArray = getContentArray()
//   const progress = contentArray.length > 0 ? ((currentStep + 1) / contentArray.length) * 100 : 0

//   // Handle quiz answer selection
//   const handleQuizAnswer = (questionIndex, answerIndex) => {
//     const newAnswers = [...quizAnswers]
//     newAnswers[questionIndex] = answerIndex
//     setQuizAnswers(newAnswers)
//   }

//   // Submit quiz
//   const handleQuizSubmit = async () => {
//     try {
//       const response = await apiCall(`http://localhost:5001/api/modules/${moduleId}/quiz`, {
//         method: 'POST',
//         body: JSON.stringify({ answers: quizAnswers })
//       })
      
//       if (response.success) {
//         setQuizResults(response)
//         setShowQuizResult(true)
//       }
//     } catch (err) {
//       setError('Failed to submit quiz: ' + err.message)
//     }
//   }

//   // Handle navigation
//   const handleNext = () => {
//     if (currentStep < contentArray.length - 1) {
//       setCurrentStep(currentStep + 1)
//       setShowQuizResult(false)
//     } else {
//       completeModule()
//     }
//   }

//   const handlePrevious = () => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1)
//       setShowQuizResult(false)
//     }
//   }

//   // Complete module
//   const completeModule = async () => {
//     try {
//       const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000 / 60) : module.estimatedTime
//       const quizScore = quizResults ? quizResults.score : 0
      
//       const response = await apiCall(`http://localhost:5001/api/modules/${moduleId}/complete`, {
//         method: 'POST',
//         body: JSON.stringify({ 
//           quizScore,
//           timeSpent
//         })
//       })
      
//       if (response.success) {
//         setCompleted(true)
//         setCompletionData(response)
//       }
//     } catch (err) {
//       setError('Failed to complete module: ' + err.message)
//     }
//   }

//   // Render different content types
//   const renderContent = (content) => {
//     switch (content.type) {
//       case 'text':
//         return (
//           <div>
//             {content.title && (
//               <Typography variant="h5" className="font-semibold mb-4">
//                 {content.title}
//               </Typography>
//             )}
//             <div 
//               className="text-lg leading-relaxed prose prose-lg max-w-none"
//               dangerouslySetInnerHTML={{ __html: content.content }}
//             />
//           </div>
//         )

//       case 'interactive':
//         return (
//           <Box className="text-center py-8">
//             <CalculatorIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
//             <Typography variant="h5" className="font-semibold mb-2">
//               {content.title}
//             </Typography>
//             <Typography variant="body1" color="text.secondary" className="mb-4">
//               {content.content}
//             </Typography>
//             <Button 
//               variant="contained" 
//               className="bg-blue-600 hover:bg-blue-700"
//               startIcon={<PlayIcon />}
//             >
//               Launch {content.interactiveData?.type === 'budget_planner' ? 'Budget Planner' : 'Tool'}
//             </Button>
//           </Box>
//         )

//       case 'quiz':
//         return (
//           <Box className="space-y-6">
//             <Typography variant="h5" className="font-semibold mb-4">
//               {content.title}
//             </Typography>
            
//             {content.questions.map((question, questionIndex) => (
//               <Card key={questionIndex} className="p-4 border-2 border-gray-100">
//                 <Typography variant="h6" className="font-semibold mb-4">
//                   Question {questionIndex + 1}: {question.question}
//                 </Typography>
                
//                 <div className="space-y-2">
//                   {question.options.map((option, optionIndex) => (
//                     <Button
//                       key={optionIndex}
//                       fullWidth
//                       variant="outlined"
//                       onClick={() => handleQuizAnswer(questionIndex, optionIndex)}
//                       className={`text-left normal-case p-4 ${
//                         quizAnswers[questionIndex] === optionIndex
//                           ? 'border-blue-500 bg-blue-50'
//                           : 'border-gray-200 hover:border-gray-300'
//                       } ${
//                         showQuizResult && quizResults
//                           ? optionIndex === question.correctAnswer
//                             ? 'border-green-500 bg-green-50'
//                             : quizAnswers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer
//                             ? 'border-red-500 bg-red-50'
//                             : ''
//                           : ''
//                       }`}
//                     >
//                       {option}
//                     </Button>
//                   ))}
//                 </div>
                
//                 {showQuizResult && quizResults && (
//                   <Box className="mt-4 p-4 rounded-lg bg-gray-50">
//                     <Typography variant="body2" className="font-semibold mb-2">
//                       {quizResults.results[questionIndex]?.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {question.explanation}
//                     </Typography>
//                   </Box>
//                 )}
//               </Card>
//             ))}
            
//             {!showQuizResult && quizAnswers.every(answer => answer !== null) && (
//               <Button 
//                 variant="contained" 
//                 onClick={handleQuizSubmit} 
//                 className="mt-4"
//                 fullWidth
//               >
//                 Submit Quiz
//               </Button>
//             )}
            
//             {showQuizResult && quizResults && (
//               <Alert severity={quizResults.score >= 70 ? 'success' : 'warning'} className="mt-4">
//                 <Typography variant="h6">
//                   Quiz Score: {quizResults.score}%
//                 </Typography>
//                 <Typography variant="body2">
//                   You got {quizResults.correctAnswers} out of {quizResults.totalQuestions} questions correct.
//                 </Typography>
//               </Alert>
//             )}
//           </Box>
//         )

//       default:
//         return <Typography>Unknown content type: {content.type}</Typography>
//     }
//   }

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
//         <CircularProgress size={60} />
//       </div>
//     )
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
//         <Card className="p-8 max-w-md mx-auto">
//           <Alert severity="error" className="mb-4">
//             {error}
//           </Alert>
//           <Button 
//             variant="contained" 
//             onClick={() => router.push('/dashboard')}
//             fullWidth
//           >
//             Back to Dashboard
//           </Button>
//         </Card>
//       </div>
//     )
//   }

//   // Module not found
//   if (!module) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
//         <Card className="p-8 max-w-md mx-auto text-center">
//           <Typography variant="h5" className="mb-4">Module not found</Typography>
//           <Button 
//             variant="contained" 
//             onClick={() => router.push('/dashboard')}
//           >
//             Back to Dashboard
//           </Button>
//         </Card>
//       </div>
//     )
//   }

//   const currentContent = contentArray[currentStep]

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//       {/* Header */}
//       <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <Link href="/dashboard" className="flex items-center space-x-2 no-underline">
//             <ChevronLeftIcon className="w-5 h-5" />
//             <span className="text-gray-700">Back to Dashboard</span>
//           </Link>
//           <div className="flex items-center space-x-4">
//             <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-md">
//               +{module.xpReward} XP
//             </Badge>
//             <Badge variant="outline" className="border-gray-300 text-gray-700 px-3 py-1 rounded-md">
//               {module.estimatedTime} min
//             </Badge>
//             <Badge variant="outline" className="border-orange-300 text-orange-700 px-3 py-1 rounded-md capitalize">
//               {module.difficulty}
//             </Badge>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8 max-w-4xl">
//         {!completed ? (
//           <>
//             {/* Progress */}
//             <div className="mb-8">
//               <div className="flex items-center justify-between mb-2">
//                 <Typography variant="h4" component="h1" className="font-bold">
//                   {module.title}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {currentStep + 1} of {contentArray.length}
//                 </Typography>
//               </div>
//               <LinearProgress 
//                 variant="determinate" 
//                 value={progress} 
//                 sx={{
//                   height: 8,
//                   borderRadius: 4,
//                   backgroundColor: 'rgba(0, 0, 0, 0.1)',
//                   '& .MuiLinearProgress-bar': {
//                     borderRadius: 4,
//                     backgroundColor: '#3b82f6'
//                   }
//                 }}
//               />
//               <Typography variant="body1" color="text.secondary" className="mt-2">
//                 {module.description}
//               </Typography>
//             </div>

//             {/* Content */}
//             <Card className="mb-8">
//               <CardContent className="p-8">
//                 {currentContent && renderContent(currentContent)}
//               </CardContent>
//             </Card>

//             {/* Navigation */}
//             <div className="flex justify-between">
//               <Button
//                 variant="outlined"
//                 onClick={handlePrevious}
//                 disabled={currentStep === 0}
//                 startIcon={<ChevronLeftIcon />}
//               >
//                 Previous
//               </Button>
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 disabled={
//                   currentContent?.type === 'quiz' && 
//                   (!showQuizResult || !quizResults)
//                 }
//                 endIcon={<ChevronRightIcon />}
//               >
//                 {currentStep === contentArray.length - 1 ? 'Complete Module' : 'Next'}
//               </Button>
//             </div>
//           </>
//         ) : (
//           /* Completion Screen */
//           <Card className="text-center">
//             <CardContent className="p-12">
//               <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
//               <Typography variant="h4" component="h2" className="font-bold mb-2">
//                 Module Complete! 🎉
//               </Typography>
//               <Typography variant="body1" color="text.secondary" className="mb-6">
//                 You've earned <strong>{completionData?.xpEarned || module.xpReward} XP</strong> and completed {module.title}!
//                 {completionData?.newLevel && (
//                   <><br/>🎊 You reached Level {completionData.newLevel}!</>
//                 )}
//               </Typography>
//               {quizResults && (
//                 <Typography variant="body2" color="text.secondary" className="mb-6">
//                   Final Quiz Score: {quizResults.score}%
//                 </Typography>
//               )}
//               <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                 <Button 
//                   variant="contained"
//                   component={Link}
//                   href="/dashboard"
//                 >
//                   Back to Dashboard
//                 </Button>
//                 <Button 
//                   variant="outlined"
//                   onClick={() => {
//                     // Try to navigate to next module - you might want to fetch the next module ID from your API
//                     router.push('/dashboard') // For now, just go back to dashboard
//                   }}
//                 >
//                   Continue Learning
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   )
// }

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


// Utility function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

// API functions
const apiCall = async (url, options = {}) => {
  const token = getAuthToken()
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }
  
  return response.json()
}

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
        const response = await apiCall(`http://localhost:5001/api/modules/${moduleId}`)
        if (response.success) {
          setModule(response.module)
          setQuizAnswers(new Array(response.module.content.quiz?.length || 0).fill(null))
          setStartTime(Date.now())
          
          // Start the module if not already started
          if (response.module.userProgress?.status === 'not_started') {
            await apiCall(`http://localhost:5001/api/modules/${moduleId}/start`, { method: 'POST' })
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
      const response = await apiCall(`http://localhost:5001/api/modules/${moduleId}/quiz`, {
        method: 'POST',
        body: JSON.stringify({ answers: quizAnswers })
      })
      
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
      
      const response = await apiCall(`http://localhost:5001/api/modules/${moduleId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ 
          quizScore,
          timeSpent
        })
      })
      
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

