const sequelize = require("../config/db");
const FeeMoneyExpenseTr = require("./fee_ExpenseTr_model");
const Bank = require("../bank_data/bank_model");

exports.createExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { admin_id, bank_id, expense_type, expense_name, amount, remark } = req.body;

    if (!admin_id || !bank_id || !expense_type || !expense_name || !amount) {
      await t.rollback();
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const expenseAmount = Number(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid amount" });
    }

    // 🔹 Fetch Bank
    const bank = await Bank.findByPk(bank_id, { transaction: t });
    if (!bank) {
      await t.rollback();
      return res.status(404).json({ message: "Bank not found" });
    }

    if (Number(bank.balance) < expenseAmount) {
      await t.rollback();
      return res.status(400).json({ message: "Insufficient bank balance" });
    }

    const beforeBalance = Number(bank.balance);
    const afterBalance = beforeBalance - expenseAmount;

    // 🔹 Generate Receipt Number
    const receiptNumber = "EXP-" + Date.now();

    // 🔹 Create Expense Transaction
    const expense = await FeeMoneyExpenseTr.create({
      admin_id,
      bank_id,
      expense_type,
      expense_name,
      amount: expenseAmount,
      remark,
      before_balance: beforeBalance,
      after_balance: afterBalance,
      receipt_no: receiptNumber
    }, { transaction: t });

    // 🔹 Update Bank Balance
    bank.balance = afterBalance;
    await bank.save({ transaction: t });

    await t.commit();

    return res.status(201).json({
      message: "Expense recorded successfully",
      expense,
      receipt_no: receiptNumber,
      receipt_download_url: `/api/expense/receipt/${receiptNumber}`,
      bank_balance: bank.balance
    });

  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


exports.getExpenseReceipt = async (req, res) => {
  try {
    const { receipt_no } = req.params;

    const expense = await FeeMoneyExpenseTr.findOne({ where: { receipt_no } });

    if (!expense) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    return res.status(200).json(expense);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



// Get All Expenses
exports.expensegetall = async (req, res) => {
  try {

    const expenses = await FeeMoneyExpenseTr.findAll();

    return res.status(200).json(expenses);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};