const request = require('supertest');
const express = require('express');
const airportRoutes = require('../routes/airportRoutes');
const Airport = require('../models/Airport');
const redis = require('../redis/redis');


jest.mock('../models/Airport');
jest.mock('../redis/redis');
jest.mock('../services/airportService');
jest.mock('../elastic/client');

const airportService = require('../services/airportService');


const app = express();
app.use(express.json());
app.use('/airports', airportRoutes);

describe('Airport Routes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /airports/add', () => {
    test('should add a new airport and return 201 status', async () => {
    
      const mockAirport = { _id: 'abc123', name: 'Test Airport' };
      airportService.insertAirport.mockResolvedValue(mockAirport);

      const response = await request(app)
        .post('/airports/add')
        .send({ name: 'Test Airport', iata: 'TST', country: 'Test Country' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ 
        message: 'Airport added successfully', 
        id: 'abc123' 
      });
      expect(airportService.insertAirport).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Airport' })
      );
    });

    test('should return 500 when insert fails', async () => {
      airportService.insertAirport.mockRejectedValue(new Error('Insert failed'));

      const response = await request(app)
        .post('/airports/add')
        .send({ name: 'Test Airport' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ 
        error: 'Insert failed', 
        details: 'Insert failed' 
      });
    });
  });

  describe('GET /airports/autocomplete', () => {
    test('should return airport suggestions based on search term', async () => {
      const mockSuggestions = [
        { name: 'Test Airport 1', iata: 'TST' },
        { name: 'Test Airport 2', iata: 'TS2' }
      ];
      airportService.getAirportSuggestions.mockResolvedValue(mockSuggestions);

      const response = await request(app)
        .get('/airports/autocomplete')
        .query({ term: 'Test' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSuggestions);
      expect(airportService.getAirportSuggestions).toHaveBeenCalledWith('Test');
    });

    test('should return 500 when suggestion retrieval fails', async () => {
      airportService.getAirportSuggestions.mockRejectedValue(new Error('Failed to get suggestions'));

      const response = await request(app)
        .get('/airports/autocomplete')
        .query({ term: 'Test' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to get suggestions' });
    });
  });

  describe('GET /airports/stats', () => {
    test('should return cached stats if available', async () => {
      const mockStats = { total: 100, highElevation: 25, countries: 50 };
      redis.get.mockResolvedValue(JSON.stringify(mockStats));

      const response = await request(app).get('/airports/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
      expect(redis.get).toHaveBeenCalledWith('airportStats');
      expect(Airport.countDocuments).not.toHaveBeenCalled();
    });

    test('should fetch and return stats if not cached', async () => {
      redis.get.mockResolvedValue(null);
      Airport.countDocuments.mockImplementation((query) => {
        if (query && query.elevation) {
          return Promise.resolve(25);
        }
        return Promise.resolve(100);
      });
      Airport.distinct.mockResolvedValue(['USA', 'Canada', 'Mexico']);

      const response = await request(app).get('/airports/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        total: 100,
        highElevation: 25,
        countries: 3
      });
      expect(redis.setex).toHaveBeenCalledWith(
        'airportStats',
        12 * 60 * 60,
        JSON.stringify({
          total: 100,
          highElevation: 25,
          countries: 3
        })
      );
    });

    test('should return 500 when stats retrieval fails', async () => {
      redis.get.mockResolvedValue(null);
      Airport.countDocuments.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/airports/stats');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });
});