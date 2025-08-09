const { calculateCompoundInterest, calculateEMI } = require('../utils/calculations');

// Compound Interest Calculator
const compoundInterestCalculator = async (req, res) => {
  try {
    const { principal, rate, time, compoundFrequency = 12 } = req.body;

    // Validate inputs
    if (!principal || !rate || !time) {
      return res.status(400).json({
        success: false,
        message: 'Principal, rate, and time are required'
      });
    }

    if (principal <= 0 || rate <= 0 || time <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Values must be positive numbers'
      });
    }

    const result = calculateCompoundInterest(principal, rate, time, compoundFrequency);

    // Generate year-by-year breakdown
    const yearlyBreakdown = [];
    for (let year = 1; year <= time; year++) {
      const yearResult = calculateCompoundInterest(principal, rate, year, compoundFrequency);
      yearlyBreakdown.push({
        year,
        amount: yearResult.finalAmount,
        interestEarned: yearResult.interestEarned
      });
    }

    res.json({
      success: true,
      result: {
        ...result,
        yearlyBreakdown,
        inputs: { principal, rate, time, compoundFrequency }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Calculation failed',
      error: error.message
    });
  }
};

// EMI Calculator
const emiCalculator = async (req, res) => {
  try {
    const { principal, rate, tenure } = req.body;

    // Validate inputs
    if (!principal || !rate || !tenure) {
      return res.status(400).json({
        success: false,
        message: 'Principal, rate, and tenure are required'
      });
    }

    if (principal <= 0 || rate <= 0 || tenure <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Values must be positive numbers'
      });
    }

    const emi = calculateEMI(principal, rate, tenure);
    const totalAmount = emi * tenure;
    const totalInterest = totalAmount - principal;

    // Generate payment schedule for first 12 months
    const paymentSchedule = [];
    let balance = principal;
    const monthlyRate = rate / (12 * 100);

    for (let month = 1; month <= Math.min(12, tenure); month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;

      paymentSchedule.push({
        month,
        emi: Math.round(emi * 100) / 100,
        principalPayment: Math.round(principalPayment * 100) / 100,
        interestPayment: Math.round(interestPayment * 100) / 100,
        balance: Math.round(balance * 100) / 100
      });
    }

    res.json({
      success: true,
      result: {
        emi: Math.round(emi * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        paymentSchedule,
        inputs: { principal, rate, tenure }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'EMI calculation failed',
      error: error.message
    });
  }
};

// SIP Calculator
const sipCalculator = async (req, res) => {
  try {
    const { monthlyAmount, rate, years } = req.body;
    
    if (!monthlyAmount || !rate || !years) {
      return res.status(400).json({
        success: false,
        message: 'Monthly amount, rate, and years are required'
      });
    }

    if (monthlyAmount <= 0 || rate <= 0 || years <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Values must be positive numbers'
      });
    }

    const months = years * 12;
    const monthlyRate = rate / (12 * 100);
    
    // SIP formula: M * [((1 + r)^n - 1) / r] * (1 + r)
    const maturityAmount = monthlyAmount * 
      (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    
    const totalInvested = monthlyAmount * months;
    const totalReturns = maturityAmount - totalInvested;

    // Year-wise breakdown
    const yearlyBreakdown = [];
    for (let year = 1; year <= years; year++) {
      const yearMonths = year * 12;
      const yearMaturity = monthlyAmount * 
        (((Math.pow(1 + monthlyRate, yearMonths) - 1) / monthlyRate) * (1 + monthlyRate));
      const yearInvested = monthlyAmount * yearMonths;
      
      yearlyBreakdown.push({
        year,
        invested: yearInvested,
        maturityAmount: Math.round(yearMaturity * 100) / 100,
        returns: Math.round((yearMaturity - yearInvested) * 100) / 100
      });
    }

    res.json({
      success: true,
      result: {
        maturityAmount: Math.round(maturityAmount * 100) / 100,
        totalInvested,
        totalReturns: Math.round(totalReturns * 100) / 100,
        yearlyBreakdown,
        inputs: { monthlyAmount, rate, years }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'SIP calculation failed',
      error: error.message
    });
  }
};

