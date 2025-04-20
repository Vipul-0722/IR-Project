const request = require('supertest');
const express = require('express');
const cors = require('cors');
const connectDB = require('../db/db');


jest.mock('../db/db', () => jest.fn().mockResolvedValue());
jest.mock('../jobs/airportSync', () => ({}));

jest.mock('swagger-ui-express', () => ({
  serve: [(req, res, next) => next()],  
  setup: () => (req, res, next) => next()  
}));
jest.mock('../swagger/swaggerConfig', () => ({}));


jest.mock('../routes/airportRoutes', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/test', (req, res) => res.json({ route: 'airportRoutes' }));
  return router;
});

jest.mock('../routes/analyticsRoutes', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/test', (req, res) => res.json({ route: 'analyticsRoutes' }));
  return router;
});

jest.mock('../routes/data', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/test', (req, res) => res.json({ route: 'data' }));
  return router;
});


const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger/swaggerConfig');


const app = express();
app.use(express.json());
app.use(cors());


connectDB();


app.get('/', (req, res) => {
  res.send('Server is up and running!');
});


const airportRoutes = require('../routes/airportRoutes');
const analyticsRoutes = require('../routes/analyticsRoutes');
const data = require('../routes/data');


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/data', data);
app.use('/airports/analytics', analyticsRoutes);
app.use('/airports', airportRoutes);

describe('Main Express App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  test('should respond with server status message on root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Server is up and running!');
  });

  test('should correctly route to airportRoutes', async () => {
    const response = await request(app).get('/airports/test');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ route: 'airportRoutes' });
  });

  test('should correctly route to analyticsRoutes', async () => {
    const response = await request(app).get('/airports/analytics/test');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ route: 'analyticsRoutes' });
  });

  test('should correctly route to data', async () => {
    const response = await request(app).get('/data/test');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ route: 'data' });
  });

 
});