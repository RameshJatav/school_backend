const sequelize = require("../config/db");
const FeeTransaction = require("./fee_Tr_Model");
const Student = require("../studentAdmission/studentAdmissionModel");
const Bank = require("../bank_data/bank_model");
const { Op } = require("sequelize");
const PDFDocument = require("pdfkit");


exports.createTransaction = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { admin_id, student_id, bank_id, amount, transaction_type } = req.body;

        // 1. Database se Student ki details nikaalein (Email aur Fees ke liye)
        const student = await Student.findByPk(student_id, { transaction: t });
        if (!student) {
            await t.rollback();
            return res.status(404).json({ message: "Student not found" });
        }

        const paymentAmount = Number(amount);
        let totalPaid = Number(student.fees_paid) || 0;
        const receiptNumber = "RCPT-" + Date.now();

        // 2. Logic for Credit/Debit (Same as before)
        if (transaction_type === "credit") {
            totalPaid += paymentAmount;
            // ... bank balance update logic
        } else {
            totalPaid -= paymentAmount;
            // ... bank balance update logic
        }

        const remaining = Number(student.total_fees) - totalPaid;

        // 3. Create Transaction with Auto-fetched Email
        const transaction = await FeeTransaction.create({
            admin_id,
            student_id: student.id,
            bank_id,
            receipt_no: receiptNumber,
            student_email: student.email, // 🔥 Registration number se mili email
            fixed_fees: student.total_fees,
            amount: paymentAmount,
            remaining_fees: remaining,
            transaction_type
        }, { transaction: t });

        // Update Student Table
        student.fees_paid = totalPaid;
        student.fees_due = remaining;
        await student.save({ transaction: t });

        await t.commit();
        res.status(201).json({ success: true, receipt_no: receiptNumber, transaction });

    } catch (error) {
        if (t) await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

// GET TRANSACTIONS (student_id / email / class)

exports.getTransactions = async (req, res) => {
  try {
    const { student_id, email, class_applied } = req.query;

    let students = [];

    if (student_id) {
      const student = await Student.findByPk(student_id);
      if (!student) return res.status(404).json({ message: "Student not found" });
      students.push(student);
    }

    else if (email) {
      const student = await Student.findOne({ where: { email } });
      if (!student) return res.status(404).json({ message: "Student not found" });
      students.push(student);
    }

    else if (class_applied) {
      students = await Student.findAll({ where: { class_applied } });
      if (students.length === 0)
        return res.status(404).json({ message: "No students found in this class" });
    }

    else {
      return res.status(400).json({
        message: "Provide student_id, email or class_applied"
      });
    }

    const studentIds = students.map(s => s.id);

    const transactions = await FeeTransaction.findAll({
      where: {
        student_id: { [Op.in]: studentIds }
      },
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      total_students: students.length,
      total_transactions: transactions.length,
      transactions
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// DOWNLOAD SINGLE RECEIPT PDF

exports.downloadReceipt = async (req, res) => {
  try {
    const { receipt_no } = req.params;

    const transaction = await FeeTransaction.findOne({
      where: { receipt_no }
    });

    if (!transaction) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    // 🔹 Simply return transaction as JSON
    return res.status(200).json({
      receipt_no: transaction.receipt_no,
      student_id: transaction.student_id,
      student_email: transaction.student_email,
      bank_id: transaction.bank_id,
      fixed_fees: transaction.fixed_fees,
      amount: transaction.amount,
      remaining_fees: transaction.remaining_fees,
      transaction_type: transaction.transaction_type,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAllReceiptsByStudentId = async (req, res) => {
  try {
    const student_id = parseInt(req.params.student_id);

    if (!student_id) {
      return res.status(400).json({
        message: "Student ID is required"
      });
    }

    const transactions = await FeeTransaction.findAll({
      where: { student_id: student_id },
      order: [["createdAt", "DESC"]] // latest first
    });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        message: "No transactions found for this student"
      });
    }

    return res.status(200).json({
      count: transactions.length,
      transactions: transactions
    });

  } catch (error) {
    console.error("Transaction Fetch Error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};