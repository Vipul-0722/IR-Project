const express = require('express');
const router = express.Router();
const {
  insertAirport,
  searchAirports,
  getAirportSuggestions
} = require('../services/airportService');
const Airport = require('../models/Airport');
const redis = require('../redis/redis');


/**
 * @swagger
 * /airports/add:
 *   post:
 *     summary: Add a new airport
 *     tags: [Airports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               iata:
 *                 type: string
 *               iso:
 *                 type: string
 *               lat:
 *                 type: number
 *               lon:
 *                 type: number
 *               tz:
 *                 type: string
 *               elevation:
 *                 type: number
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: Airport added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *       500:
 *         description: Insert failed
 */


router.post('/add', async (req, res) => {
  try {
    const savedAirport = await insertAirport(req.body);
    res.status(201).json({ message: 'Airport added successfully', id: savedAirport._id });
  } catch (err) {
    res.status(500).json({ error: 'Insert failed', details: err.message });
  }
});

/**
 * @swagger
 * /airports/search:
 *   get:
 *     summary: Search for airports
 *     tags: [Airports]
 *     description: Search airports with optional pagination, sorting, and filtering
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 2
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated airport search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */

router.get('/search', async (req, res) => {
    const { query, sort, order, page = 1, limit = 2 } = req.query;
  
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
  
    const results = await searchAirports(query, pageNumber, limitNumber, sort, order);
  
    res.json({
      page: pageNumber,
      limit: limitNumber,
      totalResults: results.total, 
      data: results.hits
    });
});


/**
 * @swagger
 * /airports/autocomplete:
 *   get:
 *     summary: Get airport suggestions for autocomplete
 *     tags: [Airports]
 *     parameters:
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: Term to autocomplete
 *     responses:
 *       200:
 *         description: List of autocomplete suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Failed to get suggestions
 */

router.get('/autocomplete', async (req, res) => {
    try {
        const { term } = req.query;
        const results = await getAirportSuggestions(term);
        res.json(results);
      } catch (error) {
        console.error('Error with autocomplete suggestions:', error);
        res.status(500).json({ error: 'Failed to get suggestions' });
      }
});

/**
 * @swagger
 * /airports/stats:
 *   get:
 *     summary: Get general statistics about airports
 *     tags: [Airports]
 *     responses:
 *       200:
 *         description: Airport statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of airports
 *                 highElevation:
 *                   type: integer
 *                   description: Number of airports with elevation above 4000
 *                 countries:
 *                   type: integer
 *                   description: Number of unique countries with airports
 *       500:
 *         description: Internal server error
 */

router.get('/stats', async (req, res) => {
    try {

      const cachedStats = await redis.get('airportStats');
      if (cachedStats) {
      return res.status(200).json(JSON.parse(cachedStats)); 
     }

      const total = await Airport.countDocuments();
  
      const highElevation = await Airport.countDocuments({ elevation: { $gt: 8000 } });
  
      const countries = await Airport.distinct('country');
      const countryCount = countries.length;
  

      const stats = {
        total,
        highElevation,
        countries: countryCount
      };
  
      res.status(200).json(stats); 
      await redis.setex('airportStats', 12 * 60 * 60, JSON.stringify(stats));

    } catch (err) {
      console.error('Error fetching airport stats:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
