const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "school_manage_db",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "School@2026",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

sequelize.authenticate()
  .then(() => console.log("✅ Sequelize MySQL Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

module.exports = sequelize;
