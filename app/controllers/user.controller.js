const db = require("../models");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = db.user;
const axios = require('axios');

var nodemailer = require("nodemailer");

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
  if (!req.body.name ) {
    res.status(400).send({
      message: "Name can not be empty!",
    });
    return;
  }
  if (!req.body.email ) {
    res.status(400).send({
      message: "Email can not be empty!",
    });
    return;
  }
  if (!req.body.phone ) {
    res.status(400).send({
      message: "Phone can not be empty!",
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
    wallet_address:req.body.wallet_address,
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
              welcomeEmail(user.email, user.name);
              res.send(usr);
            })
            .catch((err) => {
              console.log(err);
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


let transporter = nodemailer.createTransport({
  host: 'askava.org',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
      user: 'towngas@askava.org', // generated gmail user
      pass: 'TownG@s123' // generated gmail account password
  },
  tls: { rejectUnauthorized: false }
});

function welcomeEmail(to,name) {
  // Generate test SMTP service account from gmail
  nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport

      // setup email data with unicode symbols
      let mailOptions = {
          from: '"Town Gas" <towngas@askava.org>', // sender address
          to: to, // list of receivers
          subject: 'Registration Confirmed: Towngas 160th Anniversary Smart Energy for a Brighter Future NFT Giveaway & Lucky Draw', // Subject line
          text: '', // plain text body
          html: 'Dear <b>' + name + '</b>, <br><br>' +

              '<br>Thank you for participating in the "Towngas 160th Anniversary Smart Energy for a Brighter Future NFT Giveaway & Lucky Draw", you have successfully enrolled in the Lucky Draw. The results will be announced on Towngas Appliance Facebook page, published on September 16, 2022 in The Standard and Sing Tao Daily.<br>' +

              '<br><br><br> If you have provided a wallet address, Towngas Anniversary NFT will be sent to you later. Please check it on MetaMask. You can also click here to view all minted Towngas 160th Anniversary NFT collection.. If you have any enquires, please call 6221 2956. Thank you!.' +
              '<br><br><br> The Hong Kong and China Gas Company Limited.' +
              '<br><br><br> (This email is automatically sent by the system, please do not reply)'
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
          // Preview only available when sending through an Ethereal account
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

          // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
          // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      });
  });
}
