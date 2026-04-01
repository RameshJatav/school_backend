const StudentAttendance = require("./attendence_Model");
const Student = require("../studentAdmission/studentAdmissionModel");

// ✅ Single Attendance (One-by-One)
exports.markAttendance = async (req, res) => {
    try {
        const { student_id, attendance_date, status } = req.body;
        const student = await Student.findByPk(student_id);

        if (!student) return res.status(404).json({ message: "Student not found" });

        const existing = await StudentAttendance.findOne({
            where: { student_id, attendance_date }
        });

        if (existing) return res.status(400).json({ message: "Attendance already marked for this date" });

        const attendance = await StudentAttendance.create({
            admin_id: student.admin_id,
            student_id: student.id,
            student_email: student.email,
            class_applied: student.class_applied,
            attendance_date,
            status
        });

        res.status(201).json({ success: true, message: "Attendance marked successfully", attendance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Bulk Attendance (All at once)
exports.markBulkAttendance = async (req, res) => {
    try {
        const { attendance_date, attendance_data } = req.body;
        let count = 0;

        for (let item of attendance_data) {
            const student = await Student.findByPk(item.student_id);
            const exists = await StudentAttendance.findOne({ 
                where: { student_id: item.student_id, attendance_date } 
            });

            if (student && !exists) {
                await StudentAttendance.create({
                    admin_id: student.admin_id,
                    student_id: student.id,
                    student_email: student.email,
                    class_applied: student.class_applied,
                    attendance_date,
                    status: item.status
                });
                count++;
            }
        }
        res.status(201).json({ success: true, message: `${count} students marked successfully.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get Attendance List
exports.getAttendance = async (req, res) => {
    try {
        const { class_applied, date } = req.query;
        const records = await StudentAttendance.findAll({
            where: { class_applied, attendance_date: date }
        });
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ✅ GET CLASSWISE ATTENDANCE REPORT
exports.getClassAttendanceReport = async (req, res) => {
    try {
        const { class_applied, date, admin_id } = req.query;

        if (!admin_id) {
            return res.status(400).json({ success: false, message: "Admin ID is required" });
        }

        let whereCondition = { admin_id };

        // Agar class select ki hai toh filter karein
        if (class_applied && class_applied !== "") {
            whereCondition.class_applied = class_applied;
        }

        // Agar date select ki hai toh sirf us date ka, warna sabhi dates ka data aayega
        if (date && date !== "") {
            whereCondition.attendance_date = date;
        }

        const records = await StudentAttendance.findAll({
            where: whereCondition,
            order: [["attendance_date", "DESC"], ["student_email", "ASC"]]
        });

        return res.status(200).json({
            success: true,
            total_records: records.length,
            data: records
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};