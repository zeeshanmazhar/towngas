const jwt = require("jsonwebtoken");
const config = require("../config/config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.auth.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }

    req.userId = decoded.id;

    next();
  });
};


logout = (req, res, next)=>{
  let token = req.headers["x-access-token"];
  jwt.destroy(token);
  next();
  return;

}

const authJwt = {
  verifyToken: verifyToken,
  logout: logout
};

module.exports = authJwt;
