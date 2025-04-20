
const fs = require('fs');
const csv = require('csv-parser');

const { validateAirport } = require('../utils/validateAirport');
const {  addAirportstoDB } = require('../services/airportService');


const loadCSV = (filePath) => {
  const airports = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      if (validateAirport(row)) {
        airports.push(row);
      } else {
        console.log(`Invalid data: ${JSON.stringify(row)}`);
      }
    })
    .on('end', async () => {
      console.log('CSV file successfully processed.');

      for (const airport of airports) {
        if(validateAirport(airport))
        await addAirportstoDB(airport);
      }

      console.log('All airports inserted successfully.');
    })
    .on('error', (err) => {
      console.error(`Error processing CSV: ${err.message}`);
    });
};

module.exports = loadCSV;
