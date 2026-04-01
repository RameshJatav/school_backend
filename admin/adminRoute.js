const express = require("express");
const router = express.Router();
const adminController = require("./adminController");
const authAdmin = require("../middleware/authAdmin");

router.post("/register", adminController.register);
router.post("/login", adminController.login);

router.get("/profile", authAdmin, (req, res) => {
  res.json({
    message: "Admin profile",
    admin: {
      id: req.admin.id,
      name: req.admin.name,
      email: req.admin.email
    }
  });
});

router.get("/getAdmin/:id", adminController.getAdmin)


module.exports = router;
