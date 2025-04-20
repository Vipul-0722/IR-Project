const express = require('express');
const loadCSV = require('../loaders/csvLoader');
const loadJSON = require('../loaders/jsonLoader');
const { bulkSyncAirportsToES } = require('../services/syncService');
const router = express.Router();


router.post('/load-csv', (req, res) => {
    const filePath = req.body.filePath; 
    loadCSV(filePath);
    res.send('CSV data loading started...');
});

router.post('/load-json', (req, res) => {
    const filePath = req.body.filePath; 
    loadJSON(filePath);
    res.send('JSON data loading started...');
});

// Sync airports to Elasticsearch
router.get('/sync-airports', async (req, res) => {
    try {
        console.log('Starting sync of airports to Elasticsearch...');
        await bulkSyncAirportsToES()
        res.status(200).send('Syncing airports to Elasticsearch has started.');
      } catch (error) {
        console.error('Error during sync operation:', error);
        res.status(500).send('Error syncing airports to Elasticsearch.');
      }
});

module.exports = router;
