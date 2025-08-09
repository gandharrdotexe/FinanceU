import { Description } from "@mui/icons-material";
import api from "./api";

export const getBudget = async () => {
    try {
        const res = await api.get("/budget");
        console.log(res.data)
        return res.data;
    } catch(err){
        console.error(err.message);
        throw(err);
    }
};

export const getBudgetByMonth = async (month) => {
    try {
        const res = await api.get(`/budget/${month}`);
        console.log(res.data);
        return res.data;
    } catch (err) {
        console.error(err.message);
        throw err;
    }
};

export const createOrUpdateBudget = async (payload) => {
    try {
        const res = await api.post("/budget", payload);
        console.log(res.data);
        return res.data;
    } catch (err) {
        console.error(err.message);
        throw err;
    }
};

export const updateTransactions = async (category, description, amount) => {
    try {
        const res = await api.post("/budget/expense", {category, description, amount});
        console.log(res.data)
        return res.data;
    } catch(err){
        console.error(err.message);
        throw(err);
    }
};

export const deleteTransaction = async (transactionId, category) => {
    try {
        const res = await api.delete(`/budget/expense/${transactionId}`, {
            data: { category: category.toLowerCase() }
        });
        console.log(res.data)
        return res.data;
    } catch(err){
        console.error(err.message);
        throw(err);
    }
};