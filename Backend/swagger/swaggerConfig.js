
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airport API',
      version: '1.0.0',
      description: 'API documentation for Airport Analytics & Data',
    },
    // servers: [
    //   {
    //     url: 'http://localhost:3000',
    //     description: 'Local server',
    //   },
    // ],
  },
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
