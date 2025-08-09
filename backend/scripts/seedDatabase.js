// scripts/seedDatabase.js - Complete seeding script
const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../models/moduleModel');
const Badge = require('../models/badgeModel');
const User = require('../models/userModel');

const seedModules = async () => {
  const modules = [
    {
      title: "Budgeting Basics for Students",
      description: "Learn how to create and manage a budget as a student with limited income",
      category: "budgeting",
      difficulty: "beginner",
      estimatedTime: 15,
      xpReward: 50,
      order: 1,
      content: {
        sections: [
          {
            type: "text",
            title: "What is Budgeting?",
            content: "<h3>Understanding Your Money Flow</h3><p>Budgeting is tracking where your money comes from and where it goes. As a student, this might include allowances, part-time job income, scholarships, and expenses like food, books, and entertainment.</p><p>The 50/30/20 rule is perfect for students: 50% for needs (food, books), 30% for wants (movies, shopping), and 20% for savings.</p>"
          },
          {
            type: "interactive",
            title: "Budget Planner",
            content: "Use our interactive tool to create your first budget",
            interactiveData: { type: "budget_planner" }
          }
        ],
        quiz: [
          {
            question: "What percentage of income should students aim to save according to the 50/30/20 rule?",
            options: ["10%", "20%", "30%", "50%"],
            correctAnswer: 1,
            explanation: "The 50/30/20 rule suggests saving 20% of your income for future goals and emergencies."
          },
          {
            question: "Which expense category would 'buying textbooks' fall under?",
            options: ["Wants", "Needs", "Savings", "Investments"],
            correctAnswer: 1,
            explanation: "Textbooks are essential for education, making them a 'need' rather than a 'want'."
          }
        ]
      }
    },
    {
      title: "Digital Payments and UPI Safety",
      description: "Master safe digital payments and understand UPI, credit cards, and online banking",
      category: "budgeting",
      difficulty: "beginner",
      estimatedTime: 12,
      xpReward: 40,
      order: 2,
      content: {
        sections: [
          {
            type: "text",
            title: "Digital Payment Basics",
            content: "<h3>UPI and Digital Wallets</h3><p>UPI (Unified Payments Interface) makes payments instant and free. Popular apps include GPay, PhonePe, and Paytm.</p><p><strong>Safety Tips:</strong></p><ul><li>Never share UPI PIN with anyone</li><li>Always verify recipient details</li><li>Check transaction limits</li><li>Enable transaction alerts</li></ul>"
          }
        ],
        quiz: [
          {
            question: "What should you NEVER share with anyone?",
            options: ["UPI ID", "Phone number", "UPI PIN", "Bank name"],
            correctAnswer: 2,
            explanation: "Your UPI PIN is like your ATM PIN - never share it with anyone, not even bank employees."
          }
        ]
      }
    },
    {
      title: "Introduction to Investing",
      description: "Understand basic investment concepts, mutual funds, and SIPs for students",
      category: "investing",
      difficulty: "beginner",
      estimatedTime: 20,
      xpReward: 60,
      order: 3,
      content: {
        sections: [
          {
            type: "text",
            title: "Why Should Students Invest?",
            content: "<h3>The Power of Starting Early</h3><p>Even ₹500 per month invested at age 20 can grow to over ₹15 lakhs by age 40 thanks to compound interest!</p><p><strong>Student-Friendly Investment Options:</strong></p><ul><li>SIP in Mutual Funds (start with ₹500/month)</li><li>ELSS for tax savings</li><li>PPF for long-term wealth building</li></ul>"
          },
          {
            type: "interactive",
            title: "SIP Calculator",
            content: "See how your small investments can grow over time",
            interactiveData: { type: "sip_calculator" }
          }
        ],
        quiz: [
          {
            question: "What is the minimum amount to start a SIP in most mutual funds?",
            options: ["₹100", "₹500", "₹1000", "₹5000"],
            correctAnswer: 1,
            explanation: "Most mutual funds allow SIP starting from ₹500 per month, making it accessible for students."
          }
        ]
      }
    },
    {
      title: "Credit Scores and Student Credit Cards",
      description: "Learn about credit scores, how to build credit history, and use credit cards responsibly",
      category: "debt",
      difficulty: "intermediate",
      estimatedTime: 18,
      xpReward: 55,
      order: 4,
      content: {
        sections: [
          {
            type: "text",
            title: "Building Your Credit History",
            content: "<h3>Credit Score Basics</h3><p>Your credit score (300-900) determines your ability to get loans. Students can start building credit history with:</p><ul><li>Student credit cards with low limits</li><li>Always pay on time</li><li>Keep credit utilization below 30%</li><li>Never close your first credit card</li></ul>"
          }
        ],
        quiz: [
          {
            question: "What's a good credit utilization ratio?",
            options: ["Below 10%", "Below 30%", "Below 50%", "Below 90%"],
            correctAnswer: 1,
            explanation: "Keeping credit utilization below 30% helps maintain a good credit score."
          }
        ]
      }
    },
    {
      title: "Tax Basics for Students",
      description: "Understand income tax, TDS, and tax-saving investments relevant to students",
      category: "taxes",
      difficulty: "intermediate",
      estimatedTime: 16,
      xpReward: 50,
      order: 5,
      content: {
        sections: [
          {
            type: "text",
            title: "Student Tax Scenarios",
            content: "<h3>When Do Students Pay Tax?</h3><p>Students earning over ₹2.5 lakhs annually need to pay income tax. This includes:</p><ul><li>Internship stipends</li><li>Part-time job income</li><li>Freelancing income</li><li>Interest from savings accounts over ₹10,000</li></ul><p><strong>Tax-saving options for students:</strong> ELSS mutual funds, PPF, life insurance premiums under Section 80C.</p>"
          }
        ],
        quiz: [
          {
            question: "What's the tax-free income limit for individuals in India?",
            options: ["₹2 lakhs", "₹2.5 lakhs", "₹3 lakhs", "₹5 lakhs"],
            correctAnswer: 1,
            explanation: "Income up to ₹2.5 lakhs per year is tax-free for individuals under the old tax regime."
          }
        ]
      }
    }
  ];

  try {
    await Module.deleteMany({}); // Clear existing modules
    await Module.insertMany(modules);
    console.log('✅ Modules seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding modules:', error);
  }
};

