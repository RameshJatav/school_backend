const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "school_manage_db",   // DB name
  "root",         // username
  "",             // password
  {
    host: "localhost",
    dialect: "mysql",
    logging: false
  }
);

sequelize.authenticate()
  .then(() => console.log("Sequelize MySQL Connected"))
  .catch(err => console.error("DB Connection Error:", err));

module.exports = sequelize;
