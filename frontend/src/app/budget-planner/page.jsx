'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, PlusCircle, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Link from 'next/link';

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

  const handleTabChange = (newValue) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="border-b border-gray-200 backdrop-blur-sm sticky top-0 z-50 bg-white/80"
      >
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <Link href="/dashboard" className="no-underline flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinanceU
            </span>
          </Link>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium">
            Student Budget Planner
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
            <h1 className="text-3xl font-bold mb-2">Budget Planner 💰</h1>
            <p className="text-gray-600">Track your student income and expenses with the 50/30/20 rule</p>
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
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Income</p>
                  <p className="text-2xl font-bold">₹{totalIncome.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover="hover">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-200" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover="hover">
            <div className={`bg-gradient-to-r ${balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white rounded-lg p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${balance >= 0 ? 'text-blue-100' : 'text-orange-100'}`}>Balance</p>
                  <p className="text-2xl font-bold">₹{balance.toLocaleString()}</p>
                </div>
                <DollarSign className={`w-8 h-8 ${balance >= 0 ? 'text-blue-200' : 'text-orange-200'}`} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-lg p-2 mb-6 shadow-sm">
          <div className="flex space-x-1">
            {['overview', 'transactions', 'budget', 'add'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  tabValue === tab 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'transactions' && 'Transactions'}
                {tab === 'budget' && '50/30/20 Rule'}
                {tab === 'add' && 'Add Transaction'}
              </button>
            ))}
          </div>
        </div>

        {tabValue === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
              <p className="text-gray-600 text-sm mb-4">Where your money goes</p>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
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
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <p className="text-gray-600 text-sm mb-4">Your latest financial activity</p>
              <div className="space-y-3">
                {transactions.slice(-5).reverse().map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-gray-500 text-sm">{transaction.category} • {transaction.date}</p>
                    </div>
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tabValue === 'transactions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">All Transactions</h3>
              <p className="text-gray-600 text-sm mb-4">Manage your income and expenses</p>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === 'income' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.category}
                        </span>
                        <p className="font-medium">{transaction.description}</p>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{transaction.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                      </p>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tabValue === 'budget' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">50/30/20 Budget Rule</h3>
              <p className="text-gray-600 text-sm mb-4">How well are you following the recommended budget allocation?</p>
              <div className="h-[400px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Bar dataKey="budgeted" fill="#3B82F6" name="Budgeted" />
                    <Bar dataKey="actual" fill="#10B981" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {budgetData.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <p className="font-medium">{item.category}</p>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Budgeted: ₹{item.budgeted.toFixed(0)}</p>
                      <p className="text-gray-600 text-sm">Actual: ₹{item.actual.toFixed(0)}</p>
                      <p className={`text-sm font-medium ${item.actual <= item.budgeted ? 'text-green-600' : 'text-red-600'}`}>
                        {item.actual <= item.budgeted ? '✅ On track' : '⚠️ Over budget'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tabValue === 'add' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Transaction</h3>
              <p className="text-gray-600 text-sm mb-4">Record your income or expenses</p>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    placeholder="e.g., Lunch at cafeteria"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {newTransaction.type === 'income' ? (
                      <>
                        <option value="Job">Part-time Job</option>
                        <option value="Allowance">Allowance</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Other">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="Food">Food & Groceries</option>
                        <option value="Transport">Transport</option>
                        <option value="Education">Books & Education</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Other">Other Expenses</option>
                      </>
                    )}
                  </select>
                </div>
                <button 
                  onClick={addTransaction}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add Transaction
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}