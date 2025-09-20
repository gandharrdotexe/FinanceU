const adjectives = [
    'Smart', 'Clever', 'Wise', 'Bright', 'Quick', 'Sharp', 'Creative', 'Curious',
    'Helpful', 'Kind', 'Friendly', 'Honest', 'Loyal', 'Brave', 'Bold', 'Calm',
    'Cool', 'Epic', 'Super', 'Amazing', 'Awesome', 'Great', 'Perfect', 'Elite',
    'Pro', 'Expert', 'Master', 'Ninja', 'Wizard', 'Magic', 'Stellar', 'Cosmic'
  ];
  
  const nouns = [
    'Thinker', 'Solver', 'Helper', 'Seeker', 'Explorer', 'Learner', 'Teacher', 'Guide',
    'Saver', 'Builder', 'Creator', 'Maker', 'Finder', 'Hunter', 'Ranger', 'Scout',
    'Hero', 'Champion', 'Master', 'Expert', 'Guru', 'Sage', 'Oracle', 'Phoenix',
    'Dragon', 'Eagle', 'Lion', 'Tiger', 'Wolf', 'Fox', 'Hawk', 'Falcon'
  ];
  
  function generateAnonymousUsername() {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    return `${adjective}${noun}${number}`;
  }
  
  module.exports = {
    generateAnonymousUsername
  };