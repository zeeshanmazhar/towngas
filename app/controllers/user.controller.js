const db = require("../models");
const multer = require("multer");
const User = db.user;
const { verifySignUp } = require("../middlewares");
var cron = require('node-cron');
const mintNFT = require("../middlewares/minter");

mintNFT('0xd9c75f7A8651fEab4Be82a9082Cc87576B093FB3')
    .then((result) => {
      console.log('result: ' ,result);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

cron.schedule('*/1 * * * *', () => {
  User.findAll({where:{nft_one:0}})
  then((user)=>{
    console.log(user);
  })
  .catch((err)=>{
    console.log(err);
  })
});

exports.createUser = (req, res) =>{
  if (!req.body.name ) {
    res.status(400).send({
      message: "Name can not be empty!",
    });
    return;
  }
  if (!req.body.email ) {
    res.status(400).send({
      message: "Name can not be empty!",
    });
    return;
  }
  if (!req.body.phone ) {
    res.status(400).send({
      message: "Name can not be empty!",
    });
    return;
  }
  if (!req.body.wallet_address ) {
    res.status(400).send({
      message: "Wallet Address can not be empty!",
    });
    return;
  }

  var user = {
    name:req.body.name,
    phone:req.body.phone,
    email:req.body.email,
    wallet_address:req.body.wallet_address
  }

  if(req.body.purchase_date){
    user.purchase_date = req.body.purchase_date
  }

  if (req.body.order_no) {
      User.findAll({where:{order_no:req.body.order_no}})
      .then((order)=>{
          if (order.length > 0) {
            res.status(400).send({
              message: "Failed! Order# is already used!"
            });
          }else{
            user.order_no = req.body.order_no;
            User.create(user)
            .then((usr)=>{
              res.send(usr);
            })
            .catch((err) => {
              res.status(500).send({ message: err.message });
            });
          }
      })
  }else{
    User.create(user)
    .then((usr)=>{
      res.send(usr);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
  }

}



function UpdateUser(data, id) {
  return new Promise((resolve, reject) => {
    User.update(data, {
      where: { id: id },
    })
      .then((num) => {
        if (num == 1) {
          resolve({ status: true, code: 200 });
        } else {
          resolve({ status: false, code: 200 });
        }
      })
      .catch((err) => {
        reject({ status: false, code: 500, message: err });
      });
  });
}

