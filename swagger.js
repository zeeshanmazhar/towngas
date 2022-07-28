
const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./app/routes/*.js']

const doc = {
    info: {
      title: 'Towngas App',
      description: 'Towngas App APIs',
    },
    host: 'localhost:8080',
    schemes: ['http'],
  };

swaggerAutogen(outputFile, endpointsFiles, doc)