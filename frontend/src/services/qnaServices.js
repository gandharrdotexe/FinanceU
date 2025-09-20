import api from './api';

// Question Services
export const createQuestion = async (questionData) => {
  try {
    const response = await api.post('/questions', questionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getQuestions = async (params = {}) => {
  try {
    const response = await api.get('/questions', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getQuestionById = async (questionId) => {
  try {
    const response = await api.get(`/questions/${questionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const searchQuestions = async (searchParams) => {
  try {
    const response = await api.get('/questions/search', { params: searchParams });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const voteQuestion = async (questionId, voteType) => {
  try {
    const response = await api.post(`/questions/${questionId}/vote`, { voteType });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPopularTags = async () => {
  try {
    const response = await api.get('/questions/tags/popular');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Answer Services
export const createAnswer = async (answerData) => {
  try {
    const response = await api.post('/answers', answerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAnswersByQuestion = async (questionId, params = {}) => {
  try {
    const response = await api.get(`/answers/question/${questionId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAnswerById = async (answerId) => {
  try {
    const response = await api.get(`/answers/${answerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const acceptAnswer = async (answerId) => {
  try {
    const response = await api.put(`/answers/${answerId}/accept`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const voteAnswer = async (answerId, voteType) => {
  try {
    const response = await api.post(`/answers/${answerId}/vote`, { voteType });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserAnswerStats = async (userId) => {
  try {
    const response = await api.get(`/answers/stats/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Additional services for Q&A detail page
export const markQuestionResolved = async (questionId, answerId) => {
  try {
    const response = await api.put(`/questions/${questionId}/resolve`, { answerId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const markAnswerHelpful = async (answerId) => {
  try {
    const response = await api.put(`/answers/${answerId}/helpful`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
