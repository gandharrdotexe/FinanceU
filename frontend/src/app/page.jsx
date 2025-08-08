'use client' // This is needed for client-side interactivity

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Bot, Trophy, TrendingUp, Users } from 'lucide-react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import './globals.css'

export default function HomePage() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    // Apply the theme class to the document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save the theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const featureVariants = {
    hover: {
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 dark:border-gray-700"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinanceU
            </span>
          </div>
          <div className="flex items-center gap-4">
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
            <Link href="/dashboard">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium text-sm mb-8">
            🎓 Built for Students
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Master Your Money,
            <br />
            Level Up Your Future
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Learn financial literacy through interactive lessons, gamified challenges, and AI-powered guidance. 
            Perfect for students ready to take control of their financial journey.
          </motion.p>
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/dashboard">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-all duration-200 transform hover:scale-105">
                Start Learning Free
              </button>
            </Link>
            <Link href="/demo">
              <button className="border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-medium text-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                View Demo
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-12 dark:text-white"
        >
          Why Choose FinanceU?
        </motion.h2>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            {
              icon: <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />,
              title: "Interactive Learning",
              description: "Bite-sized lessons covering budgeting, investing, loans, and taxes with real-world scenarios"
            },
            {
              icon: <Trophy className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />,
              title: "Gamified Experience",
              description: "Earn XP points, unlock badges, and compete with friends on leaderboards"
            },
            {
              icon: <Target className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />,
              title: "Practical Tools",
              description: "Budget planner, goal setting, and expense tracking designed for student life"
            },
            {
              icon: <Bot className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />,
              title: "AI Mentor",
              description: "Get personalized recommendations and instant answers to your financial questions"
            },
            {
              icon: <TrendingUp className="w-12 h-12 text-orange-600 dark:text-orange-400 mb-4" />,
              title: "Visual Learning",
              description: "Interactive charts, simulations, and progress tracking to visualize your growth"
            },
            {
              icon: <Users className="w-12 h-12 text-pink-600 dark:text-pink-400 mb-4" />,
              title: "Community Driven",
              description: "Join challenges, share progress, and learn together with fellow students"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover="hover"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-0 dark:border-gray-700"
            >
              <div className="flex flex-col items-start">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-12 text-center text-white shadow-xl"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Financial Future?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who are already mastering their money with FinanceU
          </p>
          <Link href="/dashboard">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium text-lg transition-all duration-200 transform hover:scale-105">
              Start Your Journey Today
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm dark:border-gray-700"
      >
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 FinanceU. Built for students, by students. 🚀</p>
        </div>
      </motion.footer>
    </div>
  );
}