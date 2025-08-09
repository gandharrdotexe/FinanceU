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
import { getBudget, getBudgetByMonth, updateTransactions, deleteTransaction, createOrUpdateBudget } from '@/services/budgetServices';
import { logout } from '@/services/authServices';
import { LogOut } from 'lucide-react';

import { usePathname } from 'next/navigation';




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
  const pathname = usePathname();
  
  const isActive = (path) => {
    return pathname === path;
  };

  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);
  const [formMonth, setFormMonth] = useState(new Date().toISOString().substring(0, 7));
  const [formIncome, setFormIncome] = useState([
    { source: 'allowance', amount: '', frequency: 'monthly' }
  ]);
  const [formExpenses, setFormExpenses] = useState([
    { category: 'food', budgeted: '', actual: '0' }
  ]);
  const [formGoals, setFormGoals] = useState([
    { name: '', targetAmount: '', savedAmount: '0', deadline: '', priority: 'medium' }
  ]);

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

  useEffect(() => {
    if (budgetData) {
      setFormMonth(budgetData.month || new Date().toISOString().substring(0, 7));
      setFormIncome(
        budgetData.income?.length
          ? budgetData.income.map((i) => ({
              source: i.source || 'allowance',
              amount: i.amount?.toString() || '',
              frequency: i.frequency || 'monthly'
            }))
          : [{ source: 'allowance', amount: '', frequency: 'monthly' }]
      );
      setFormExpenses(
        budgetData.expenses?.length
          ? budgetData.expenses.map((e) => ({
              category: e.category || 'food',
              budgeted: e.budgeted?.toString() || '',
              actual: (e.actual ?? 0).toString()
            }))
          : [{ category: 'food', budgeted: '', actual: '0' }]
      );
      setFormGoals(
        budgetData.goals?.length
          ? budgetData.goals.map((g) => ({
              name: g.name || '',
              targetAmount: g.targetAmount?.toString() || '',
              savedAmount: (g.savedAmount ?? 0).toString(),
              deadline: g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : '',
              priority: g.priority || 'medium'
            }))
          : [{ name: '', targetAmount: '', savedAmount: '0', deadline: '', priority: 'medium' }]
      );
    }
  }, [budgetData]);

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

  const handleSaveBudget = async () => {
    try {
      setSavingBudget(true);
      // Build payload from form state
      const payload = {
        month: formMonth,
        income: formIncome
          .filter((i) => i.source && i.amount !== '' && i.frequency)
          .map((i) => ({
            source: i.source.toLowerCase(),
            amount: parseFloat(i.amount),
            frequency: i.frequency.toLowerCase()
          })),
        expenses: formExpenses
          .filter((e) => e.category && e.budgeted !== '')
          .map((e) => ({
            category: e.category.toLowerCase(),
            budgeted: parseFloat(e.budgeted),
            actual: e.actual === '' ? 0 : parseFloat(e.actual)
          })),
        goals: formGoals
          .filter((g) => g.name && g.targetAmount !== '' && g.deadline)
          .map((g) => ({
            name: g.name,
            targetAmount: parseFloat(g.targetAmount),
            savedAmount: g.savedAmount === '' ? 0 : parseFloat(g.savedAmount),
            deadline: new Date(g.deadline).toISOString(),
            priority: g.priority.toLowerCase()
          }))
      };

      const response = await createOrUpdateBudget(payload);
      if (!response.success) {
        setError(response.message || 'Failed to save budget');
        setSuccessMessage('');
        return;
      }

      // Refresh budget and transactions from server
      const monthToFetch = payload.month || new Date().toISOString().substring(0, 7);
      const budgetResponse = await getBudgetByMonth(monthToFetch).catch(async () => {
        // fallback to current month if specific month is not found
        return await getBudget();
      });
      if (budgetResponse.success) {
        setBudgetData(budgetResponse.budget);

        const incomeTransactions = budgetResponse.budget.income.map((income) => ({
          id: `income-${income.source}-${Date.now()}`,
          description: `${income.source.charAt(0).toUpperCase() + income.source.slice(1)} Income`,
          amount: income.frequency === 'weekly' ? income.amount * 4 : income.amount,
          category: income.source.charAt(0).toUpperCase() + income.source.slice(1),
          type: 'income',
          date: new Date().toISOString().split('T')[0]
        }));

        const expenseTransactions = budgetResponse.budget.expenses.flatMap((expense) =>
          (expense.transactions || []).map((transaction) => ({
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

      setSuccessMessage(response.message || 'Budget saved successfully');
      setError('');
      setTabValue('overview');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid JSON or failed to save budget');
      setSuccessMessage('');
    } finally {
      setSavingBudget(false);
    }
  };

  // Form handlers
  const setIncomeField = (index, field, value) => {
    setFormIncome((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };
  const addIncomeRow = () => setFormIncome((prev) => [...prev, { source: 'allowance', amount: '', frequency: 'monthly' }]);
  const removeIncomeRow = (index) => setFormIncome((prev) => prev.filter((_, i) => i !== index));

  const setExpenseField = (index, field, value) => {
    setFormExpenses((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };
  const addExpenseRow = () => setFormExpenses((prev) => [...prev, { category: 'food', budgeted: '', actual: '0' }]);
  const removeExpenseRow = (index) => setFormExpenses((prev) => prev.filter((_, i) => i !== index));

  const setGoalField = (index, field, value) => {
    setFormGoals((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };
  const addGoalRow = () => setFormGoals((prev) => [...prev, { name: '', targetAmount: '', savedAmount: '0', deadline: '', priority: 'medium' }]);
  const removeGoalRow = (index) => setFormGoals((prev) => prev.filter((_, i) => i !== index));

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
      {/* <motion.header 
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
      </motion.header> */}

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
              value="createUpdate" 
              label="Create/Update Budget" 
              sx={{ 
                fontWeight: tabValue === 'createUpdate' ? 'bold' : 'normal',
                color: tabValue === 'createUpdate' ? '#7C3AED' : 'inherit'
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
                subheaderTypographyProps={{
                  className: "dark:text-gray-300"
                }}
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
                subheaderTypographyProps={{
                  className: "dark:text-gray-300"
                }}
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
                subheaderTypographyProps={{
                  className: "dark:text-gray-300"
                }}
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
                            
                            <Typography variant="body1" className="font-medium pl-2 dark:text-white">
                              {transaction.description}
                            </Typography>
                          </div>
                          <div className='flex items-center gap-3 mt-1'>
                            <Typography variant="body2" color="text.secondary" className="dark:text-gray-300">
                              {transaction.date}
                            </Typography>
                            
                            <span 
                              className={`px-2 py-1 text-xs font-medium rounded-md ${
                                transaction.type === 'income' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {transaction.category}
                            </span>
                          </div>
                          
                          
                          
                        </div>
                        <div className="flex items-center gap-3">
                          <Typography 
                            variant="body1" 
                            className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                          </Typography>
                          {/* <IconButton
                            onClick={() => deleteTransactionHandler(transaction.id, transaction.category)}
                            color="error"
                            size="small"
                          >
                            <Trash2 fontSize="small" />
                          </IconButton> */}
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
                subheaderTypographyProps={{
                  className: "dark:text-gray-300"
                }}
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

        {tabValue === 'createUpdate' && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="dark:bg-gray-900/80">
          <CardHeader
            title="Create/Update Budget"
            titleTypographyProps={{ 
              className: "text-gray-900 dark:text-white",
              sx: { color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#111827' }
            }}
            subheader="Fill your month, incomes, expenses and goals"
            subheaderTypographyProps={{ 
              className: "text-gray-600 dark:text-gray-300",
              sx: { color: (theme) => theme.palette.mode === 'dark' ? '#d1d5db' : '#4b5563' }
            }}
          />
          <div className="p-6 grid gap-6">
  {/* Month Input */}
  <div>
    <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Month (YYYY-MM)
    </label>
    <input
      id="month"
      type="month"
      value={formMonth}
      onChange={(e) => setFormMonth(e.target.value)}
      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 dark:text-white"
    />
  </div>

  <div className="border-t border-gray-200 dark:border-gray-700"></div>

  {/* Income Section */}
  <div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Income</h3>
    <div className="grid gap-4">
      {formIncome.map((row, idx) => (
        <div key={`income-${idx}`} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg">
          {/* Source Select */}
          <div className="md:col-span-3">
            <label htmlFor={`income-source-${idx}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Source
            </label>
            <select
              id={`income-source-${idx}`}
              value={row.source}
              onChange={(e) => setIncomeField(idx, 'source', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="allowance">Allowance</option>
              <option value="part-time">Part-time</option>
              <option value="scholarship">Scholarship</option>
              <option value="freelance">Freelance</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Amount Input */}
          <div className="md:col-span-3">
            <label htmlFor={`income-amount-${idx}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <input
              id={`income-amount-${idx}`}
              type="number"
              value={row.amount}
              onChange={(e) => setIncomeField(idx, 'amount', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Frequency Select */}
          <div className="md:col-span-3">
            <label htmlFor={`income-frequency-${idx}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency
            </label>
            <select
              id={`income-frequency-${idx}`}
              value={row.frequency}
              onChange={(e) => setIncomeField(idx, 'frequency', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="one-time">One-time</option>
            </select>
          </div>

          {/* Delete Button */}
          <div className="md:col-span-3 flex items-end">
            <button
              onClick={() => removeIncomeRow(idx)}
              disabled={formIncome.length === 1}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}

      {/* Add Income Button */}
      <button
        onClick={addIncomeRow}
        className="flex items-center justify-center gap-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
      >
        <PlusCircle className="w-5 h-5" />
        Add Income
      </button>
    </div>
  </div>

  <div className="border-t border-gray-200 dark:border-gray-700"></div>

  {/* Expenses Section */}
  <div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Expenses</h3>
    <div className="grid gap-4">
      {formExpenses.map((row, idx) => (
        <div key={`expense-${idx}`} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg">
          {/* Category Select */}
          <div className="md:col-span-3">
            <label htmlFor={`expense-category-${idx}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id={`expense-category-${idx}`}
              value={row.category}
              onChange={(e) => setExpenseField(idx, 'category', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="food">Food</option>
              <option value="books">Books</option>
              <option value="entertainment">Entertainment</option>
              <option value="transport">Transport</option>
              <option value="housing">Housing</option>
              <option value="utilities">Utilities</option>
              <option value="healthcare">Healthcare</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Budgeted Input */}
          <div className="md:col-span-3">
            <label htmlFor={`expense-budgeted-${idx}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Budgeted
            </label>
            <input
              id={`expense-budgeted-${idx}`}
              type="number"
              value={row.budgeted}
              onChange={(e) => setExpenseField(idx, 'budgeted', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Actual Input */}
          <div className="md:col-span-3">
            <label htmlFor={`expense-actual-${idx}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Actual
            </label>
            <input
              id={`expense-actual-${idx}`}
              type="number"
              value={row.actual}
              onChange={(e) => setExpenseField(idx, 'actual', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Delete Button */}
          <div className="md:col-span-3 flex items-end">
            <button
              onClick={() => removeExpenseRow(idx)}
              disabled={formExpenses.length === 1}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}

      {/* Add Expense Button */}
      <button
        onClick={addExpenseRow}
        className="flex items-center justify-center gap-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
      >
        <PlusCircle className="w-5 h-5" />
        Add Expense
      </button>
    </div>
  </div>

  <div className="border-t border-gray-200 dark:border-gray-700"></div>

  {/* Save Budget Button */}
  <button
    onClick={handleSaveBudget}
    disabled={savingBudget}
    className="flex items-center justify-center w-full rounded-md bg-gradient-to-r from-purple-600 to-indigo-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:from-purple-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
  >
    {savingBudget ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Saving...
      </>
    ) : (
      <>
        <PlusCircle className="w-5 h-5 mr-2" />
        Save Budget
      </>
    )}
  </button>
</div>
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
                subheaderTypographyProps={{
                  className: "dark:text-gray-300"
                }}
              />
            <div className="p-6">
  <div className="grid gap-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Type Select */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type
        </label>
        <select
          id="type"
          value={newTransaction.type}
          onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 dark:text-white"
        >
          <option value="expense" className="text-gray-900 dark:text-white">Expense</option>
          <option value="income" className="text-gray-900 dark:text-white">Income</option>
        </select>
      </div>

      {/* Amount Input */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amount (₹)
        </label>
        <input
          id="amount"
          type="number"
          placeholder="0"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </div>

    {/* Description Input */}
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Description
      </label>
      <input
        id="description"
        type="text"
        placeholder="e.g., Lunch at cafeteria"
        value={newTransaction.description}
        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
      />
    </div>

    {/* Category Select */}
    <div>
      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Category
      </label>
      <select
        id="category"
        value={newTransaction.category}
        onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-900 dark:text-white"
      >
        <option value="" className="text-gray-900 dark:text-white">Select category</option>
        {newTransaction.type === 'income' ? (
          <>
            <option value="Allowance" className="text-gray-900 dark:text-white">Allowance</option>
            <option value="Part-time" className="text-gray-900 dark:text-white">Part-time Job</option>
            <option value="Scholarship" className="text-gray-900 dark:text-white">Scholarship</option>
            <option value="Freelance" className="text-gray-900 dark:text-white">Freelance</option>
            <option value="Other" className="text-gray-900 dark:text-white">Other Income</option>
          </>
        ) : (
          <>
            <option value="Food" className="text-gray-900 dark:text-white">Food & Groceries</option>
            <option value="Transport" className="text-gray-900 dark:text-white">Transport</option>
            <option value="Books" className="text-gray-900 dark:text-white">Books & Education</option>
            <option value="Entertainment" className="text-gray-900 dark:text-white">Entertainment</option>
            <option value="Housing" className="text-gray-900 dark:text-white">Housing</option>
            <option value="Utilities" className="text-gray-900 dark:text-white">Utilities</option>
            <option value="Healthcare" className="text-gray-900 dark:text-white">Healthcare</option>
            <option value="Clothing" className="text-gray-900 dark:text-white">Clothing</option>
            <option value="Other" className="text-gray-900 dark:text-white">Other Expenses</option>
          </>
        )}
      </select>
    </div>

    {/* Add Transaction Button */}
    <button
      onClick={addTransaction}
      disabled={loading}
      className="flex items-center justify-center w-full rounded-md bg-gradient-to-r from-purple-600 to-indigo-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:from-purple-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Adding Transaction...
        </>
      ) : (
        <>
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Transaction
        </>
      )}
    </button>
  </div>
</div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}