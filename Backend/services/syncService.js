const Airport = require('../models/Airport');
const esClient = require('../elastic/client');

const bulkSyncAirportsToES = async () => {
    try {
      const airports = await Airport.find({});
      if (airports.length === 0) {
        console.log("No airports found to sync.");
        return;
      }
  
      const bulkBody = airports.flatMap(airport => [
        { index: { _index: 'airports', _id: airport._id.toString() } },
        {
          icao: airport.icao,
          iata: airport.iata,
          name: airport.name,
          city: airport.city,
          state: airport.state,
          country: airport.country,
          elevation: airport.elevation,
          lat: airport.lat || 0,
          lon: airport.lon || 0,
          tz: airport.tz,
          region :`${airport.country}-${airport.state}`
        
        }
      ]);
  
      const { body: bulkResponse } = await esClient.bulk({ body: bulkBody });
      console.log(" Successfully synced all airports to Elasticsearch.");
  
      // const failedItems = bulkResponse.filter(item => item.index?.error);
      // if (failedItems.length > 0) {
      //   console.error("Some records failed to index:", failedItems);
      // } else {
      //   console.log(" Successfully synced all airports to Elasticsearch.");
      // }
  
    } catch (err) {
      console.error("Error syncing airports to Elasticsearch:", err);
    }
  };

  module.exports = {
    bulkSyncAirportsToES
  };
  