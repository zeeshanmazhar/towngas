require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./app/config/config.js");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerFile = require('./swagger_output.json')

const app = express();
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
// const expressSwagger = require('express-swagger-generator')(app);
// let options = {
//   swaggerDefinition: {
//       info: {
//           description: 'This is a sample server',
//           title: 'Swagger',
//           version: '1.0.0',
//       },
//       host: 'localhost:8080',
//       basePath: '',
//       produces: [
//           "application/json",
//           "application/xml"
//       ],
//       schemes: ['http', 'https'],
//       securityDefinitions: {
//           JWT: {
//               type: 'apiKey',
//               in: 'header',
//               name: 'Authorization',
//               description: "",
//           }
//       }
//   },
//   basedir: __dirname, //app absolute path
//   files: ['./app/routes/*.js'] //Path to the API handle folder
// };
// expressSwagger(options)

const corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static('public'));

// database
const db = require("./app/models");
const { SMALLINT } = require("sequelize");

db.sequelize.sync().then(() => {

});

// simple route
app.get("/", (req, res) => {
  res.json({ message: "-" });
});

// api routes

require("./app/routes/user.routes")(app);

// const swaggerOptions = {
//   swaggerDefinition: {
//     info: {
//       title: 'HYYP APIs',
//       description:'',
//       contact:{
//         name:'HYYP Dev',
//       },
//       servers: ['http://localhost:8080'],
//     },
//   },
//   apis: ['./app/routes/*.js'], // files containing annotations as above
// };
//  const swaggerDocs = swaggerJsdoc(swaggerOptions);
// app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// set port, listen for requests
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
