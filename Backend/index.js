const express = require('express');
const cors = require('cors');
const airportRoutes = require('./routes/airportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const data = require('./routes/data');
require('./jobs/airportSync');
const connectDB = require('./db/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerConfig'); 
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(cors());

connectDB()
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/data', data);
app.use('/airports/analytics', analyticsRoutes);
app.use('/airports', airportRoutes);

app.listen(8080, () => {
  console.log(`Server is running on port ${PORT}`);
});

