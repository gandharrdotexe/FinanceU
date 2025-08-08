'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Tabs,
  Tab,
  Box,
  Paper,
  Divider,
  IconButton
} from '@mui/material';
import {
  AddCircle as PlusCircle,
  Delete as Trash2,
  TrendingUp,
  TrendingDown,
  AttachMoney as DollarSign
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Link from 'next/link';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

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

const cardVariants = {
  hover: {
    y: -5,
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    transition: {
      duration: 0.3
    }
  }
};

export default function BudgetPlannerPage() {
    const { theme, toggleTheme } = useTheme();
  
  const [transactions, setTransactions] = useState([
    { id: '1', description: 'Part-time job', amount: 8000, category: 'Job', type: 'income', date: '2024-01-15' },
    { id: '2', description: 'Monthly allowance', amount: 3000, category: 'Allowance', type: 'income', date: '2024-01-01' },
    { id: '3', description: 'Food & groceries', amount: 4000, category: 'Food', type: 'expense', date: '2024-01-10' },
    { id: '4', description: 'Books & supplies', amount: 1500, category: 'Education', type: 'expense', date: '2024-01-08' },
    { id: '5', description: 'Entertainment', amount: 2000, category: 'Entertainment', type: 'expense', date: '2024-01-12' },
    { id: '6', description: 'Transport', amount: 800, category: 'Transport', type: 'expense', date: '2024-01-05' }
  ]);

  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense'
  });

  const [tabValue, setTabValue] = useState('overview');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  const budgetData = [
    { category: 'Needs (50%)', budgeted: totalIncome * 0.5, actual: expensesByCategory['Food'] + expensesByCategory['Transport'] + expensesByCategory['Education'] || 0 },
    { category: 'Wants (30%)', budgeted: totalIncome * 0.3, actual: expensesByCategory['Entertainment'] || 0 },
    { category: 'Savings (20%)', budgeted: totalIncome * 0.2, actual: balance > 0 ? balance : 0 }
  ];

  const addTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) return;

    const transaction = {
      id: Date.now().toString(),
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
      type: newTransaction.type,
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions([...transactions, transaction]);
    setNewTransaction({ description: '', amount: '', category: '', type: 'expense' });
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80"
      >
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <Link href="/dashboard" className="no-underline flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:text-white">
              FinanceU
            </span>
          </Link>
          <div className="flex items-center gap-2">
          <div className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-3 py-1 rounded-md text-sm font-medium">
            Student Budget Planner
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
          
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto p-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-8"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Budget Planner 💰</h1>
            <p className="text-gray-600 dark:text-gray-300">Track your student income and expenses with the 50/30/20 rule</p>
          </motion.div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} whileHover="hover">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Income</p>
                  <p className="text-2xl font-bold">
                    ₹{totalIncome.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover="hover">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Expenses</p>
                  <p className="text-2xl font-bold">
                    ₹{totalExpenses.toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-200" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover="hover">
            <div className={`text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow ${
              balance >= 0 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                : 'bg-gradient-to-r from-orange-500 to-orange-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${balance >= 0 ? 'text-blue-100' : 'text-orange-100'}`}>
                    Balance
                  </p>
                  <p className="text-2xl font-bold">
                    ₹{balance.toLocaleString()}
                  </p>
                </div>
                <DollarSign className={`w-8 h-8 ${balance >= 0 ? 'text-blue-200' : 'text-orange-200'}`} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        <Paper elevation={0} className="p-2 mb-6 dark:bg-gray-900/80 dark:text-white">
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#7C3AED',
                height: 3
              }
            }}
          >
            <Tab 
              value="overview" 
              label="Overview" 
              sx={{ 
                fontWeight: tabValue === 'overview' ? 'bold' : 'normal',
                color: tabValue === 'overview' ? '#7C3AED' : 'inherit'
              }} 
            />
            <Tab 
              value="transactions" 
              label="Transactions" 
              sx={{ 
                fontWeight: tabValue === 'transactions' ? 'bold' : 'normal',
                color: tabValue === 'transactions' ? '#7C3AED' : 'inherit'
              }} 
            />
            <Tab 
              value="budget" 
              label="50/30/20 Rule" 
              sx={{ 
                fontWeight: tabValue === 'budget' ? 'bold' : 'normal',
                color: tabValue === 'budget' ? '#7C3AED' : 'inherit'
              }} 
            />
            <Tab 
              value="add" 
              label="Add Transaction" 
              sx={{ 
                fontWeight: tabValue === 'add' ? 'bold' : 'normal',
                color: tabValue === 'add' ? '#7C3AED' : 'inherit'
              }} 
            />
          </Tabs>
        </Paper>

        {tabValue === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <Card className="dark:bg-gray-900/80 dark:text-white">
              <CardHeader
                title="Expense Breakdown"
                subheader="Where your money goes"
                className="dark:text-white"
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900/80 dark:text-white">
              <CardHeader
                title="Recent Transactions"
                subheader="Your latest financial activity"
                className="dark:text-white"
                
              />
              <CardContent>
                <div className="grid gap-3 ">
                  {transactions.slice(-5).reverse().map((transaction) => (
                    <Paper 
                      key={transaction.id} 
                      elevation={1}
                      className="p-4 flex items-center justify-between dark:bg-gray-800/80 dark:text-white"
                    >
                      <div>
                        <Typography variant="body1" className="font-medium">
                          {transaction.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary dark:text-white">
                          {transaction.category} • {transaction.date}
                        </Typography>
                      </div>
                      <Typography 
                        variant="body1" 
                        className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                      </Typography>
                    </Paper>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {tabValue === 'transactions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="dark:bg-gray-900/80 dark:text-white">
              <CardHeader
                title="All Transactions"
                subheader="Manage your income and expenses"
                className="dark:text-white"
              />
              <CardContent>
                <div className="grid gap-3">
                  {transactions.map((transaction) => (
                    <Paper 
                      key={transaction.id}
                      elevation={1}
                      className="p-4 flex items-center justify-between dark:bg-gray-800/80 dark:text-white"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge 
                            color={transaction.type === 'income' ? 'primary' : 'secondary'}
                            badgeContent={transaction.category}
                            sx={{ 
                              '& .MuiBadge-badge': {
                                backgroundColor: transaction.type === 'income' ? '#3B82F6' : '#6B7280',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem'
                              }
                            }}
                          />
                          <Typography variant="body1" className="font-medium dark:text-white">
                            {transaction.description}
                          </Typography>
                        </div>
                        <Typography variant="body2" color="text.secondary" className="mt-2 dark:text-white">
                          {transaction.date}
                        </Typography>
                      </div>
                      <div className="flex items-center gap-3">
                        <Typography 
                          variant="body1" 
                          className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                        </Typography>
                        <IconButton
                          onClick={() => deleteTransaction(transaction.id)}
                          color="error"
                          size="small"
                        >
                          <Trash2 fontSize="small" />
                        </IconButton>
                      </div>
                    </Paper>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {tabValue === 'budget' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="dark:bg-gray-900/80 dark:text-white">
              <CardHeader
                title="50/30/20 Budget Rule"
                subheader="How well are you following the recommended budget allocation?"
                className="dark:text-white"
                />
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Bar dataKey="budgeted" fill="#3B82F6" name="Budgeted" />
                    <Bar dataKey="actual" fill="#10B981" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
                <Box className="mt-6 grid gap-4">
                  {budgetData.map((item, index) => (
                    <Paper 
                      key={index} 
                      elevation={0}
                      className="p-4 bg-gray-50 rounded-lg flex items-center justify-between dark:bg-gray-800/80 dark:text-white"
                    >
                      <Typography variant="body1" className="font-medium">
                        {item.category}
                      </Typography>
                      <div className="text-right">
                        <Typography variant="body2" color="text.secondary dark:text-white">
                          Budgeted: ₹{item.budgeted.toFixed(0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary dark:text-white">
                          Actual: ₹{item.actual.toFixed(0)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          className={`font-medium ${item.actual <= item.budgeted ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {item.actual <= item.budgeted ? '✅ On track' : '⚠️ Over budget'}
                        </Typography>
                      </div>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {tabValue === 'add' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="dark:bg-gray-900/80 dark:text-white">
              <CardHeader
                title="Add New Transaction"
                subheader="Record your income or expenses"
                className="dark:text-white"
                />
              <CardContent>
                <Box className="grid gap-6">
                  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <InputLabel htmlFor="type" className="dark:text-white">Type</InputLabel>
                      <Select
                        id="type"
                        fullWidth
                        value={newTransaction.type}
                        onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                        className="mt-2"
                      >
                        <MenuItem value="expense">Expense</MenuItem>
                        <MenuItem value="income">Income</MenuItem>
                      </Select>
                    </div>
                    <div>
                      <InputLabel htmlFor="amount" className="dark:text-white">Amount (₹)</InputLabel>
                      <TextField
                        id="amount"
                        type="number"
                        fullWidth
                        placeholder="0"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                  </Box>
                  <div>
                    <InputLabel htmlFor="description" className="dark:text-white">Description</InputLabel>
                    <TextField
                      id="description"
                      fullWidth
                      placeholder="e.g., Lunch at cafeteria"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <InputLabel htmlFor="category" className="dark:text-white" >Category</InputLabel>
                    <Select
                      id="category"
                      fullWidth
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                      className="mt-2 dark:text-white"
                    >
                      <MenuItem value="" className="dark:text-white">Select category</MenuItem>
                      {newTransaction.type === 'income' ? [
                        <MenuItem key="Job" value="Job">Part-time Job</MenuItem>,
                        <MenuItem key="Allowance" value="Allowance">Allowance</MenuItem>,
                        <MenuItem key="Freelance" value="Freelance">Freelance</MenuItem>,
                        <MenuItem key="Other" value="Other">Other Income</MenuItem>
                      ] : [
                        <MenuItem key="Food" value="Food">Food & Groceries</MenuItem>,
                        <MenuItem key="Transport" value="Transport">Transport</MenuItem>,
                        <MenuItem key="Education" value="Education">Books & Education</MenuItem>,
                        <MenuItem key="Entertainment" value="Entertainment">Entertainment</MenuItem>,
                        <MenuItem key="Shopping" value="Shopping">Shopping</MenuItem>,
                        <MenuItem key="Other" value="Other">Other Expenses</MenuItem>
                      ]}
                    </Select>
                  </div>
                  <Button 
                    onClick={addTransaction}
                    variant="contained"
                    fullWidth
                    startIcon={<PlusCircle />}
                    sx={{
                      background: 'linear-gradient(to right, #7C3AED, #6D28D9)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #6D28D9, #5B21B6)'
                      }
                    }}
                  >
                    Add Transaction
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}