'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link,
  TextField,
  Typography,
  ThemeProvider,
  createTheme
} from '@mui/material'
import NextLink from 'next/link'
import { useTheme } from '../../../contexts/ThemeContext'
import { login } from '@/services/authServices'
import { useRouter } from 'next/navigation';


const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { theme } = useTheme()

  // Create Material-UI theme based on current theme
  const muiTheme = createTheme({
    palette: {
      mode: theme,
      background: {
        default: theme === 'dark' ? '#111827' : '#f8fafc',
        paper: theme === 'dark' ? '#1f2937' : '#ffffff',
      },
      text: {
        primary: theme === 'dark' ? '#f9fafb' : '#111827',
        secondary: theme === 'dark' ? '#d1d5db' : '#6b7280',
      },
    },
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      console.log(data.success);
      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Login failed");
    }
  };
  
  
  return (
    <ThemeProvider theme={muiTheme}>
      <Box 
        sx={{
          minHeight: '100vh',
          background: theme === 'dark' 
            ? 'linear-gradient(to bottom right, #111827, #1f2937, #374151)'
            : 'linear-gradient(to bottom right, #EFF6FF, #E0E7FF, #EDE9FE)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  background: 'linear-gradient(to right, #2563EB, #7C3AED)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 'bold' }}>
                  F
                </Typography>
              </Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1, color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                Welcome back
              </Typography>
              <Typography variant="body1" sx={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
                Sign in to your FinanceU account
              </Typography>
            </Box>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card 
              sx={{ 
                backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                p: 3,
                borderRadius: 3,
                boxShadow: theme === 'dark' 
                  ? '0 1px 3px rgba(0,0,0,0.3)' 
                  : '0 1px 3px rgba(0,0,0,0.1)',
                border: theme === 'dark' ? '1px solid rgba(75, 85, 99, 0.3)' : 'none'
              }}
            >
              <form onSubmit={handleLogin}>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" variant="body2" htmlFor="email" sx={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    variant="outlined"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2563EB',
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography component="label" variant="body2" htmlFor="password" sx={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                      Password
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    id="password"
                    label="Password"
                    type="password"
                    variant="outlined"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2563EB',
                        },
                      },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(to right, #2563EB, #7C3AED)',
                    '&:hover': {
                      background: 'linear-gradient(to right, #1D4ED8, #6D28D9)'
                    },
                    py: 1.5,
                    mb: 2
                  }}
                >
                  Sign In
                </Button>
              </form>

              <Divider sx={{ my: 2, borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb' }} />

              <Typography variant="body2" textAlign="center" sx={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
                Don't have an account?{' '}
                <Link 
                  component={NextLink} 
                  href="/auth/signup" 
                  color="primary"
                  sx={{ fontWeight: 'medium', textDecoration: 'none' }}
                >
                  Sign up
                </Link>
              </Typography>
            </Card>
          </motion.div>
        </motion.div>
      </Box>
    </ThemeProvider>
  )
}

export default LoginPage