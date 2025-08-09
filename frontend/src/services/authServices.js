import api from "./api";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  if (res.data.success && res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }

  // Update streak after login
  await api.post("/gamification/update-streak");
  console.log(res.data)
  return res.data;
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
