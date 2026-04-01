const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const FeeMoneyExpenseTr = sequelize.define("FeeMoneyExpenseTr", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  admin_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  bank_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  expense_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expense_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  before_balance: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  after_balance: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receipt_no: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: "fee_money_expense_tr",
  timestamps: true
});

module.exports = FeeMoneyExpenseTr;
