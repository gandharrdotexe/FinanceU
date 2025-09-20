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
  ListItemText
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
  Link as LinkIcon
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
 
  const LOCAL_STORAGE_KEY = 'mentorChatMessages'
 
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
 
  const quickQuestions = [
    { icon: PiggyBankIcon, text: "How much should I save each month?", category: "Savings" },
    { icon: TrendingUpIcon, text: "What's the best investment for students?", category: "Investing" },
    { icon: CreditCardIcon, text: "Should I get a credit card?", category: "Credit" },
    { icon: LightbulbIcon, text: "How do I start budgeting?", category: "Budgeting" }
  ]
 
  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!inputMessage.trim() || isLoading) return
 
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
    handleSendMessage(question)
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
 
  return (
    <Box className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-12">
      {/* Header */}
      {/* <Paper
        elevation={0}
        sx={{
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
        className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur-sm"
      >
        <Container maxWidth="lg">
          <Box
          className="flex items-center justify-between py-2"
          >
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Box className="flex items-center gap-1">
                <Box sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography className="text-white font-bold text-sm">
                    F
                  </Typography>
                </Box>
                    <Typography sx={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Vikas.AI
                </Typography>
              </Box>
            </Link>
            <div className="flex items-center gap-2">
            <div className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-3 py-1 rounded-md text-sm font-medium">
              Ai Mentor Online <BotIcon sx={{ fontSize: 16, mr: 0.5 }} />
            </div>
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
          </Box>
        </Container>
      </Paper> */}
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
              Vikas.AI
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
                      backgroundColor: message.sender === 'user' ? '#1976d2' : '#f5f5f5',
                      color: message.sender === 'user' ? 'white' : 'text.primary'
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
                              {message.timestamp && (
                                <Typography variant="caption" color="text.disabled">
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                  bgcolor: 'background.paper',
                                  border: '1px solid',
                                  borderColor: 'divider',
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
                              {isMounted ? (message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString() : new Date(message.timestamp).toLocaleTimeString()) : ''}
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
                    backgroundColor: '#f5f5f5',
                    color: 'text.primary',
                    p: 2,
                    borderRadius: 2,
                    maxWidth: '80%'
                  }} className="bg-white dark:bg-gray-800 dark:text-gray-100">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BotIcon sx={{ color: '#1976d2' }} />
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
                      color: theme === 'dark' ? 'white' : 'inherit'
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
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
              {/* <Button
                variant="outlined"
                color="secondary"
                onClick={handleStockAnalysis}
                disabled={isLoading}
                startIcon={<TrendingUpIcon />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Stock Analysis
              </Button> */}
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
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }} className="text-gray-600 dark:text-gray-400">
              💡 Tip: Ask specific questions like "How much should I save for an emergency fund?" for better advice
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}