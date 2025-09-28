'use client'
 
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Badge,
  Divider,
  Avatar,
  CircularProgress,
  Container,
  Grid,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Link as MuiLink,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  SmartToy as BotIcon,
  Person as UserIcon,
  Send as SendIcon,
  EmojiObjects as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Savings as PiggyBankIcon,
  CreditCard as CreditCardIcon,
  Link as LinkIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Stop as StopIcon
} from '@mui/icons-material'
import Link from 'next/link'
import { useTheme } from '../../contexts/ThemeContext'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { logout } from '@/services/authServices';
import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  sendMessageToAI,
  getChatHistory as fetchChatHistory,
  clearChatHistory,
  analyzeBudgetWithAI,
  getLearningPath,
  getQuickTip,
  getStockAnalysis,
  EXPERT_OPTIONS
} from '@/services/chatServices'
import { getBudget } from '@/services/budgetServices'
import useAuth from '@/hooks/useAuth'
 
 
export default function MentorPage() {
 
  useAuth();
  const pathname = usePathname();
 
  const isActive = (path) => {
    return pathname === path;
  };
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      content: "Hi! I'm your AI Financial Mentor. I'm here to help you with budgeting, saving, investing, and any other money questions you have as a student. What would you like to learn about today?",
      sender: 'ai',
      timestamp: new Date(),
      expandedSources: false
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedExpert, setSelectedExpert] = useState('default')
  const [isLoading, setIsLoading] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const messagesEndRef = useRef(null)
  const [isMounted, setIsMounted] = useState(false)

  // Voice recognition states
  const [isListening, setIsListening] = useState(false)
  const [speechRecognition, setSpeechRecognition] = useState(null)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [showVoiceError, setShowVoiceError] = useState(false)
 
  const LOCAL_STORAGE_KEY = 'mentorChatMessages'

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        
        try {
          const recognition = new SpeechRecognition();
          
          // Configure recognition settings
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          recognition.maxAlternatives = 1;

          // Handle speech recognition results
          recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }

            // Update input with final transcript, show interim in real-time
            if (finalTranscript) {
              setInputMessage(prev => {
                const newMessage = prev + finalTranscript + ' ';
                return newMessage.trim();
              });
            }
          };

          // Handle recognition start
          recognition.onstart = () => {
            console.log('Speech recognition started');
            setVoiceError('');
            setShowVoiceError(false);
          };

          // Handle recognition end
          recognition.onend = () => {
            console.log('Speech recognition ended');
            setIsListening(false);
          };

          // Handle recognition errors
          recognition.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
            setIsListening(false);
            
            let errorMessage = 'Speech recognition failed. ';
            let showError = true;
            
            switch (event.error) {
              case 'no-speech':
                errorMessage += 'No speech was detected. Please try again.';
                break;
              case 'audio-capture':
                errorMessage += 'No microphone was found. Please check your microphone settings.';
                break;
              case 'not-allowed':
                errorMessage += 'Microphone access was denied. Please allow microphone access and try again.';
                break;
              case 'network':
                errorMessage += 'Unable to connect to speech service. Please check your internet connection and try again.';
                // Don't show error immediately for network issues, let user try again
                showError = false;
                break;
              case 'service-not-allowed':
                errorMessage += 'Speech service is not available. Please try typing instead.';
                break;
              case 'bad-grammar':
                errorMessage += 'Grammar error in speech recognition. Please try again.';
                showError = false;
                break;
              case 'language-not-supported':
                errorMessage += 'Language not supported. Switching to English.';
                break;
              default:
                errorMessage += 'Please try again or use typing instead.';
                showError = false;
            }
            
            if (showError) {
              setVoiceError(errorMessage);
              setShowVoiceError(true);
            }
          };

          setSpeechRecognition(recognition);
        } catch (error) {
          console.warn('Failed to initialize speech recognition:', error);
          setSpeechSupported(false);
        }
      } else {
        setSpeechSupported(false);
        console.log('Speech Recognition API not supported in this browser');
      }
    }
  }, []);

  // Voice recognition functions
  const startListening = () => {
    if (speechRecognition && speechSupported && !isListening) {
      try {
        // Clear any previous errors
        setVoiceError('');
        setShowVoiceError(false);
        
        // Reset recognition settings
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.lang = 'en-US';
        
        setIsListening(true);
        speechRecognition.start();
      } catch (error) {
        console.warn('Error starting speech recognition:', error);
        setIsListening(false);
        setVoiceError('Failed to start speech recognition. Please try again.');
        setShowVoiceError(true);
      }
    }
  };

  const stopListening = () => {
    if (speechRecognition && isListening) {
      try {
        speechRecognition.stop();
        setIsListening(false);
      } catch (error) {
        console.warn('Error stopping speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognition && isListening) {
        speechRecognition.stop();
      }
    };
  }, [speechRecognition, isListening]);
 
  const saveMessagesToLocal = (msgs) => {
    try {
      const serializable = msgs.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serializable))
    } catch (e) {
    }
  }
 
  const loadMessagesFromLocal = () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length === 0) return null
      return parsed.map(m => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
      }))
    } catch (e) {
      return null
    }
  }
 
  const clearLocalMessages = () => {
    try { localStorage.removeItem(LOCAL_STORAGE_KEY) } catch (e) { /* ignore */ }
  }
 
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyRes = await fetchChatHistory();
        if (historyRes?.success && Array.isArray(historyRes.conversation) && historyRes.conversation.length > 0) {
          const mapped = historyRes.conversation.map((item, index) => ({
            id: `${index}-${item.timestamp}`,
            content: item.message,
            sender: item.role === 'assistant' ? 'ai' : 'user',
            timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
          }));
          setMessages(mapped);
          return;
        }
        // fallback to local storage if server has no history
        const localMsgs = loadMessagesFromLocal();
        if (localMsgs) setMessages(localMsgs)
      } catch (err) {
        // fallback to local storage on failure
        const localMsgs = loadMessagesFromLocal();
        if (localMsgs) setMessages(localMsgs)
      }
    };
    loadHistory();
  }, [])
 
  useEffect(() => {
    // persist messages locally except the default single welcome message
    if (messages && (messages.length > 1 || (messages[0]?.id !== 'welcome'))) {
      saveMessagesToLocal(messages)
    }
  }, [messages])
 
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, isLoading])
 
  useEffect(() => { setIsMounted(true) }, [])
 
  const formatTime = (value) => {
    try {
      const date = value instanceof Date ? value : new Date(value)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    } catch (_e) {
      return ''
    }
  }

  const quickQuestions = [
    { icon: PiggyBankIcon, text: "How much should I save each month?", category: "Savings" },
    { icon: TrendingUpIcon, text: "What's the best investment for students?", category: "Investing" },
    { icon: CreditCardIcon, text: "Should I get a credit card?", category: "Credit" },
    { icon: LightbulbIcon, text: "How do I start budgeting?", category: "Budgeting" }
  ]
 
  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    // Stop listening when sending message
    if (isListening) {
      stopListening();
    }
 
    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      expert: selectedExpert,
      timestamp: new Date()
    }
 
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    saveMessagesToLocal(updatedMessages)
    setInputMessage('')
    setIsLoading(true)
 
    try {
      const response = await sendMessageToAI(inputMessage, null, selectedExpert)
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content || response.message,
        sender: 'ai',
        expert: selectedExpert,
        timestamp: new Date(),
        sources: response.sources || [],
        expandedSources: false
      }
      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)
      saveMessagesToLocal(finalMessages)
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        isError: true,
        timestamp: new Date()
      }
      const finalMessages = [...updatedMessages, errorMessage]
      setMessages(finalMessages)
      saveMessagesToLocal(finalMessages)
    } finally {
      setIsLoading(false)
    }
  }
 
  const handleQuickQuestion = (question) => {
    setInputMessage(question)
    // Don't auto-send, let user review the question first
  }
 
  const handleQuickTip = async () => {
    setIsLoading(true)
    try {
      const res = await getQuickTip();
      const tip = res?.tip || 'No tip available right now.'
      setMessages(prev => [...prev, { id: `tip-${Date.now()}`, content: `Quick Tip: ${tip}`, sender: 'ai', timestamp: new Date() }])
    } catch (e) {
      setMessages(prev => [...prev, { id: `tip-${Date.now()}`, content: 'Failed to fetch a quick tip.', sender: 'ai', timestamp: new Date() }])
    } finally {
      setIsLoading(false)
    }
  }
 
  const handleAnalyzeBudget = async () => {
    setIsLoading(true)
    try {
      const budgetRes = await getBudget();
      const b = budgetRes?.budget;
      const payload = {
        totalIncome: b?.health?.totalIncome ?? 0,
        expenses: b?.expenses || [],
        savingsRate: b?.health?.savingsRate ?? 0
      };
      const res = await analyzeBudgetWithAI(payload);
      const analysis = res?.analysis || 'No analysis available.'
      setMessages(prev => [...prev, { id: `analysis-${Date.now()}`, content: analysis, sender: 'ai', timestamp: new Date() }])
    } catch (e) {
      setMessages(prev => [...prev, { id: `analysis-${Date.now()}`, content: 'Failed to analyze your budget.', sender: 'ai', timestamp: new Date() }])
    } finally {
      setIsLoading(false)
    }
  }
 
  const handleLearningPath = async () => {
    setIsLoading(true)
    try {
      const res = await getLearningPath();
      const recsData = res?.recommendations;
      let content = 'No recommendations available right now.'
 
      if (Array.isArray(recsData) && recsData.length > 0) {
        content = `Recommended Learning Path:\n- ${recsData.join('\n- ')}`
      } else if (typeof recsData === 'string') {
        // Try to use the string directly; if it's empty, attempt to parse into bullets
        const trimmed = recsData.trim()
        if (trimmed) {
          // If the text already looks like a list, keep it. Otherwise, split lines into bullets.
          const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
          if (lines.length > 1) {
            content = `Recommended Learning Path:\n- ${lines.join('\n- ')}`
          } else {
            content = trimmed
          }
        }
      }
 
      setMessages(prev => [...prev, { id: `recs-${Date.now()}`, content, sender: 'ai', timestamp: new Date() }])
    } catch (e) {
      setMessages(prev => [...prev, { id: `recs-${Date.now()}`, content: 'Failed to fetch learning recommendations.', sender: 'ai', timestamp: new Date() }])
    } finally {
      setIsLoading(false)
    }
  }
 
  const handleClearHistory = async () => {
    setIsLoading(true)
    try {
      await clearChatHistory();
      clearLocalMessages();
      setMessages([
        {
          id: 'welcome',
          content: "Hi! I'm your AI Financial Mentor. I'm here to help you with budgeting, saving, investing, and any other money questions you have as a student. What would you like to learn about today?",
          sender: 'ai',
          timestamp: new Date()
        }
      ])
    } catch (e) {
      setMessages(prev => [...prev, { id: `clear-${Date.now()}`, content: 'Failed to clear chat history.', sender: 'ai', timestamp: new Date() }])
    } finally {
      setIsLoading(false)
    }
  }
 
  const handleStockAnalysis = async () => {
    if (isLoading) return;
   
    const loadingMessage = {
      id: `loading-${Date.now()}`,
      content: 'Analyzing stock market data...',
      sender: 'ai',
      isLoading: true,
      timestamp: new Date()
    };
 
    const updatedMessages = [...messages, loadingMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
 
    try {
      const response = await getStockAnalysis('current stock status of india');
      const aiMessage = {
        id: Date.now().toString(),
        content: response.content,
        sender: 'ai',
        timestamp: new Date(),
        isStockAnalysis: true
      };
     
      // Remove loading message and add the actual response
      const finalMessages = [...messages, aiMessage];
      setMessages(finalMessages);
      saveMessagesToLocal(finalMessages);
    } catch (error) {
      console.error('Error fetching stock analysis:', error);
      const errorMessage = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error while fetching stock analysis. Please try again later.',
        sender: 'ai',
        isError: true,
        timestamp: new Date()
      };
      const finalMessages = [...messages, errorMessage];
      setMessages(finalMessages);
      saveMessagesToLocal(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // Close voice error snackbar
  const handleCloseVoiceError = () => {
    setShowVoiceError(false);
  };
 
  return (
    <Box className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-12">
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
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
 
      <Container maxWidth="lg" sx={{ pt: 4 }} >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }} className="font-bold mb-1 text-gray-900 dark:text-gray-100">
            AI Financial Mentor 🤖
          </Typography>
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400">
            Get personalized financial advice tailored for students
          </Typography>
        </Box>
 
        <Grid container spacing={1} sx={{ mb: 3 }}>
          <Grid item>
            <Button variant="outlined" onClick={handleQuickTip} disabled={isLoading}>Quick Tip</Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={handleAnalyzeBudget} disabled={isLoading}>Analyze My Budget</Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={handleLearningPath} disabled={isLoading}>Learning Path</Button>
          </Grid>
          <Grid item>
            <Button color="error" variant="outlined" onClick={handleClearHistory} disabled={isLoading}>Clear History</Button>
          </Grid>
        </Grid>
 
        {/* Quick Questions */}
        {messages.length === 1 && messages[0].id === 'welcome' && (
          <Card sx={{ mb: 4 }} className="bg-white dark:bg-gray-800">
            <CardHeader
              title={
                <Typography variant="h6" component="h2" className="text-gray-900 dark:text-gray-100">
                  Quick Questions to Get Started
                </Typography>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                {quickQuestions.map((question, index) => (
                  <Grid item xs={12} md={6} key={index} >
                    <Button
                      variant="outlined"
                      sx={{
                        height: 'auto',
                        p: 2,
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        width: '100%'
                      }}
                      onClick={() => handleQuickQuestion(question.text)}
                      startIcon={<question.icon sx={{ color: '#1976d2' }} />}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }} className="text-gray-900 dark:text-gray-100">
                          {question.text}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }} className="text-gray-600 dark:text-gray-400">
                          {question.category}
                        </Typography>
                      </Box>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}
 
        {/* Chat Messages */}
        <Card sx={{ mb: 4 }} className="bg-white dark:bg-gray-800">
          <CardContent sx={{ p: 0 }}>
            <Box sx={{
              height: 400,
              overflowY: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }} className="bg-white dark:bg-gray-800 dark:text-gray-100">
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                  className="bg-white dark:bg-gray-800 dark:text-gray-100"
                 
                >
                  <Box
                    sx={{
                      maxWidth: '80%',
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: message.sender === 'user' ? '#1976d2' : (theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f5f5f5'),
                      color: message.sender === 'user' ? 'white' : (theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'text.primary')
                    }}
                    className="bg-white dark:bg-gray-800 dark:text-gray-100"
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      {message.sender === 'ai' ? (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Avatar sx={{ bgcolor: message.isStockAnalysis ? 'success.main' : 'primary.main', mr: 2 }}>
                            {message.isStockAnalysis ? <TrendingUpIcon /> : <BotIcon />}
                          </Avatar>
                          <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  {message.expert ?
                                    (EXPERT_OPTIONS.find(e => e.value === message.expert)?.label || 'AI Assistant') :
                                    (message.isStockAnalysis ? 'Stock Market Expert' : 'AI Assistant')}
                                </Typography>
                                {message.expert && (
                                  <Chip
                                    size="small"
                                    label={message.expert.replace('-', ' ')}
                                    color={message.sender === 'ai' ? 'primary' : 'default'}
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                  />
                                )}
                              </Box>
                              {isMounted && message.timestamp && (
                                <Typography variant="caption" color="text.disabled">
                                  {formatTime(message.timestamp)}
                                </Typography>
                              )}
                            </Box>
                            {message.isLoading ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={20} />
                                <Typography>{message.content}</Typography>
                              </Box>
                            ) : message.isError ? (
                              <Typography color="error" sx={{ whiteSpace: 'pre-line' }}>
                                {message.content}
                              </Typography>
                            ) : (
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'background.paper',
                                  border: '1px solid',
                                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'divider',
                                  borderRadius: 2,
                                  '& pre': {
                                    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
                                    padding: '1rem',
                                    borderRadius: '4px',
                                    overflowX: 'auto'
                                  },
                                  '& code': {
                                    fontFamily: 'monospace',
                                    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
                                    padding: '0.2em 0.4em',
                                    borderRadius: '3px',
                                    fontSize: '0.9em'
                                  },
                                  '& table': {
                                    borderCollapse: 'collapse',
                                    width: '100%',
                                    margin: '1rem 0',
                                    '& th, & td': {
                                      border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
                                      padding: '8px',
                                      textAlign: 'left'
                                    },
                                    '& th': {
                                      backgroundColor: theme === 'dark' ? '#333' : '#f2f2f2'
                                    },
                                    '& tr:nth-of-type(even)': {
                                      backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                                    }
                                  },
                                  '& blockquote': {
                                    borderLeft: `4px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
                                    margin: '1rem 0',
                                    padding: '0 1rem',
                                    color: theme === 'dark' ? '#aaa' : '#666',
                                    fontStyle: 'italic'
                                  }
                                }}
                              >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
                               
                                {message.sources && message.sources.length > 0 && (
                                  <Box sx={{
                                    mt: 2,
                                    pt: 2,
                                    borderTop: `1px solid ${theme === 'dark' ? '#444' : '#eee'}`
                                  }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                      Sources ({message.sources.length})
                                    </Typography>
                                    <Box sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 1,
                                      maxHeight: '200px',
                                      overflowY: 'auto',
                                      pr: 1,
                                      '&::-webkit-scrollbar': {
                                        width: '6px',
                                      },
                                      '&::-webkit-scrollbar-track': {
                                        background: theme === 'dark' ? '#2a2a2a' : '#f1f1f1',
                                        borderRadius: '3px',
                                      },
                                      '&::-webkit-scrollbar-thumb': {
                                        background: theme === 'dark' ? '#555' : '#aaa',
                                        borderRadius: '3px',
                                      },
                                      '&::-webkit-scrollbar-thumb:hover': {
                                        background: theme === 'dark' ? '#777' : '#888',
                                      }
                                    }}>
                                      {message.sources.map((source, index) => (
                                        <Box
                                          key={index}
                                          sx={{
                                            p: 1.5,
                                            borderRadius: 1,
                                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
                                            }
                                          }}
                                        >
                                          <MuiLink
                                            href={source}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                              color: 'primary.main',
                                              fontSize: '0.85rem',
                                              textDecoration: 'none',
                                              display: 'block',
                                              '&:hover': {
                                                textDecoration: 'underline'
                                              },
                                              wordBreak: 'break-word',
                                              lineHeight: 1.4,
                                              mb: 0.5
                                            }}
                                          >
                                            {source}
                                          </MuiLink>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                                              fontSize: '0.75rem',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 0.5
                                            }}
                                          >
                                            <LinkIcon fontSize="inherit" />
                                            {new URL(source).hostname.replace('www.', '')}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              </Paper>
                            )}
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <UserIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 0.5 }} />
                          <Box sx={{ flex: 1 }} className="flex-1">
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }} className="text-gray-900 dark:text-gray-100">
                              {message.content}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                mt: 1,
                                display: 'block',
                                color: message.sender === 'user' ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'
                              }}
                              className="text-gray-600 dark:text-gray-400"
                              suppressHydrationWarning
                            >
                              {isMounted ? formatTime(message.timestamp) : ''}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
             
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }} className="bg-white dark:bg-gray-800 dark:text-gray-100">
                  <Box sx={{
                    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f5f5f5',
                    color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'text.primary',
                    p: 2,
                    borderRadius: 2,
                    maxWidth: '80%'
                  }} className="bg-white dark:bg-gray-800 dark:text-gray-100">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BotIcon sx={{ color: theme === 'dark' ? '#90caf9' : '#1976d2' }} />
                      <CircularProgress size={16} />
                    </Box>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>
          </CardContent>
        </Card>
 
        {/* Message Input */}
        <Card className="bg-white dark:bg-gray-800">
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <Select
                    value={selectedExpert}
                    onChange={(e) => setSelectedExpert(e.target.value)}
                    disabled={isLoading}
                    sx={{
                      '& .MuiSelect-select': {
                        color: theme === 'dark' ? 'white' : 'inherit',
                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'transparent',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.23)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.87)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(59, 130, 246, 0.8)'
                      }
                    }}
                  >
                    {EXPERT_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', width: '100%', position: 'relative' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Ask me anything about personal finance..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                    disabled={isLoading}
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': {
                        color: theme === 'dark' ? 'white' : 'inherit',
                        pr: speechSupported ? '48px' : '12px' // Add padding for mic button
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                        opacity: 1
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.87)'
                        },
                        '&:hover fieldset': {
                          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.87)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(59, 130, 246, 0.8)'
                        },
                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'transparent'
                      }
                    }}
                  />
                  {/* Voice Input Button */}
                  {speechSupported && (
                    <IconButton
                      onClick={toggleListening}
                      disabled={isLoading}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: isListening ? 'error.main' : 'primary.main',
                        backgroundColor: isListening ? 'error.light' : 'transparent',
                        '&:hover': {
                          backgroundColor: isListening ? 'error.light' : 'primary.light'
                        },
                        transition: 'all 0.2s ease',
                        animation: isListening ? 'pulse 1.5s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': {
                            transform: 'translateY(-50%) scale(1)',
                          },
                          '50%': {
                            transform: 'translateY(-50%) scale(1.1)',
                          },
                          '100%': {
                            transform: 'translateY(-50%) scale(1)',
                          },
                        }
                      }}
                      size="small"
                      title={isListening ? 'Stop listening' : 'Start voice input'}
                    >
                      {isListening ? <MicOffIcon /> : <MicIcon />}
                    </IconButton>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </Button>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }} className="text-gray-600 dark:text-gray-400">
                💡 Tip: Ask specific questions like "How much should I save for an emergency fund?" for better advice
              </Typography>
              {speechSupported && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MicIcon fontSize="inherit" />
                  {isListening ? 'Listening...' : 'Click mic to speak'}
                </Typography>
              )}
              {!speechSupported && (
                <Typography variant="caption" sx={{ color: 'warning.main' }}>
                  Voice input not supported in this browser
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Voice Error Snackbar */}
      <Snackbar
        open={showVoiceError}
        autoHideDuration={6000}
        onClose={handleCloseVoiceError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseVoiceError} severity="error" sx={{ width: '100%' }}>
          {voiceError}
        </Alert>
      </Snackbar>
    </Box>
  )
}