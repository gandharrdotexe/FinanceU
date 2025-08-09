'use client'

import { useState, useEffect, use } from 'react';
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
  IconButton,
  FormControl
} from '@mui/material';
import {
  AddCircle as PlusCircle,
  Delete as Trash2,
  TrendingUp,
  TrendingDown,
  AttachMoney as DollarSign,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Link from 'next/link';
import { useTheme } from '../../contexts/ThemeContext';
import useAuth from '@/hooks/useAuth';
import { getBudget, updateTransactions, deleteTransaction } from '@/services/budgetServices';

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

  useAuth();
  const { theme, toggleTheme } = useTheme();

  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Transform backend data to frontend format
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense'
  });

  const [tabValue, setTabValue] = useState('overview');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setLoading(true);
        const data = await getBudget();
        if(data.success){
          setBudgetData(data.budget);
          
          // Transform income data to transactions
          const incomeTransactions = data.budget.income.map(income => ({
            id: `income-${income.source}-${Date.now()}`,
            description: `${income.source.charAt(0).toUpperCase() + income.source.slice(1)} Income`,
            amount: income.frequency === 'weekly' ? income.amount * 4 : income.amount,
            category: income.source.charAt(0).toUpperCase() + income.source.slice(1),
            type: 'income',
            date: new Date().toISOString().split('T')[0]
          }));

          // Transform expense transactions
          const expenseTransactions = data.budget.expenses.flatMap(expense => 
            expense.transactions.map(transaction => ({
              id: `expense-${expense.category}-${transaction._id || Date.now()}`,
              description: transaction.description,
              amount: transaction.amount,
              category: expense.category.charAt(0).toUpperCase() + expense.category.slice(1),
              type: 'expense',
              date: new Date(transaction.date).toISOString().split('T')[0]
            }))
          );

          // Combine all transactions
          const allTransactions = [...incomeTransactions, ...expenseTransactions];
          setTransactions(allTransactions);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch budget data');
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, []);

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

  // Sort transactions based on current sort settings
  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'category':
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      default:
        aValue = new Date(a.date);
        bValue = new Date(b.date);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Use budget data if available, otherwise use calculated values
  const budgetRuleData = budgetData ? [
    { 
      category: 'Needs (50%)', 
      budgeted: totalIncome * 0.5, 
      actual: (expensesByCategory['Food'] || 0) + (expensesByCategory['Transport'] || 0) + (expensesByCategory['Books'] || 0) + (expensesByCategory['Housing'] || 0) + (expensesByCategory['Utilities'] || 0) + (expensesByCategory['Healthcare'] || 0)
    },
    { 
      category: 'Wants (30%)', 
      budgeted: totalIncome * 0.3, 
      actual: (expensesByCategory['Entertainment'] || 0) + (expensesByCategory['Clothing'] || 0) + (expensesByCategory['Shopping'] || 0)
    },
    { 
      category: 'Savings (20%)', 
      budgeted: totalIncome * 0.2, 
      actual: balance > 0 ? balance : 0 
    }
  ] : [];

  const addTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) return;

    try {
      setLoading(true);
      
      // Only update database for expenses (as per the API endpoint)
      if (newTransaction.type === 'expense') {
        const response = await updateTransactions(
          newTransaction.category.toLowerCase(), // Convert to lowercase to match backend enum
          newTransaction.description,
          parseFloat(newTransaction.amount)
        );
        
        if (response.success) {
          // Refresh budget data from server
          const budgetResponse = await getBudget();
          if (budgetResponse.success) {
            setBudgetData(budgetResponse.budget);
            
            // Transform and update transactions
            const incomeTransactions = budgetResponse.budget.income.map(income => ({
              id: `income-${income.source}-${Date.now()}`,
              description: `${income.source.charAt(0).toUpperCase() + income.source.slice(1)} Income`,
              amount: income.frequency === 'weekly' ? income.amount * 4 : income.amount,
              category: income.source.charAt(0).toUpperCase() + income.source.slice(1),
              type: 'income',
              date: new Date().toISOString().split('T')[0]
            }));

            const expenseTransactions = budgetResponse.budget.expenses.flatMap(expense => 
              expense.transactions.map(transaction => ({
                id: `expense-${expense.category}-${transaction._id || Date.now()}`,
                description: transaction.description,
                amount: transaction.amount,
                category: expense.category.charAt(0).toUpperCase() + expense.category.slice(1),
                type: 'expense',
                date: new Date(transaction.date).toISOString().split('T')[0]
              }))
            );

            const allTransactions = [...incomeTransactions, ...expenseTransactions];
            setTransactions(allTransactions);
          }
        }
      } else {
        // For income transactions, just add to local state for now
        const transaction = {
          id: Date.now().toString(),
          description: newTransaction.description,
          amount: parseFloat(newTransaction.amount),
          category: newTransaction.category,
          type: newTransaction.type,
          date: new Date().toISOString().split('T')[0]
        };

        setTransactions([...transactions, transaction]);
      }
      
      // Reset form
      setNewTransaction({ description: '', amount: '', category: '', type: 'expense' });
      
      // Show success message
      setSuccessMessage('Transaction added successfully!');
      setError(''); // Clear any previous errors
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction');
      setSuccessMessage(''); // Clear any previous success messages
      console.error('Error adding transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransactionHandler = async (id, category) => {
    try {
      setLoading(true);
      
      // Find the transaction to get its details
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) return;
      
      // Only delete from database for expense transactions
      if (transaction.type === 'expense') {
        const response = await deleteTransaction(id, category);
        
        if (response.success) {
          // Refresh budget data from server
          const budgetResponse = await getBudget();
          if (budgetResponse.success) {
            setBudgetData(budgetResponse.budget);
            
            // Transform and update transactions
            const incomeTransactions = budgetResponse.budget.income.map(income => ({
              id: `income-${income.source}-${Date.now()}`,
              description: `${income.source.charAt(0).toUpperCase() + income.source.slice(1)} Income`,
              amount: income.frequency === 'weekly' ? income.amount * 4 : income.amount,
              category: income.source.charAt(0).toUpperCase() + income.source.slice(1),
              type: 'income',
              date: new Date().toISOString().split('T')[0]
            }));

            const expenseTransactions = budgetResponse.budget.expenses.flatMap(expense => 
              expense.transactions.map(transaction => ({
                id: `expense-${expense.category}-${transaction._id || Date.now()}`,
                description: transaction.description,
                amount: transaction.amount,
                category: expense.category.charAt(0).toUpperCase() + expense.category.slice(1),
                type: 'expense',
                date: new Date(transaction.date).toISOString().split('T')[0]
              }))
            );

            const allTransactions = [...incomeTransactions, ...expenseTransactions];
            setTransactions(allTransactions);
          }
        }
      } else {
        // For income transactions, just remove from local state
        setTransactions(transactions.filter(t => t.id !== id));
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete transaction');
      console.error('Error deleting transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your budget data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

        {/* Budget Health Indicator */}
        {budgetData && budgetData.health && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            className="mb-6"
          >
            <Card className="dark:bg-gray-900/80 dark:text-white">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h6" className="dark:text-white">Budget Health Score</Typography>
                  </div>
                  <div className="text-right">
                    <Typography variant="h4" className={`font-bold ${
                      budgetData.health.healthScore === "Excellent" ? 'text-green-600' :
                      budgetData.health.healthScore === "Good" ? 'text-blue-600' :
                      budgetData.health.healthScore === "Fair" ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {budgetData.health.healthScore}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
                {pieData.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No expense data available
                  </div>
                )}
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
                  {transactions.length > 0 ? (
                    transactions.slice(-5).reverse().map((transaction) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No transactions available
                    </div>
                  )}
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
                action={
                  <div className="flex items-center space-x-2">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="dark:text-white"
                        sx={{
                          '& .MuiSelect-select': { color: 'inherit' },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' }
                        }}
                      >
                        <MenuItem value="date">Date</MenuItem>
                        <MenuItem value="amount">Amount</MenuItem>
                        <MenuItem value="category">Category</MenuItem>
                        <MenuItem value="type">Type</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="text-purple-600 dark:text-purple-400"
                    >
                      {sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
                    </IconButton>
                  </div>
                }
              />
              <CardContent>
                <div className="grid gap-3">
                  {sortedTransactions.length > 0 ? (
                    sortedTransactions.map((transaction) => (
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
                            onClick={() => deleteTransactionHandler(transaction.id, transaction.category)}
                            color="error"
                            size="small"
                          >
                            <Trash2 fontSize="small" />
                          </IconButton>
                        </div>
                      </Paper>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No transactions available
                    </div>
                  )}
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
                {budgetRuleData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={budgetRuleData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${value}`} />
                        <Bar dataKey="budgeted" fill="#3B82F6" name="Budgeted" />
                        <Bar dataKey="actual" fill="#10B981" name="Actual" />
                      </BarChart>
                    </ResponsiveContainer>
                    <Box className="mt-6 grid gap-4">
                      {budgetRuleData.map((item, index) => (
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
                              className={`font-medium ${
                                item.category === 'Savings (20%)' 
                                  ? (item.actual >= item.budgeted ? 'text-green-600' : 'text-red-600')
                                  : (item.actual <= item.budgeted ? 'text-green-600' : 'text-red-600')
                              }`}
                            >
                              {item.category === 'Savings (20%)' 
                                ? (item.actual >= item.budgeted ? '✅ On track' : '⚠️ Under target')
                                : (item.actual <= item.budgeted ? '✅ On track' : '⚠️ Over budget')
                              }
                            </Typography>
                          </div>
                        </Paper>
                      ))}
                    </Box>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No budget data available
                  </div>
                )}
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
            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg dark:bg-green-900/50 dark:border-green-600 dark:text-green-300"
              >
                {successMessage}
              </motion.div>
            )}
            
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900/50 dark:border-red-600 dark:text-red-300"
              >
                ⚠️ {error}
              </motion.div>
            )}
            
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
                        <MenuItem key="Allowance" value="Allowance">Allowance</MenuItem>,
                        <MenuItem key="Part-time" value="Part-time">Part-time Job</MenuItem>,
                        <MenuItem key="Scholarship" value="Scholarship">Scholarship</MenuItem>,
                        <MenuItem key="Freelance" value="Freelance">Freelance</MenuItem>,
                        <MenuItem key="Other" value="Other">Other Income</MenuItem>
                      ] : [
                        <MenuItem key="Food" value="Food">Food & Groceries</MenuItem>,
                        <MenuItem key="Transport" value="Transport">Transport</MenuItem>,
                        <MenuItem key="Books" value="Books">Books & Education</MenuItem>,
                        <MenuItem key="Entertainment" value="Entertainment">Entertainment</MenuItem>,
                        <MenuItem key="Housing" value="Housing">Housing</MenuItem>,
                        <MenuItem key="Utilities" value="Utilities">Utilities</MenuItem>,
                        <MenuItem key="Healthcare" value="Healthcare">Healthcare</MenuItem>,
                        <MenuItem key="Clothing" value="Clothing">Clothing</MenuItem>,
                        <MenuItem key="Other" value="Other">Other Expenses</MenuItem>
                      ]}
                    </Select>
                  </div>
                  <Button 
                    onClick={addTransaction}
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <PlusCircle />}
                    sx={{
                      background: 'linear-gradient(to right, #7C3AED, #6D28D9)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #6D28D9, #5B21B6)'
                      },
                      '&:disabled': {
                        background: '#9CA3AF'
                      }
                    }}
                  >
                    {loading ? 'Adding Transaction...' : 'Add Transaction'}
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