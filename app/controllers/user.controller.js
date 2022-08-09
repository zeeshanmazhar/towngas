const db = require("../models");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = db.user;
const axios = require('axios');

const { verifySignUp } = require("../middlewares");
var cron = require('node-cron');
const mintNFT = require("../middlewares/minter");


cron.schedule('*/10 * * * *', () => {

User.findAll({attributes: ['wallet_address','id'],where:{server:false}})
.then((a)=>{
  axios
  .post('http://3.72.112.244:3851/api/auto', { data: a })
    .then(function (response) {

      if (response.data == 'done') {
        console.log(response.data);
        UpdateServerFlag(a);
      }
      else{
        console.log('====================================');
        console.log(response.data);
        console.log('====================================');
      }
    })
    .catch((err)=>{
      console.log(err);
    })
})

  .catch((err)=>{
    console.log(err);
  })
});

exports.createUser = (req, res) =>{
  console.log(req.body);
  // if (!req.body.name ) {
  //   res.status(400).send({
  //     message: "Name can not be empty!",
  //   });
  //   return;
  // }
  // if (!req.body.email ) {
  //   res.status(400).send({
  //     message: "Email can not be empty!",
  //   });
  //   return;
  // }
  // if (!req.body.phone ) {
  //   res.status(400).send({
  //     message: "Phone can not be empty!",
  //   });
  //   return;
  // }
  // if (!req.body.wallet_address ) {
  //   res.status(400).send({
  //     message: "Wallet Address can not be empty!",
  //   });
  //   return;
  // }

  // var user = {
  //   name:req.body.name,
  //   phone:req.body.phone,
  //   email:req.body.email,
  //   wallet_address:req.body.wallet_address,
  // }

  // if(req.body.purchase_date){
  //   user.purchase_date = req.body.purchase_date
  // }

  // if (req.body.order_no) {
  //     User.findAll({where:{order_no:req.body.order_no}})
  //     .then((order)=>{
  //         if (order.length > 0) {
  //           res.status(400).send({
  //             message: "Failed! Order# is already used!"
  //           });
  //         }else{
  //           user.order_no = req.body.order_no;

  //           User.create(user)
  //           .then((usr)=>{
  //             res.send(usr);
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             res.status(500).send({ message: err.message });
  //           });
  //         }
  //     })
  // }else{
  //   User.create(user)
  //   .then((usr)=>{
  //     res.send(usr);
  //   })
  //   .catch((err) => {
  //     res.status(500).send({ message: err.message });
  //   });
  // }

}

function UpdateServerFlag(data) {
  return new Promise((resolve, reject) => {
    data.forEach(e => {
      User.update({server:true}, {
        where: { id: e.id },
      }).then((num) => {})
    });

  });
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

