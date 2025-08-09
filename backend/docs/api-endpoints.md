// API ENDPOINTS STRUCTURE
```js
//  AUTHENTICATION ROUTES
POST   /api/auth/register           // User registration
POST   /api/auth/login              // User login
GET    /api/auth/me                 // Get current user

// 👤  /api/user/profile            // Update user profile
PUT    /api/user/financial-profile  // Update financial profile
GET    /api/user/dashboard          // Get dashboard data

//  LEARNING MODULE ROUTES
GET    /api/modules                 // Get all modules
GET    /api/modules/:moduleId       // Get specific module
POST   /api/modules/:moduleId/start // Start module
POST   /api/modules/:moduleId/complete // Complete module
POST   /api/modules/:moduleId/quiz  // Submit quiz

//  BUDGET MANAGEMENT ROUTES
GET    /api/budget                  // Get current budget
POST   /api/budget                  // Create/update budget
POST   /api/budget/expense          // Add expense transaction
GET    /api/budget/analytics        // Get budget analytics

//  GOALS MANAGEMENT ROUTES
GET    /api/goals                   // Get user goals
POST   /api/goals                   // Create new goal
PUT    /api/goals/:goalId            // Update goal
POST   /api/goals/:goalId/milestone  // Add milestone to goal
DELETE /api/goals/:goalId            // Delete goal

//  GAMIFICATION ROUTES
GET    /api/gamification/progress   // Get user progress
GET    /api/gamification/leaderboard // Get leaderboard
GET    /api/gamification/achievements // Get user achievements
POST   /api/gamification/check-badges // Check for new badges
POST   /api/gamification/update-streak // Update user streak

//  BADGE ROUTES
GET    /api/badges                  // Get all badges
GET    /api/badges/:id              // Get badge by ID
GET    /api/badges/name/:name       // Get badges by name (partial match)
GET    /api/badges/category/:category // Get badges by category
GET    /api/badges/rarity/:rarity   // Get badges by rarity
POST   /api/badges/names            // Get badges by array of names

//  AI CHAT ROUTES
POST   /api/chat/message             // Send message to AI
GET    /api/chat/history             // Get chat history
POST   /api/chat/analyze-budget      // Analyze budget with AI
GET    /api/chat/learning-path       // Get learning path recommendations
GET    /api/chat/quick-tips          // Get quick financial tips
DELETE /api/chat/history             // Clear chat history

//  FINANCIAL TOOLS ROUTES
POST   /api/tools/compound-interest  // Compound interest calculator
POST   /api/tools/emi-calculator     // EMI calculator
POST   /api/tools/sip-calculator     // SIP calculator
POST   /api/tools/investment-advisor // Investment advisor

//  TESTING & UTILITY ROUTES
GET    /health                       // API health check
