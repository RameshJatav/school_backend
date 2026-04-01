const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Student = require("../studentAdmission/studentAdmissionModel");

const FeeTransaction = sequelize.define("FeeTransaction", {

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

  bank_id:{
    type: DataTypes.UUID,
    allowNull: false
  },

  fixed_fees: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  remaining_fees: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  
  receipt_no: {
  type: DataTypes.STRING,
  unique: true
},

  transaction_type: {
    type: DataTypes.ENUM("credit", "debit"),
    allowNull: false
  }

}, {
  tableName: "fee_transactions",
  timestamps: true
});

module.exports = FeeTransaction;
