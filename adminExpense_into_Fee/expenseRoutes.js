const express = require("express");
const router = express.Router();
const expenseController = require("./expenseController");

// 🔹 Create a new expense
router.post("/create", expenseController.createExpense);
router.get("/receipt/:receipt_no", expenseController.getExpenseReceipt);
router.get("/getAllReceipts/expense", expenseController.expensegetall)
module.exports = router;
// EXPENSE_ALL: `${API_BASE}/fee_to_use_Expense/getAllReceipts/expense`,