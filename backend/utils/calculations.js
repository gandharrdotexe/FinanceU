const calculateCompoundInterest = (principal, rate, time, compoundFreq = 12) => {
    const amount = principal * Math.pow((1 + rate / (100 * compoundFreq)), compoundFreq * time);
    return {
      finalAmount: Math.round(amount * 100) / 100,
      interestEarned: Math.round((amount - principal) * 100) / 100
    };
  };
  
  const calculateEMI = (principal, rate, tenure) => {
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi * 100) / 100;
  };
  
  const calculateBudgetHealth = (income, expenses) => {
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.actual, 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = (savings / totalIncome) * 100;
    
    let healthScore = 'Poor';
    if (savingsRate >= 20) healthScore = 'Excellent';
    else if (savingsRate >= 10) healthScore = 'Good';
    else if (savingsRate >= 0) healthScore = 'Fair';
    
    return {
      totalIncome,
      totalExpenses,
      savings,
      savingsRate: Math.round(savingsRate * 100) / 100,
      healthScore
    };
  };

  module.exports = {
    calculateBudgetHealth, calculateEMI, calculateCompoundInterest
  };