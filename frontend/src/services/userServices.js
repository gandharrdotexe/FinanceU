import api from "./api";

export const getDashboardData = async () => {
  try {
    const res = await api.get("/user/dashboard");
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const getBadges = async (badgeNames) =>{
    try {
        console.log(badgeNames)
        const res = await api.post(`/badges/names`, {badgeNames});
        console.log(res.data)
        return res.data;
      } catch (err) {
        console.error(err.message);
        throw err;
      } 
};

export const getModules = async () => {
  try {
    const res = await api.get("/modules");
    return res.data;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};