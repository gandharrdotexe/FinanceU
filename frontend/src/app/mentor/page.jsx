'use client'

import { useState } from 'react'
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
  Paper
} from '@mui/material'
import {
  SmartToy as BotIcon,
  Person as UserIcon,
  Send as SendIcon,
  EmojiObjects as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Savings as PiggyBankIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material'
import Link from 'next/link'
import { useTheme,toggleTheme } from '../../contexts/ThemeContext'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function MentorPage() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: "Hi! I'm your AI Financial Mentor. I'm here to help you with budgeting, saving, investing, and any other money questions you have as a student. What would you like to learn about today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { theme, toggleTheme } = useTheme()

  
  const quickQuestions = [
    { icon: PiggyBankIcon, text: "How much should I save each month?", category: "Savings" },
    { icon: TrendingUpIcon, text: "What's the best investment for students?", category: "Investing" },
    { icon: CreditCardIcon, text: "Should I get a credit card?", category: "Credit" },
    { icon: LightbulbIcon, text: "How do I start budgeting?", category: "Budgeting" }
  ]

  const handleSendMessage = async (content) => {
    if (!content.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(content),
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const getAIResponse = (question) => {
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('save') || lowerQuestion.includes('saving')) {
      return "Great question! As a student, I recommend following the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Even if you can only save ₹500-1000 per month, that's a fantastic start! The key is consistency. Would you like me to help you create a personalized savings plan?"
    }
    
    if (lowerQuestion.includes('invest') || lowerQuestion.includes('investment')) {
      return "For students, I recommend starting with low-risk options like SIP (Systematic Investment Plans) in mutual funds. You can start with as little as ₹500 per month! Focus on large-cap equity funds or balanced funds initially. Remember, time is your biggest advantage - starting early, even with small amounts, can lead to significant wealth creation due to compound interest."
    }
    
    if (lowerQuestion.includes('credit card')) {
      return "Credit cards can be useful for building credit history, but they require discipline! If you get one, follow these rules: 1) Never spend more than you can pay back immediately, 2) Always pay the full amount before the due date, 3) Keep your credit utilization below 30%. Consider starting with a student credit card with a low limit to build good habits."
    }
    
    if (lowerQuestion.includes('budget')) {
      return "Budgeting is the foundation of financial success! Start by tracking your expenses for a week to understand your spending patterns. Then use the 50/30/20 rule: 50% for essentials (food, transport, books), 30% for entertainment and wants, 20% for savings and investments. Use apps or a simple spreadsheet to track everything. Would you like help setting up your first budget?"
    }
    
    return "That's an interesting question! Personal finance can seem complex, but it's really about building good habits. Whether it's about budgeting, saving, investing, or managing debt, the key is to start small and be consistent. Could you tell me more specifically what aspect of finance you'd like to focus on? I'm here to provide personalized advice based on your situation as a student."
  }

  const handleQuickQuestion = (question) => {
    handleSendMessage(question)
  }

  return (
    <Box className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-12">
      {/* Header */}
      <Paper 
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
                  FinanceU
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
      </Paper>

      <Container maxWidth="lg" sx={{ pt: 4 }} >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }} className="font-bold mb-1 text-gray-900 dark:text-gray-100">
            AI Financial Mentor 🤖
          </Typography>
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400">
            Get personalized financial advice tailored for students
          </Typography>
        </Box>

        {/* Quick Questions */}
        {messages.length === 1 && (
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
                        <BotIcon sx={{ color: '#1976d2', mt: 0.5 }} />
                      ) : (
                        <UserIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 0.5 }} />
                      )}
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
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Box>
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
            </Box>
          </CardContent>
        </Card>

        {/* Message Input */}
        <Card className="bg-white dark:bg-gray-800">
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask me anything about personal finance..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                disabled={isLoading}
                size="small"
                className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:border-blue-500 dark:placeholder:text-gray-400 dark:focus:border-2 dark:text-gray-100"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSendMessage(inputMessage)}
                disabled={isLoading || !inputMessage.trim()}
                sx={{ minWidth: 56 }}
                className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <SendIcon />
              </Button>
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