// Investment Advisor
const investmentAdvisor = async (req, res) => {
  try {
    const { amount, riskTolerance, timeHorizon, goal } = req.body;

    if (!amount || !riskTolerance || !timeHorizon) {
      return res.status(400).json({
        success: false,
        message: 'Amount, risk tolerance, and time horizon are required'
      });
    }

    // Simple investment suggestions based on risk and time
    let suggestions = [];

    if (riskTolerance === 'low') {
      suggestions = [
        { 
          type: 'Public Provident Fund (PPF)', 
          allocation: 40, 
          expectedReturn: '7-8%',
          description: 'Tax-free returns with 15-year lock-in',
          minAmount: 500,
          suitability: 'Best for long-term tax-free growth'
        },
        { 
          type: 'ELSS Mutual Funds', 
          allocation: 30, 
          expectedReturn: '10-12%',
          description: 'Tax-saving equity funds with 3-year lock-in',
          minAmount: 500,
          suitability: 'Good for tax savings with growth potential'
        },
        { 
          type: 'Debt Mutual Funds', 
          allocation: 30, 
          expectedReturn: '6-8%',
          description: 'Low-risk funds investing in bonds',
          minAmount: 1000,
          suitability: 'Safe parking for short to medium term'
        }
      ];
    } else if (riskTolerance === 'medium') {
      suggestions = [
        { 
          type: 'Diversified Equity Funds', 
          allocation: 50, 
          expectedReturn: '12-15%',
          description: 'Well-balanced equity mutual funds',
          minAmount: 500,
          suitability: 'Balanced risk-reward for medium term'
        },
        { 
          type: 'ELSS', 
          allocation: 30, 
          expectedReturn: '10-12%',
          description: 'Tax-saving with good returns',
          minAmount: 500,
          suitability: 'Perfect for students - tax benefits + growth'
        },
        { 
          type: 'Index Funds', 
          allocation: 20, 
          expectedReturn: '10-13%',
          description: 'Low-cost broad market exposure',
          minAmount: 500,
          suitability: 'Simple, low-cost diversification'
        }
      ];
    } else {
      suggestions = [
        { 
          type: 'Large Cap Equity Funds', 
          allocation: 40, 
          expectedReturn: '12-15%',
          description: 'Stable large company stocks',
          minAmount: 500,
          suitability: 'Good foundation for aggressive portfolio'
        },
        { 
          type: 'Mid/Small Cap Funds', 
          allocation: 35, 
          expectedReturn: '15-20%',
          description: 'Higher growth potential, higher risk',
          minAmount: 500,
          suitability: 'High growth for long-term wealth building'
        },
        { 
          type: 'Sectoral/Thematic Funds', 
          allocation: 25, 
          expectedReturn: '12-25%',
          description: 'Focused on specific sectors like tech, pharma',
          minAmount: 1000,
          suitability: 'For those who understand market sectors'
        }
      ];
    }

    // Calculate suggested amounts for each investment type
    const suggestionsWithAmounts = suggestions.map(suggestion => ({
      ...suggestion,
      suggestedAmount: Math.round((amount * suggestion.allocation) / 100)
    }));

    // Generate personalized advice based on time horizon
    let advice = '';
    if (timeHorizon < 3) {
      advice = 'For short-term goals under 3 years, prioritize capital protection with debt funds and FDs. Avoid equity investments for short-term needs.';
    } else if (timeHorizon < 7) {
      advice = 'Medium-term goals (3-7 years) benefit from a balanced approach. Mix equity and debt based on your risk appetite.';
    } else {
      advice = 'Long-term goals (7+ years) can handle more equity exposure. Start SIPs early to benefit from rupee cost averaging.';
    }

    // Add goal-specific advice
    if (goal) {
      switch (goal.toLowerCase()) {
        case 'laptop':
        case 'phone':
          advice += ' For gadgets, consider saving in liquid funds for easy access.';
          break;
        case 'education':
        case 'mba':
          advice += ' For education funding, consider education loans with SIPs for remaining amount.';
          break;
        case 'house':
        case 'car':
          advice += ' For big-ticket items, combine SIPs with goal-based savings accounts.';
          break;
      }
    }

    res.json({
      success: true,
      suggestions: suggestionsWithAmounts,
      advice,
      recommendation: `Based on your ${riskTolerance} risk tolerance and ₹${amount} investment amount for ${timeHorizon} years, here's your personalized portfolio.`,
      disclaimer: 'This is for educational purposes only. Past performance does not guarantee future returns. Please consult a financial advisor for personalized advice.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate investment advice',
      error: error.message
    });
  }
};

module.exports = {
  compoundInterestCalculator,
  emiCalculator,
  sipCalculator,
  investmentAdvisor
};
