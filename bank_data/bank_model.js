const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Bank = sequelize.define("Bank", {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  user_name: DataTypes.STRING,

  bank_name: DataTypes.STRING,

  ifsc_code: DataTypes.STRING,

  balance: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }

}, {
  tableName: "fee_bank",
  timestamps: true
});

module.exports = Bank;
