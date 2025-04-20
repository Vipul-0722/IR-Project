const request = require('supertest');
const express = require('express');
const analyticsRoutes = require('../routes/analyticsRoutes');
const path = require('path');
const fs = require('fs/promises');
const redis = require('../redis/redis');


jest.mock('fs/promises');
jest.mock('../redis/redis');
jest.mock('../models/Airport');

const app = express();
app.use(express.json());
app.use('/analytics', analyticsRoutes);

describe('Analytics Routes', () => {
  const mockAirportData = [
    { country: 'USA', elevation: '100', iata: 'LAX', name: 'Los Angeles', tz: 'America/Los_Angeles' },
    { country: 'USA', elevation: '200', iata: 'JFK', name: 'New York', tz: 'America/New_York' },
    { country: 'Canada', elevation: '150', iata: 'YYZ', name: 'Toronto', tz: 'America/Toronto' },
    { country: 'Canada', elevation: '', iata: '', name: 'Small Airport', tz: 'America/Toronto' },
    { country: 'Mexico', elevation: '250', iata: 'MEX', name: 'Mexico City', tz: 'America/Mexico_City' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    fs.readFile.mockResolvedValue(JSON.stringify(mockAirportData));
  });

  describe('GET /analytics/avg-elevation', () => {
    test('should return cached average elevation data if available', async () => {
      const mockData = [
        { country: 'USA', averageElevation: 150, airportCount: 2 },
        { country: 'Canada', averageElevation: 75, airportCount: 2 }
      ];
      redis.get.mockResolvedValue(JSON.stringify(mockData));

      const response = await request(app).get('/analytics/avg-elevation');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(redis.get).toHaveBeenCalledWith('avgElevation');
      expect(fs.readFile).not.toHaveBeenCalled();
    });

    test('should calculate and return average elevation per country if not cached', async () => {
      redis.get.mockResolvedValue(null);

      const response = await request(app).get('/analytics/avg-elevation');

      expect(response.status).toBe(200);
      expect(response.body).toContainEqual({
        country: 'USA',
        averageElevation: 150,
        airportCount: 2
      });
      expect(response.body).toContainEqual({
        country: 'Canada',
        averageElevation: 75,
        airportCount: 2
      });
      expect(redis.setex).toHaveBeenCalledWith(
        'avgElevation',
        12 * 60 * 60,
        expect.any(String)
      );
    });

    test('should handle empty elevation values', async () => {
      redis.get.mockResolvedValue(null);

      const response = await request(app).get('/analytics/avg-elevation');

     
      const canadaEntry = response.body.find(item => item.country === 'Canada');
      expect(canadaEntry.averageElevation).toBe(75);
    });

    test('should return 500 when calculation fails', async () => {
      redis.get.mockResolvedValue(null);
      fs.readFile.mockRejectedValue(new Error('File reading error'));

      const response = await request(app).get('/analytics/avg-elevation');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to calculate average elevations' });
    });
  });

  describe('GET /analytics/no-iata', () => {
    test('should return cached no-iata data if available', async () => {
      const mockData = {
        airports: [{ name: 'Small Airport', iata: '', country: 'Canada' }],
        count: 1,
        percentage: '20.00'
      };
      redis.get.mockResolvedValue(JSON.stringify(mockData));

      const response = await request(app).get('/analytics/no-iata');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(redis.get).toHaveBeenCalledWith('noIataAirports');
    });

    test('should calculate and return airports without IATA codes if not cached', async () => {
      redis.get.mockResolvedValue(null);

      const response = await request(app).get('/analytics/no-iata');

      expect(response.status).toBe(200);
      expect(response.body.airports).toHaveLength(1);
      expect(response.body.airports[0].name).toBe('Small Airport');
      expect(response.body.count).toBe(1);
      expect(response.body.percentage).toBe('20.00');
      expect(redis.setex).toHaveBeenCalledWith(
        'noIataAirports',
        12 * 60 * 60,
        expect.any(String)
      );
    });

    test('should return 500 when calculation fails', async () => {
      redis.get.mockResolvedValue(null);
      fs.readFile.mockRejectedValue(new Error('File reading error'));

      const response = await request(app).get('/analytics/no-iata');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to find airports without IATA codes' });
    });
  });

  describe('GET /analytics/common-timezones', () => {
    test('should return cached timezone data if available', async () => {
      const mockData = [
        { timezone: 'America/Toronto', count: 2 },
        { timezone: 'America/New_York', count: 1 }
      ];
      redis.get.mockResolvedValue(JSON.stringify(mockData));

      const response = await request(app).get('/analytics/common-timezones');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(redis.get).toHaveBeenCalledWith('commonTimezones');
    });

    test('should calculate and return common timezones if not cached', async () => {
      redis.get.mockResolvedValue(null);

      const response = await request(app).get('/analytics/common-timezones');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(4); 
      expect(response.body[0]).toEqual({
        timezone: 'America/Toronto',
        count: 2
      });
      expect(redis.setex).toHaveBeenCalledWith(
        'commonTimezones',
        12 * 60 * 60,
        expect.any(String)
      );
    });

    test('should respect the count parameter', async () => {
      redis.get.mockResolvedValue(null);

      const response = await request(app).get('/analytics/common-timezones?count=2');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should return 500 when calculation fails', async () => {
      redis.get.mockResolvedValue(null);
      fs.readFile.mockRejectedValue(new Error('File reading error'));

      const response = await request(app).get('/analytics/common-timezones');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to calculate common timezones' });
    });
  });
});