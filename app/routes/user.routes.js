const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const { verifySignUp } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );

    next();
  });


  app.post("/api/user", [verifySignUp.checkDuplicate], controller.createUser);


  app.post("/api/admin/login", controller.signin);
  app.get("/api/admin/all_users", [], controller.allUsers);
  app.get("/api/admin/make", controller.makeAdmin);

  // app.get("/api/admin/count", [ authJwt.verifyToken, authJwt.isAdmin], controller.count);
  // app.post("/api/admin/accept", [ authJwt.verifyToken, authJwt.isAdmin], controller.acceptRegistration);
  // app.post("/api/admin/reject", [ authJwt.verifyToken, authJwt.isAdmin], controller.rejectRegistration);
  // app.post("/api/admin/mint_first", [ authJwt.verifyToken, authJwt.isAdmin], controller.mintFirstNFT);
  // app.post("/api/admin/mint_second", [ authJwt.verifyToken, authJwt.isAdmin], controller.mintSecondNFT);
  // app.post("/api/admin/mint_on_address", [ authJwt.verifyToken, authJwt.isAdmin], controller.mintOnAddress);

};
