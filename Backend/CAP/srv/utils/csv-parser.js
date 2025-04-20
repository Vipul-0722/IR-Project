const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/**
 * Parses a CSV file and returns the data as an array of objects
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Array of objects
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Convert numeric values
        const processedResults = results.map(item => {
          return {
            ...item,
            elevation: item.elevation ? parseInt(item.elevation) : 0,
            lat: item.lat ? parseFloat(item.lat) : 0,
            lon: item.lon ? parseFloat(item.lon) : 0
          };
        });
        resolve(processedResults);
      })
      .on('error', (error) => reject(error));
  });
}

module.exports = {
  parseCSV
};