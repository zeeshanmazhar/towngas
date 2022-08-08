const config = require("../config/config.js");
const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize(
  config.db.DB_NAME,
  config.db.DB_USER,
  config.db.DB_PASS,
  {
    host: config.db.DB_HOST,
    dialect: config.db.dialect,
    dialectOptions: {
      ssl:'Amazon RDS'
  },
  }
);

const sequelize1 = new Sequelize(
  config.db1.DB_NAME,
  config.db1.DB_USER,
  config.db1.DB_PASS,
  {
    host: config.db1.DB_HOST,
    dialect: config.db1.dialect,
    dialectOptions: {
      ssl:'Amazon RDS'
  },
  }
);


const db = {};

db.Sequelize = Sequelize;
db.Op = Op;
db.sequelize1 = sequelize1;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize, DataTypes);
db.user1 = require("./user.model.js")(sequelize1, Sequelize, DataTypes);


module.exports = db;
