const Badge = require('../models/badgeModel');

const getAllBadges = async (req, res) => {
  try {
    const { category, rarity, isActive } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (rarity) {
      filter.rarity = rarity;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const badges = await Badge.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: badges.length,
      data: badges
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBadgeById = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: badge
    });
  } catch (error) {
    console.error('Error fetching badge:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid badge ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching badge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
const getBadgesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { rarity, isActive } = req.query;
    
    // Build filter object
    const filter = { category };
    
    if (rarity) {
      filter.rarity = rarity;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const badges = await Badge.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: badges.length,
      category,
      data: badges
    });
  } catch (error) {
    console.error('Error fetching badges by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBadgesByRarity = async (req, res) => {
  try {
    const { rarity } = req.params;
    const { category, isActive } = req.query;
    
    // Build filter object
    const filter = { rarity };
    
    if (category) {
      filter.category = category;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const badges = await Badge.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: badges.length,
      rarity,
      data: badges
    });
  } catch (error) {
    console.error('Error fetching badges by rarity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges by rarity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBadgeByName = async (req, res) => {
  try {
    const { name } = req.params;
    
    const badges = await Badge.find({ name: { $regex: new RegExp(name, 'i') } });
    
    if (!badges || badges.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No badges found'
      });
    }
    
    res.status(200).json({
      success: true,
      count: badges.length,
      data: badges
    });
  } catch (error) {
    console.error('Error fetching badges by name:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges by name',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBadgesByNames = async (req, res) => {
  try {
    const { badgeNames } = req.body;
    
    if (!badgeNames || !Array.isArray(badgeNames) || badgeNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of badge names'
      });
    }
    
    // Create case-insensitive regex patterns for each badge name
    const namePatterns = badgeNames.map(name => new RegExp(name, 'i'));
    
    const badges = await Badge.find({ 
      name: { $in: namePatterns } 
    });
    
    if (!badges || badges.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No badges found for the provided names'
      });
    }
    
    res.status(200).json({
      success: true,
      count: badges.length,
      requestedNames: badgeNames,
      foundNames: badges.map(badge => badge.name),
      data: badges
    });
  } catch (error) {
    console.error('Error fetching badges by names:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges by names',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllBadges,
  getBadgeById,
  getBadgesByCategory,
  getBadgesByRarity,
  getBadgeByName,
  getBadgesByNames
}; 