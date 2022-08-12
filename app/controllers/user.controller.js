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
  .post('https://3.72.112.244:443/api/auto', { data: a })
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
              if(req.body.language == 'en'){
                welcomeEmail_ch(user.email, user.name);
              }
              else if(req.body.language == 'ch'){
                welcomeEmail_en(user.email, user.name);
              }else{
                welcomeEmail_ch(user.email, user.name);
              }

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
      if(req.body.language == 'en'){
        welcomeEmail_ch(user.email, user.name);
      }
      else if(req.body.language == 'ch'){
        welcomeEmail_en(user.email, user.name);
      }else{
        welcomeEmail_ch(user.email, user.name);
      }
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


exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      console.log(user);
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      let token = jwt.sign({ id: user.id }, config.auth.secret, {
        expiresIn: 86400, // 24 hours
      });

        res.status(200).send({
          user:user,
          accessToken: token,
        });

    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.allUsers = (req, res) =>{
  User.findAll({where:{role:'user'}})
    .then((users)=>{
      res.send(users);
    })
}

exports.allToCheck = (req, res) =>{
  User.findAll({role:'user', nft_one:0})
    .then((users)=>{
      res.send(users);
    })
}

exports.acceptRegistration = (req, res)=>{

  if (!req.body.user_id ) {
    res.status(400).send({
      message: "User id can not be empty!",
    });
    return;
  }

  userId = req.body.user_id;
  User.findOne({where:{id:userId}})
  .then((user)=>{

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    if (user.nft_two == 1) {
      return res.status(500).send({ message: "User already has 2nd NFT." });
    }
    console.log(user.wallet_address);
    mintNFT(user.wallet_address)
    .then((result) => {
      UpdateUser({nft_two:1}, userId)
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send(error)
    });

  })
}

exports.rejectRegistration = (req, res)=>{
  if (!req.body.user_id ) {
    res.status(400).send({
      message: "User id can not be empty!",
    });
    return;
  }
  userId = req.body.user_id;
  User.findOne({where:{id:userId}})
  .then((user)=>{

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

      UpdateUser({nft_two:2}, userId)
      .then((data)=>{
          if (data.code == 200) {
              res.send('User rejected.')
          }else{
            res.status(data.code).send(res.message)
          }
      })

  })
}


exports.mintFirstNFT = (req, res)=>{
  if (!req.body.user_id ) {
    res.status(400).send({
      message: "User id can not be empty!",
    });
    return;
  }
  userId = req.body.user_id;
  User.findOne({where:{id:userId}})
  .then((user)=>{
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    if (user.nft_one == 1) {
      return res.status(500).send({ message: "User already has 1st NFT." });
    }

    mintNFT(user.wallet_address)
    .then((result) => {
      UpdateUser({nft_one:1}, userId)
      res.send(result);
    })
    .catch((error) => {
      UpdateUser({nft_one:3}, userId)
      res.status(500).send(error)
    });

  })
}

exports.mintOnAddress = (req, res)=>{
  if (!req.body.wallet_address ) {
      res.status(400).send({
        message: "Wallet address can not be empty!",
      });
      return;
    }

    mintNFT(req.body.wallet_address)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send(error)
    });


}

exports.mintSecondNFT = (req, res)=>{
  if (!req.body.user_id ) {
    res.status(400).send({
      message: "User id can not be empty!",
    });
    return;
  }
  userId = req.body.user_id;
  User.findOne({where:{id:userId}})
  .then((user)=>{
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    if (user.nft_two == 1) {
      return res.status(500).send({ message: "User already has 1st NFT." });
    }

    mintNFT(user.wallet_address)
    .then((result) => {
      UpdateUser({nft_two:1}, userId)
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send(error)
    });

  })
}

exports.count = async (req, res) =>  {

    TotalRegistrations = await User.count({where:{role:'user'}});
    frist_mint = await User.count({where:{nft_one:1}});
    second_mint = await User.count({where:{nft_two:1}});
    rejected = await User.count({where:{nft_two:2}});
    accepted = await User.count({where:{nft_two:1}});
    awating_accept = await User.count({where:{nft_two:0}});

    res.send({
      total_registered_users:TotalRegistrations,
      minted_first_nft: frist_mint,
      minted_second_nft: second_mint,
      rejected: rejected,
      accepted: accepted,
      awaiting_acceptance: awating_accept
    })
}

exports.makeAdmin =(req, res) =>{
  User.findAll({where:{name:'Admin',role:'admin'}})
  .then((a)=>{
    console.log(a.length);
    if (a.length < 1) {
      var admin = {
        name:'Admin',
        email:'admin@towngas.com',
        password: bcrypt.hashSync('TownGas@123-Admin+111', 8),
        role:'admin',
        phone:'1234'
      }
      User.create(admin)
      .then((ad)=>{
        res.send(ad)
      })
    }
    else{
      res.send('already admin')
    }
  })

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
  host: '10.1.69.33',
  port: 25,
  secure: false, // true for 465, false for other ports
  tls: { rejectUnauthorized: false }
});

function welcomeEmail_en(to,name) {
  // Generate test SMTP service account from gmail
  nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport

      // setup email data with unicode symbols
      let mailOptions = {
          from: '"Towngas" <noreply@towngas.com>', // sender address
          to: to, // list of receivers
          subject: 'Registration Confirmed: Towngas 160th Anniversary Smart Energy for a Brighter Future NFT Giveaway & Lucky Draw', // Subject line
          text: '', // plain text body
          html: 'Dear <b>' + name + '</b>, <br><br>' +
          '<img height="100px" src="https://i.imgur.com/pULlYXL.png"/>' +
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

function welcomeEmail_ch(to,name) {
  // Generate test SMTP service account from gmail
  nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport

      // setup email data with unicode symbols
      let mailOptions = {
          from: '"Towngas" <noreply@towngas.com>', // sender address
          to: to, // list of receivers
          subject: '煤氣160周年智慧燃展未來NFT暨大抽獎登記確認', // Subject line
          text: '', // plain text body
          html: '親愛的 <b>' + name + '</b>, <br><br>' +

          '<img height="100px" src="https://i.imgur.com/ExCHsn4.png"/>' +
              '<br>感謝閣下參與「煤氣160周年智慧燃展未來NFT暨大抽獎」，你已成功登記參加大抽獎。抽獎結果將於2022年9月16日，於Towngas Appliance Facebook專頁、英文虎報及星島日報內刊登及公佈。<br>' +

              '<br><br><br> 如閤下於登記時已提供MetaMask錢包地址換領煤氣紀念NFT，NFT將於24小時內傳送到，請耐心等候。歡迎按此瀏覽已鑄造的煤氣160周年紀念NFT系列。' +
              '<br><br><br> 如有任何問題，請致電6221 2956查詢，謝謝!' +
              '<br><br><br> 香港中華煤氣有限公司'+
              '<br><br><br> (本電郵由系統自動傳送，請勿直接回覆)'
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
