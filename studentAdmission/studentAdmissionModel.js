const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const StudentAdmission = sequelize.define(
  "StudentAdmission",
  {
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // New Unique Enrollment/Registration No.
    registration_no: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    date_of_birth: DataTypes.DATE,
    gender: DataTypes.ENUM("Male", "Female", "Other"),
    blood_group: DataTypes.ENUM(
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-",
    ),

    // Naye Fields
    aadhar_no: DataTypes.STRING,
category: {
  type: DataTypes.ENUM,
  values: ['General', 'OBC', 'SC', 'ST', 'EWS'],
  allowNull: false,
},
    admission_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    // Photos & Documents
    student_photo: DataTypes.STRING,
    father_photo: DataTypes.STRING,
    mother_photo: DataTypes.STRING,
    signature: DataTypes.STRING, // New Signature field

    father_name: DataTypes.STRING,
    father_mobile: DataTypes.STRING,
    father_occupation: DataTypes.STRING,

    mother_name: DataTypes.STRING,
    mother_mobile: DataTypes.STRING,
    mother_occupation: DataTypes.STRING,

    address_line1: DataTypes.TEXT,
    address_line2: DataTypes.TEXT,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    pincode: DataTypes.STRING,

    class_applied: DataTypes.INTEGER,
    previous_school_name: DataTypes.STRING,
    previous_class: DataTypes.STRING,
    previous_percentage: DataTypes.STRING, // Percentage or Grade
    medium: DataTypes.STRING,
    board: DataTypes.STRING,

    // Fees Section (Purana wala hi)
    total_fees: DataTypes.INTEGER,
    fees_paid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    fees_due: DataTypes.INTEGER,

    admission_year: DataTypes.INTEGER,

    // studentAdmissionModel.js mein ye fields check karein/add karein
    academic_year: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "2025-26",
    },
    promotion_history: {
      type: DataTypes.JSON, // Purani classes ka record JSON mein store hoga
      allowNull: true,
    },

    remarks: DataTypes.TEXT, // Summary/Remarks
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "student_admissions",
    timestamps: true,
  },
);

module.exports = StudentAdmission;
