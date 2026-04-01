

const fs = require("fs");
const path = require("path");
const StudentAuth = require("../student/studentAuthModel");
const StudentAdmission = require("./studentAdmissionModel");

exports.applyAdmission = async (req, res) => {
  try {
    const { email, total_fees, fees_paid } = req.body;

    // 1. Check if Email exists
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 2. Student Auth check (Jaisa aapne pehle maanga tha)
    const student = await StudentAuth.findOne({ where: { email } });
    if (!student) {
      return res.status(401).json({
        message: "Unauthorized or student email not found in auth system"
      });
    }

    // 3. Prevent Duplicate Admission
    const alreadyExists = await StudentAdmission.findOne({ where: { email } });
    if (alreadyExists) {
      return res.status(400).json({ message: "Admission already applied for this email" });
    }

    // 4. Handle All 4 File Uploads (Photos + Signature)
    const student_photo = req.files?.student_photo?.[0]?.path || null;
    const father_photo = req.files?.father_photo?.[0]?.path || null;
    const mother_photo = req.files?.mother_photo?.[0]?.path || null;
    const signature = req.files?.signature?.[0]?.path || null;

    // 5. Generate Unique Registration Number (REG-YEAR-RANDOM)
    const currentYear = new Date().getFullYear();
    const registration_no = `REG-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 6. Create Record with All Fields
    const admission = await StudentAdmission.create({
      admin_id: student.createdBy, // Mapping from auth record
      registration_no: registration_no,
      email: email,

      // Basic Details
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      date_of_birth: req.body.date_of_birth,
      gender: req.body.gender,
      blood_group: req.body.blood_group,
      aadhar_no: req.body.aadhar_no,
      category: req.body.category,
      admission_date: req.body.admission_date || new Date(),

      // Parent Details
      father_name: req.body.father_name,
      father_mobile: req.body.father_mobile,
      father_occupation: req.body.father_occupation,
      mother_name: req.body.mother_name,
      mother_mobile: req.body.mother_mobile,
      mother_occupation: req.body.mother_occupation,

      // Address Details
      address_line1: req.body.address_line1,
      address_line2: req.body.address_line2,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,

      // Academic Details
      class_applied: req.body.class_applied,
      previous_school_name: req.body.previous_school_name,
      previous_class: req.body.previous_class,
      previous_percentage: req.body.previous_percentage,
      medium: req.body.medium,
      board: req.body.board,
      academic_year: `${currentYear}-${currentYear + 1}`,

      // Financials (Dynamic Calculation)
      total_fees: Number(total_fees),
      fees_paid: Number(fees_paid || 0),
      fees_due: Number(total_fees) - Number(fees_paid || 0),

      // Files
      student_photo,
      father_photo,
      mother_photo,
      signature,

      // Meta
      remarks: req.body.remarks,
      status: "pending" // Default status
    });

    // 7. Send Response
    res.status(201).json({
      success: true,
      message: "Admission applied successfully",
      registration_no: registration_no,
      data: admission
    });

  } catch (error) {
    console.error("Apply Admission Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
};



// ===== helper function to delete uploaded files =====
// function deleteFiles(files) {
//   if (!files) return;

//   const allFiles = [
//     ...(files.student_photo || []),
//     ...(files.father_photo || []),
//     ...(files.mother_photo || [])
//   ];

//   for (const file of allFiles) {
//     try {
//       fs.unlinkSync(file.path);
//     } catch (err) {
//       console.log("File delete error:", err.message);
//     }
//   }
// }


// ================= GET MY ADMISSION =================
exports.getMyAdmission = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const admission = await StudentAdmission.findOne({
      where: { email }
    });

    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    res.json({ success: true, data: admission });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= GET ALL STUDENTS (BY ADMIN) =================
exports.getAllStudents = async (req, res) => {
  try {
    const { admin_id } = req.query;

    if (!admin_id) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const students = await StudentAdmission.findAll({
      where: { admin_id },
      // remove attributes to fetch all columns
      order: [["createdAt", "DESC"]]
    });

    res.json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



// Is function ko apne studentAdmissionController.js ke niche paste karein
exports.promoteStudents = async (req, res) => {

  const t = await sequelize.transaction();

    try {
        const { from_class, to_class, new_session, new_total_fees } = req.body;

        // Validation
        if (!from_class || !to_class || !new_session) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing fields: from_class, to_class, or new_session are required." 
            });
        }

        // 2. Sirf 'approved' students ko dhundhein jo 'from_class' mein hain
        const students = await StudentAdmission.findAll({
            where: {
                class_applied: from_class,
                status: 'approved'
            },
            transaction: t
        });

        if (students.length === 0) {
            await t.rollback();
            return res.status(404).json({ 
                success: false, 
                message: `Class ${from_class} mein koi approved student nahi mila.` 
            });
        }

        // 3. Loop chala kar sabko promote karein
        for (let student of students) {
            
            // Purana record history array mein save karein
            const currentHistory = student.promotion_history || [];
            const newHistoryEntry = {
                from_class: student.class_applied,
                to_class: to_class,
                session_completed: student.academic_year,
                final_fees_status: student.fees_due === 0 ? "Cleared" : "Pending",
                date: new Date().toISOString()
            };

            currentHistory.push(newHistoryEntry);

            // Nayi fees calculate karein (Agar Admin ne nayi fees bheji hai toh wo, varna purani hi)
            const updatedTotalFees = new_total_fees ? Number(new_total_fees) : Number(student.total_fees);

            // Student update logic
            await student.update({
                class_applied: to_class,      // Nayi class set karein
                academic_year: new_session,  // Naya session (e.g. 2026-27)
                total_fees: updatedTotalFees, // Nayi class ki fees set karein
                fees_paid: 0,                // Naye saal ki fees zero se shuru hogi
                fees_due: updatedTotalFees,   // Nayi full fees outstanding hogi
                promotion_history: currentHistory // History update karein
            }, { transaction: t });
        }

        // 4. Sab sahi raha toh Transaction Commit karein
        await t.commit();

        return res.status(200).json({
            success: true,
            message: `${students.length} students promoted successfully from Class ${from_class} to ${to_class}.`,
            session: new_session
        });

    } catch (error) {
        // 5. Error aane par Rollback (Wapas purana data)
        if (t) await t.rollback();
        console.error("Promotion Error:", error);
        return res.status(500).json({
            success: false,
            message: "Promotion process failed",
            error: error.message
        });
    }
};

exports.updateAdmission_status = async (req, res) => {
  try {
    const { email, status } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const admission = await StudentAdmission.findOne({ where: { email } });

    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    // Allow only valid ENUM values
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    await admission.update({ status });

    res.json({
      success: true,
      message: "Status updated successfully",
      data: admission
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE ADMISSION =================
exports.updateAdmission = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const admission = await StudentAdmission.findOne({ where: { email } });

    if (!admission) return res.status(404).json({ message: "Admission not found" });

    if (admission.status !== "pending") {
      return res.status(400).json({ message: "Admission cannot be updated after approval" });
    }

    // ✅ Allowed fields only
    const allowedFields = ["name", "fatherName", "motherName", "phone", "address", "classApplied"];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    await admission.update(updates);

    res.json({
      success: true,
      message: "Admission updated successfully",
      data: admission
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAllStudentsClassWise = async (req, res) => {
  try {
    const students = await StudentAdmission.findAll({
      order: [
        ['class_applied', 'ASC'],  // pehle class ke hisaab se
        ['first_name', 'ASC']    // same class me name ke hisaab se
      ]
    });

    res.json({
      success: true,
      data: students
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};