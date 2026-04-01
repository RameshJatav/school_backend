const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Student = require("../studentAdmission/studentAdmissionModel");

const StudentAttendance = sequelize.define("StudentAttendance", {
  
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  admin_id: {
    type: DataTypes.UUID,
    allowNull: false
  },

  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  student_email: {
    type: DataTypes.STRING,
    allowNull: false
  },

  class_applied: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  attendance_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM("PRESENT", "ABSENT", "LEAVE", "HALF_DAY"),
    allowNull: false
  }

}, {
  tableName: "student_attendance",
  timestamps: true
});

module.exports = StudentAttendance;
