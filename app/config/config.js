module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 443,

  /** DATABASE */
  db: {
    DB_HOST: 'nftprdd01aw.ctymd45abzdi.ap-east-1.rds.amazonaws.com',
    DB_USER: 'tgsysadm',
    DB_PASS: 'tMt34aAbDgEPwGXR',
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
