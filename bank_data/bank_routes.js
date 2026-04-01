const express = require("express");
const router = express.Router();
const controller = require("./bank_controller")

router.post("/create", controller.createBank);
router.get("/all", controller.getBank);

module.exports = router;
