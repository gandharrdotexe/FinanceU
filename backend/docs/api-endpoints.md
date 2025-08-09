// API ENDPOINTS STRUCTURE
```js
// AUTHENTICATION ROUTES
POST   /api/auth/register       // User registration 
POST   /api/auth/login          // User login
POST   /api/auth/logout         // User logout
POST   /api/auth/refresh        // Refresh JWT token
POST   /api/auth/forgot-password // Password reset

// USER ROUTES
GET    /api/user/profile        // Get user profile
PUT    /api/user/profile        // Update user profile
GET    /api/user/dashboard      // Get dashboard data (progress, badges, etc.)
POST   /api/user/financial-profile // Set financial profile

// LEARNING MODULE ROUTES
GET    /api/modules             // Get all modules (with progress)
GET    /api/modules/[:id]         // Get specific module content
POST   /api/modules/[:id]/start   // Start a module
PUT    /api/modules/[:id]/progress // Update module progress
POST   /api/modules/[:id]/complete // Complete a module
GET    /api/modules/categories  // Get module categories

// QUIZ ROUTES
GET    /api/quiz/[:moduleId]      // Get quiz for module
POST   /api/quiz/[:moduleId]/submit // Submit quiz answers
GET    /api/quiz/results/[:moduleId] // Get quiz results

// GAMIFICATION ROUTES
GET    /api/badges              // Get all available badges
GET    /api/badges/earned       // Get user's earned badges
POST   /api/badges/check        // Check if user earned new badges
GET    /api/leaderboard         // Get leaderboard data
GET    /api/achievements        // Get user achievements

// BUDGET MANAGEMENT ROUTES
GET    /api/budget              // Get current month budget
POST   /api/budget              // Create/update budget
GET    /api/budget/[:month]       // Get specific month budget
POST   /api/budget/expense      // Add expense
PUT    /api/budget/expense/[:id]  // Update expense
DELETE /api/budget/expense/[:id]  // Delete expense

// GOAL MANAGEMENT ROUTES
GET    /api/goals               // Get user goals
POST   /api/goals               // Create new goal
PUT    /api/goals/[:id]           // Update goal
DELETE /api/goals/[:id]           // Delete goal
POST   /api/goals/[:id]/milestone // Add milestone to goal

// CALCULATOR/TOOLS ROUTES
POST   /api/tools/compound-interest // Compound interest calculator
POST   /api/tools/emi-calculator    // EMI calculator
POST   /api/tools/investment-advisor // Investment suggestions

// AI CHATBOT ROUTES
POST   /api/chat/message            // Send message to AI
GET    /api/chat/history            // Get chat history
POST   /api/chat/budget-analyzer    // Budget analysis
GET    /api/chat/learning-path      // Personalized learning path
GET    /api/chat/quick-tips         // Quick tips
DELETE /api/chat/history            // Clear chat history

// ANALYTICS ROUTES (for admin/insights)
GET    /api/analytics/user-stats     // User engagement stats
GET    /api/analytics/module-stats   // Module completion stats
GET    /api/analytics/popular-topics // Popular learning topics

// SOCIAL FEATURES ROUTES
GET    /api/social/friends      // Get friends list
POST   /api/social/friend-request // Send friend request
PUT    /api/social/friend-request/[:id] // Accept/decline request
GET    /api/social/leaderboard  // Friends leaderboard
POST   /api/social/share-achievement // Share achievement

// NOTIFICATION ROUTES
GET    /api/notifications       // Get user notifications
PUT    /api/notifications/[:id]/read // Mark notification as read
POST   /api/notifications/settings // Update notification preferences

// MIDDLEWARE STRUCTURE
// auth.js - JWT authentication middleware
// validation.js - Input validation middleware
// rateLimiter.js - Rate limiting middleware
// errorHandler.js - Global error handling
// logger.js - Request logging middleware