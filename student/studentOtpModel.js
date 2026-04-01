// models/StudentOTP.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const StudentOTP = sequelize.define("StudentOTP", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false
  },

  otp: {
    type: DataTypes.STRING,
    allowNull: false
  },


  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  }

}, {
  tableName: "student_otp",
  timestamps: true
});

module.exports = StudentOTP;
