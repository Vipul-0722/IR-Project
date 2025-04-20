const fs = require('fs');
const { addAirportstoDB } = require('../services/airportService');


const loadJSON = (filePath) => {
    fs.readFile(filePath, 'utf8', async (err, data) => {
      if (err) {
        console.error(`Error reading JSON file: ${err.message}`);
        return;
      }
  
      try {
        const airports = JSON.parse(data);
  
        for (const key in airports) {
          if (airports.hasOwnProperty(key)) {
            const airport = airports[key];
            await addAirportstoDB(airport);
          }
        }
  
        console.log(' All airports inserted successfully from JSON.');
      } catch (parseErr) {
        console.log(parseErr,"parseErr")
        console.error(`Error parsing JSON file: ${parseErr.message}`);
      }
    });
  };

module.exports = loadJSON;