const seedBadges = async () => {
  const badges = [
    {
      name: "First Steps",
      description: "Complete your first learning module",
      icon: "🎯",
      category: "learning",
      criteria: { modulesCompleted: 1 },
      rarity: "common",
      xpBonus: 10
    },
    {
      name: "Quick Learner",
      description: "Complete 3 modules in one day",
      icon: "⚡",
      category: "learning",
      criteria: { modulesInOneDay: 3 },
      rarity: "rare",
      xpBonus: 25
    },
    {
      name: "Budget Master",
      description: "Create your first budget",
      icon: "💰",
      category: "budgeting",
      criteria: { budgetsCreated: 1 },
      rarity: "common",
      xpBonus: 15
    },
    {
      name: "Savings Superstar",
      description: "Maintain positive savings for 3 consecutive months",
      icon: "⭐",
      category: "saving",
      criteria: { consecutiveSavingsMonths: 3 },
      rarity: "rare",
      xpBonus: 50
    },
    {
      name: "Goal Getter",
      description: "Achieve your first financial goal",
      icon: "🏆",
      category: "achievement",
      criteria: { goalsAchieved: 1 },
      rarity: "epic",
      xpBonus: 75
    },
    {
      name: "Investment Rookie",
      description: "Learn about 5 different investment options",
      icon: "📈",
      category: "investing",
      criteria: { investmentModulesCompleted: 5 },
      rarity: "rare",
      xpBonus: 40
    },
    {
      name: "Week Warrior",
      description: "Login for 7 consecutive days",
      icon: "🔥",
      category: "streak",
      criteria: { loginStreak: 7 },
      rarity: "rare",
      xpBonus: 30
    },
    {
      name: "Perfect Score",
      description: "Score 100% on 5 quizzes",
      icon: "💯",
      category: "learning",
      criteria: { perfectQuizzes: 5 },
      rarity: "epic",
      xpBonus: 60
    },
    {
      name: "Social Learner",
      description: "Share 3 achievements with friends",
      icon: "👥",
      category: "social",
      criteria: { achievementsShared: 3 },
      rarity: "common",
      xpBonus: 20
    },
    {
      name: "Financial Guru",
      description: "Complete all learning modules",
      icon: "🧠",
      category: "learning",
      criteria: { allModulesCompleted: true },
      rarity: "legendary",
      xpBonus: 200
    }
  ];

  try {
    await Badge.deleteMany({});
    await Badge.insertMany(badges);
    console.log('✅ Badges seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
  }
};

const seedTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'demo@financeu.com' });
    if (existingUser) {
      console.log('✅ Demo user already exists');
      return;
    }

    const demoUser = new User({
      email: 'demo@financeu.com',
      username: 'demo_student',
      password: 'demo123',
      profile: {
        name: 'Demo Student',
        college: 'IIT Mumbai',
        year: 2
      },
      financialProfile: {
        monthlyIncome: 15000,
        monthlyExpenses: 10000,
        financialGoals: ['laptop', 'emergency-fund', 'trip'],
        riskTolerance: 'medium'
      },
      gamification: {
        totalXP: 150,
        level: 2,
        badges: ['First Steps', 'Budget Master'],
        streak: 5,
        lastActiveDate: new Date()
      }
    });

    await demoUser.save();
    console.log('✅ Demo user created successfully');
    console.log('   Email: demo@financeu.com');
    console.log('   Password: demo123');
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');
    
    console.log('\n🌱 Seeding modules...');
    await seedModules();
    
    console.log('\n🏆 Seeding badges...');
    await seedBadges();
    
    console.log('\n👤 Creating demo user...');
    await seedTestUser();
    
    console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('\n📊 What was created:');
    console.log('   • 5 Learning modules with interactive content and quizzes');
    console.log('   • 10 Achievement badges with different rarities');
    console.log('   • 1 Demo user account with sample data');
    console.log('\n🔑 Demo Login Credentials:');
    console.log('   Email: demo@financeu.com');
    console.log('   Password: demo123');
    console.log('\n🚀 Next steps:');
    console.log('   1. Start your server: npm run dev');
    console.log('   2. Test the API endpoints');
    console.log('   3. Connect your frontend');
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ SEEDING FAILED:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Individual seed functions for flexibility
const seedModulesOnly = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await seedModules();
  await mongoose.connection.close();
};

const seedBadgesOnly = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await seedBadges();
  await mongoose.connection.close();
};

const seedUsersOnly = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await seedTestUser();
  await mongoose.connection.close();
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { 
  seedDatabase, 
  seedModules, 
  seedBadges, 
  seedTestUser,
  seedModulesOnly,
  seedBadgesOnly,
  seedUsersOnly
};