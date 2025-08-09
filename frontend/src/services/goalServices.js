import api from "./api";

// Get user goals
export const getGoalData = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const res = await api.get("/goals", { params });
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

// Create new goal
export const createGoal = async (goalData) => {
  try {
    const res = await api.post("/goals", goalData);
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

// Update goal
export const updateGoal = async (goalId, updates) => {
  try {
    const res = await api.put(`/goals/${goalId}`, updates);
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

// Add milestone to goal
export const addMilestone = async (goalId, milestoneData) => {
  try {
    const res = await api.post(`/goals/${goalId}/milestone`, milestoneData);
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

// Delete goal
export const deleteGoal = async (goalId) => {
  try {
    const res = await api.delete(`/goals/${goalId}`);
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};
