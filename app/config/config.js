module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 443,

  /** DATABASE */
  db: {
    DB_HOST: 'database-1.ca0bdz22c1lh.eu-central-1.rds.amazonaws.com',
    DB_USER: 'admin',
    DB_PASS: 'admin-123',
    DB_NAME: 'towngas',
    dialect: 'mysql',
  },
  db1:{
    DB_HOST: 'database-2.cap4voenyn2t.us-east-1.rds.amazonaws.com',
    DB_USER: 'admin',
    DB_PASS: 'TownGas-123',
    DB_NAME: 'towngas',
    dialect: 'mysql',
  },

  /** AUTH KEY */
  auth: {
    secret: "our-secret-key"
  }
};
