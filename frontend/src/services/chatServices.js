import api from "./api";

export const sendMessageToAI = async (message, context = null) => {
  try {
    const res = await api.post("/chat/message", { message, context });
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const getChatHistory = async () => {
  try {
    const res = await api.get("/chat/history");
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const clearChatHistory = async () => {
  try {
    const res = await api.delete("/chat/history");
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const analyzeBudgetWithAI = async (budgetData) => {
  try {
    const res = await api.post("/chat/analyze-budget", { budgetData });
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const getLearningPath = async () => {
  try {
    const res = await api.get("/chat/learning-path");
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const getQuickTip = async () => {
  try {
    const res = await api.get("/chat/quick-tips");
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};