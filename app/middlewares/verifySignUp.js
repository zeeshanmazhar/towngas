const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicate = (req, res, next) => {
  // Username
  User.findOne({
    where: {
      wallet_address: req.body.wallet_address
    }
  }).then(user => {
    if (user) {
      res.status(400).send({
        message: "Failed! address is already in use!"
      });
      return;
    }

    // Email
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(user => {
      if (user) {
        res.status(400).send({
          message: "Failed! Email is already in use!"
        });
        return;
      }

      // Phone
    User.findOne({
      where: {
        email: req.body.phone
      }
    }).then(user => {
      if (user) {
        res.status(400).send({
          message: "Failed! Phone is already in use!"
        });
        return;
      }

      next();
    });

    });
  });

};


const verifySignUp = {
  checkDuplicate: checkDuplicate
};

module.exports = verifySignUp;
