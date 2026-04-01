const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PromotionHistory = sequelize.define("PromotionHistory", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  student_id: { type: DataTypes.INTEGER },
  from_class: DataTypes.INTEGER,
  to_class: DataTypes.INTEGER,
  new_session: DataTypes.STRING,
  promoted_by: DataTypes.UUID // Admin ID
}, { tableName: "promotion_history" });

module.exports = PromotionHistory;