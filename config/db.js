const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "school_manage_db",   // DB name
  "root",         // username
  "",             // password
  {
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false
  }
);
// nano /root/school_project/config/db.js

sequelize.authenticate()
  .then(() => console.log("Sequelize MySQL Connected"))
  .catch(err => console.error("DB Connection Error:", err));

module.exports = sequelize;
