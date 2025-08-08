const sampleModules = [
    {
      title: "Budgeting Basics for Students",
      description: "Learn how to create and stick to a budget as a student",
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
            content: "<p>Budgeting is simply tracking your money...</p>"
          },
          {
            type: "interactive",
            title: "Budget Calculator",
            content: "budget-calculator-component",
            interactiveData: { type: "budget_planner" }
          }
        ],
        quiz: [
          {
            question: "What percentage of income should students aim to save?",
            options: ["5%", "10-20%", "50%", "It doesn't matter"],
            correctAnswer: 1,
            explanation: "Students should aim to save 10-20% of their income for financial security."
          }
        ]
      }
    }
  ];
  
  const sampleBadges = [
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
      name: "Budget Master",
      description: "Create your first budget",
      icon: "💰",
      category: "budgeting",
      criteria: { budgetsCreated: 1 },
      rarity: "common",
      xpBonus: 15
    }
  ];

  module.exports ={
    sampleModules, sampleBadges
  };