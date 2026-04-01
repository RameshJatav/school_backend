// const express = require("express");
// const router = express.Router();
// const controller = require("./studentAdmissionController");
// const upload = require("../middleware/upload");

// router.post("/apply", upload.fields([
//   { name: "student_photo", maxCount: 1 },
//   { name: "father_photo", maxCount: 1 },
//   { name: "mother_photo", maxCount: 1 },
//   { name: "signature", maxCount: 1 }
// ]), controller.applyAdmission);

// // Promotion Route
// router.post("/promote", controller.promoteStudents);

// router.get("/get-Admission", controller.getMyAdmission); //get student by email
// router.get("/allstudents/get", controller.getAllStudents);
// router.put("/update-studentAdmission", controller.updateAdmission); //by email
// router.put("/update-studentAdmission_status", controller.updateAdmission_status); //by email
// router.get("/getStudents_classwise", controller.getAllStudentsClassWise)
// module.exports = router;


const express = require("express");
const router = express.Router();
const controller = require("./studentAdmissionController");
const upload = require("../middleware/upload");

router.post("/apply", upload.fields([
  { name: "student_photo", maxCount: 1 },
  { name: "father_photo", maxCount: 1 },
  { name: "mother_photo", maxCount: 1 },
  { name: "signature", maxCount: 1 }
]), controller.applyAdmission);

router.post("/promote", controller.promoteStudents);

router.get("/get-Admission", controller.getMyAdmission);
router.get("/allstudents/get", controller.getAllStudents);

router.put("/update-status", controller.updateAdmission_status);
router.get("/getStudents_classwise", controller.getAllStudentsClassWise)
module.exports = router;



