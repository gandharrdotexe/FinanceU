import api from "./api";

// Lessons/Modules services

export const getModules = async () => {
  try {
    const res = await api.get("/modules");
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const getModuleById = async (moduleId) => {
  try {
    const res = await api.get(`/modules/${moduleId}`);
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const startModule = async (moduleId) => {
  try {
    const res = await api.post(`/modules/${moduleId}/start`);
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const submitModuleQuiz = async (moduleId, answers) => {
  try {
    const res = await api.post(`/modules/${moduleId}/quiz`, { answers });
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const completeModule = async (moduleId, { quizScore, timeSpent }) => {
  try {
    const res = await api.post(`/modules/${moduleId}/complete`, { quizScore, timeSpent });
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

