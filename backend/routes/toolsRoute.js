const express = require('express');
const auth = require('../middleware/auth');
const { 
  compoundInterestCalculator, 
  emiCalculator, 
  investmentAdvisor 
} = require('../controllers/toolsController');

const router = express.Router();

// Compound Interest Calculator
router.post('/compound-interest', auth, compoundInterestCalculator);

// EMI Calculator
router.post('/emi-calculator', auth, emiCalculator);

// Investment Advisor
router.post('/investment-advisor', auth, investmentAdvisor);

// SIP Calculator
router.post('/sip-calculator', auth, async (req, res) => {
  try {
    const { monthlyAmount, rate, years } = req.body;
    
    if (!monthlyAmount || !rate || !years) {
      return res.status(400).json({
        success: false,
        message: 'Monthly amount, rate, and years are required'
      });
    }

    const months = years * 12;
    const monthlyRate = rate / (12 * 100);
    
    // SIP formula: M * [((1 + r)^n - 1) / r] * (1 + r)
    const maturityAmount = monthlyAmount * 
      (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    
    const totalInvested = monthlyAmount * months;
    const totalReturns = maturityAmount - totalInvested;

    res.json({
      success: true,
      result: {
        maturityAmount: Math.round(maturityAmount * 100) / 100,
        totalInvested,
        totalReturns: Math.round(totalReturns * 100) / 100,
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
});

module.exports = router;
