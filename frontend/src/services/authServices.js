import api from "./api";

export const login = async (email, password) => {
  try{
    const res = await api.post("/auth/login", { email, password });
    if (res.data.success && res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }

    // Update streak after login
    const streakRes = await api.post("/gamification/update-streak");
    const updatedStreak = streakRes?.data?.streak ?? null;
    if (updatedStreak !== null) {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.gamification = user.gamification || {};
        user.gamification.streak = updatedStreak;
        user.gamification.lastActiveDate = streakRes?.data?.lastActiveDate;
        localStorage.setItem("user", JSON.stringify(user));
        if (res?.data?.user) {
          res.data.user.gamification = res.data.user.gamification || {};
          res.data.user.gamification.streak = updatedStreak;
          res.data.user.gamification.lastActiveDate = streakRes?.data?.lastActiveDate;
        }
      } catch (_) {}
    }
    console.log(res.data)
    return res.data;
  }catch (err) {
    console.error(err.message);
    throw(err);
  }
};

export const register = async (data) => {
  console.log("register initiated")
  console.log(data)
  const res = await api.post("/auth/register", data)
  console.log(res.data)
  return res.data;
};

export const getCurrentUser = async () => {
  return (await api.get("/auth/me")).data;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  window.location.href = "/auth/login";
};
