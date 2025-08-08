const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(50).required()
});

const budgetSchema = Joi.object({
  income: Joi.array().items(Joi.object({
    source: Joi.string().required(),
    amount: Joi.number().positive().required(),
    frequency: Joi.string().valid('monthly', 'weekly', 'one-time').required()
  })),
  expenses: Joi.array().items(Joi.object({
    category: Joi.string().required(),
    budgeted: Joi.number().positive().required(),
    actual: Joi.number().min(0).default(0)
  }))
});

const goalSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500),
  targetAmount: Joi.number().positive().required(),
  deadline: Joi.date().greater('now').required(),
  category: Joi.string().required()
});

module.exports ={
    goalSchema, budgetSchema, registerSchema
  };