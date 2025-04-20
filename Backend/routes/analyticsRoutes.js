
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const Airport = require('../models/Airport'); 
const redis = require('../redis/redis');
const router = express.Router();


async function loadAirportData() {
  const dataPath = path.join(__dirname, '../airports-sample.json');
  const data = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(data);
}


router.get('/stats', async (req, res) => {
  try {
    const total = await Airport.countDocuments();
    const highElevation = await Airport.countDocuments({ elevation: { $gt: 8000 } });
    const countries = await Airport.distinct('country');
    const countryCount = countries.length;

    res.status(200).json({
      total,
      highElevation,
      countries: countryCount
    });
  } catch (err) {
    console.error('Error fetching airport stats:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
@swagger
 * /airports/analytics/avg-elevation:
 *   get:
 *     summary: Get average elevation of airports by country
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Average elevation per country
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                   averageElevation:
 *                     type: number
 *                   airportCount:
 *                     type: integer
 */
router.get('/avg-elevation', async (req, res) => {
    try {

        const cachedAvgElevation = await redis.get('avgElevation');
        if (cachedAvgElevation) {
          console.log(cachedAvgElevation,"cachedAvgElevation")
          return res.json(JSON.parse(cachedAvgElevation)); // Return cached data
        }

        const data = await loadAirportData()
      
        const airports = data;
      
        const airportList = Array.isArray(airports)
          ? airports
          : Object.values(airports); 
      
        const countryElevations = {};
      
        airportList.forEach(airport => {
          const country = airport.country;
          const elevation = parseFloat(airport.elevation) || 0;
      
          if (!countryElevations[country]) {
            countryElevations[country] = {
              totalElevation: 0,
              count: 0,
            };
          }
      
          countryElevations[country].totalElevation += elevation;
          countryElevations[country].count += 1;
        });
      
        const averageElevationPerCountry = [];
  
        for (const country in countryElevations) {
          const { totalElevation, count } = countryElevations[country];
          averageElevationPerCountry.push({
            country,
            averageElevation: parseFloat((totalElevation / count).toFixed(2)),
            airportCount: count
          });
        }
        res.json(averageElevationPerCountry);
        await redis.setex('avgElevation', 12 * 60 * 60, JSON.stringify(averageElevationPerCountry));
     
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to calculate average elevations' });
      }
});




/**
 * @swagger
 * /airports/analytics/no-iata:
 *   get:
 *     summary: Get airports without IATA codes
 *     tags: [Analytics]
 *     description: Returns a list of airports missing IATA codes along with count and percentage.
 *     responses:
 *       200:
 *         description: List of airports without IATA codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 airports:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       iata:
 *                         type: string
 *                       iso:
 *                         type: string
 *                       lat:
 *                         type: number
 *                       lon:
 *                         type: number
 *                       tz:
 *                         type: string
 *                 count:
 *                   type: integer
 *                   description: Number of airports with missing IATA codes
 *                 percentage:
 *                   type: string
 *                   description: Percentage of airports missing IATA codes
 *       500:
 *         description: Failed to find airports without IATA codes
 */

router.get('/no-iata', async (req, res) => {
    try {

        const cachedNoIata = await redis.get('noIataAirports');
        if (cachedNoIata) {
          return res.json(JSON.parse(cachedNoIata)); // Return cached data
        }
        const airports = await loadAirportData();
        
        const airportList = Array.isArray(airports)
        ? airports
        : Object.values(airports); 
  
        const noIataAirports = airportList.filter(airport => 
          !airport.iata || airport.iata.trim() === ''
        );
  
        
        const result = {
          airports: noIataAirports,
          count: noIataAirports.length,
          percentage: ((noIataAirports.length / airportList.length) * 100).toFixed(2)
        };
        
        await redis.setex('noIataAirports', 12 * 60 * 60, JSON.stringify(result));


        res.json(result);
      } catch (error) {
      console.log(error,"no-iata")
        res.status(500).json({ error: 'Failed to find airports without IATA codes' });
      }
});
/**
 * @swagger
 * /airports/analytics/common-timezones:
 *   get:
 *     summary: Get most common timezones used by airports
 *     tags: [Analytics]
 *     description: Returns the most frequently occurring timezones among airports.
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top timezones to return
 *     responses:
 *       200:
 *         description: List of common timezones with their occurrence counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   timezone:
 *                     type: string
 *                   count:
 *                     type: integer
 *       500:
 *         description: Failed to calculate common timezones
 */

router.get('/common-timezones', async (req, res) => {
    try {

        const cachedTimezones = await redis.get('commonTimezones');
       
        if (cachedTimezones) {
          return res.json(JSON.parse(cachedTimezones)); 
        }

        const airports = await loadAirportData();
        const count = parseInt(req.query.count) || 10; 
        
        const airportList = Array.isArray(airports)
        ? airports
        : Object.values(airports); 
      
        const timezoneCount = {};
        
        airportList.forEach(airport => {
          const timezone = airport.tz;
          if (timezone) {
            timezoneCount[timezone] = (timezoneCount[timezone] || 0) + 1;
          }
        });
        
       
        const sortedTimezones = Object.keys(timezoneCount)
          .map(timezone => ({
            timezone,
            count: timezoneCount[timezone]
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, count);
        
        res.json(sortedTimezones);

        await redis.setex('commonTimezones', 12 * 60 * 60, JSON.stringify(sortedTimezones));

      } catch (error) {
        res.status(500).json({ error: 'Failed to calculate common timezones' });
      }
});

module.exports = router;
