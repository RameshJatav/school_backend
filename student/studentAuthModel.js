// models/StudentAuth.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const StudentAuth = sequelize.define("StudentAuth", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  createdBy: {
    type: DataTypes.UUID,
    allowNull: false   // 🔥 ADMIN ID
  }

}, {
  tableName: "student_auth",
  timestamps: true
});

module.exports = StudentAuth;
