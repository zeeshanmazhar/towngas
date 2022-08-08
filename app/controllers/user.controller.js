const db = require("../models");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = db.user;

const User1 = db.user1;

const { verifySignUp } = require("../middlewares");
var cron = require('node-cron');
const mintNFT = require("../middlewares/minter");

cron.schedule('*/10 * * * *', () => {
   User.findAll({where:{server:false}})
  .then((user)=>{
   user.forEach(u => {
    User1.create({
      email:u.email,
      name:u.name,
      phone:u.phone,
      wallet_address:u.wallet_address,
      order_no:u.order_no,
      purchase_date:u.purchase_date,
      nft_one:u.nft_one,
      nft_two:u.nft_two
    })
   });
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

