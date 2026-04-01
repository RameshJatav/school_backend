const express = require("express");
const router = express.Router();
const controller = require("../fee_management/fee_Tr_Controller");

router.post("/create", controller.createTransaction);
router.get("/get", controller.getTransactions);
router.get("/receipt/:receipt_no", controller.downloadReceipt);
router.get("/receipt/student/:student_id", controller.getAllReceiptsByStudentId);
module.exports = router;
