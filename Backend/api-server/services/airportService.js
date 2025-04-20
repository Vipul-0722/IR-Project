const Airport = require('../models/Airport');
const esClient = require('../elastic/client');

const NUMERIC_FIELDS = ['elevation', 'lat', 'lon'];
const CircuitBreaker = require('opossum');


const addAirportstoDB = async (airportData) => {
    try {
      const region = `${airportData.country || 'Unknown'}-${airportData.state || 'Unknown'}`;
      const airport = new Airport({ ...airportData, region }); 
      const saved = await airport.save();
      console.log("Inserted airport with ID:", saved._id);
    } catch (err) {
      console.error("Error inserting airport data:", err);
    }
  };


const searchAirports = async (query, page = 1, limit = 10, sort = 'city', order = 'asc') => {
    try {
        const result = await breaker.fire(query, page, limit, sort, order);
        return {
          hits: result.hits.hits,
          total: result.hits.total.value,
        };
      } catch (error) {
        console.error('Error during airport search:', error);
        throw error; 
      }
  };
  
  const queryES = async (query, page = 1, limit = 10, sort = 'city', order = 'asc') => {
    const from = (page - 1) * limit;
    const sortField = NUMERIC_FIELDS.includes(sort) ? sort : `${sort}.keyword`;
  
    let queryBody;
    
    if (!query || query.trim() === '') {
      queryBody = { match_all: {} };
    } else {
      queryBody = {
        bool: {
          should: [
            { match_phrase_prefix: { name: { query: query, boost: 3 } } },
            { match_phrase_prefix: { iata: { query: query, boost: 2 } } },
            { match_phrase_prefix: { icao: { query: query } } },
            { match_phrase_prefix: { city: { query: query } } },
            { fuzzy: { name: { value: query, fuzziness: "AUTO" } } }
          ],
          minimum_should_match: 1
        }
      };
    }
  
    const result = await esClient.search({
      index: 'airports',
      body: {
        query: queryBody,
        sort: [
          {
            [sortField]: {
              order: order,
            },
          },
        ],
        from,
        size: limit,
        track_total_hits: true
      },
    });
  
    return result;
  };
  

  const breaker = new CircuitBreaker(queryES, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
  });

  breaker.fallback(async (query, page, limit, sort, order) => {
    console.log('ES is down, using MongoDB fallback');
    return queryMongo(query, page, limit, sort, order);
});


const insertAirport = async (airportInput) => {
    const {
        icaoCode,
        iataCode,
        airportName,
        city,
        countryCode,
        elevation,
        timezone,
        latitude,
        longitude,
        state
      } = airportInput;
    
      const region = `${countryCode}-${state}`;
    
      const airportData = {
        icao: icaoCode,
        iata: iataCode,
        name: airportName,
        city,
        country: countryCode,
        elevation: parseFloat(elevation),
        lat: parseFloat(latitude),
        lon: parseFloat(longitude),
        tz: timezone,
        region
      };
    
      const airport = new Airport(airportData);
      const savedAirport = await airport.save();
    
      await esClient.index({
        index: 'airports',
        id: savedAirport._id.toString(),
        document: airportData
      });
    
      return savedAirport;
  };
  

const queryMongo = async (query, page = 1, limit = 10, sort = 'city', order = 'asc') => {
    console.log("Mongo fallback called")
    const from = (page - 1) * limit;
    const sortField = sort;  
  
    try {

      const regexQuery = new RegExp(query, 'i');  
  
      const results = await Airport.find({ name: regexQuery })
        .skip(from)  
        .limit(limit) 
        .sort({ [sortField]: order === 'asc' ? 1 : -1 });  
  
    
      const totalResults = await Airport.countDocuments({ name: regexQuery });
  
      const wrappedResults = results.map(doc => ({
        _index: 'airports',
        _id: doc._id,
        _score: null,
        _source: doc.toObject(), 
      }));
  
      return {
        hits: {
          hits: wrappedResults,
          total: {
            value: totalResults,
          },
        },
      };
      
    } catch (error) {
      throw new Error('MongoDB query failed');
    }
  };
  

// const searchAirports = async (query, page = 1, limit = 10, sort = 'city', order = 'asc') => {
//     const from = (page - 1) * limit;
//     const sortField = NUMERIC_FIELDS.includes(sort) ? sort : `${sort}.keyword`;
  

    // let queryBody;
    
    // if (!query || query.trim() === '') {
    //   // If no query, match all documents
    //   queryBody = { match_all: {} };
    // } else {
    //   // If we have a query, use a more sophisticated search
    //   queryBody = {
    //     bool: {
    //       should: [
    //         { match_phrase_prefix: { name: { query: query, boost: 3 } } },
    //         { match_phrase_prefix: { iata: { query: query, boost: 2 } } },
    //         { match_phrase_prefix: { icao: { query: query } } },
    //         { match_phrase_prefix: { city: { query: query } } },
    //         { fuzzy: { name: { value: query, fuzziness: "AUTO" } } }
    //       ],
    //       minimum_should_match: 1
    //     }
    //   };
    // }
  
    // const result = await esClient.search({
    //   index: 'airports',
    //   body: {
    //     query: queryBody,
    //     sort: [
    //       {
    //         [sortField]: {
    //           order: order,
    //         },
    //       },
    //     ],
    //     from,
    //     size: limit,
    //     track_total_hits: true
    //   },
    // });
  
//     return {
//       hits: result.hits.hits,
//       total: result.hits.total.value
//     };
//   };


  const getAirportSuggestions = async (term) => {
    if (!term || term.length < 2) {
      return { suggestions: [] };
    }
  
    try {
      const result = await esClient.search({
        index: 'airports',
        body: {
          size: 10, 
          _source: ["name", "iata", "icao", "city", "country"], 
          query: {
            multi_match: {
              query: term,
              fields: ['name^3', 'iata^2', 'icao'],
              type: "phrase_prefix", 
            }
          }
        }
      });
  
    
      const suggestions = result.hits.hits.map(hit => ({
        id: hit._id,
        name: hit._source.name,
        iata: hit._source.iata,
        icao: hit._source.icao,
        city: hit._source.city,
        country: hit._source.country,
        display: `${hit._source.name} ${hit._source.iata ? `(${hit._source.iata})` : ''}`
      }));
   
      return { suggestions };
    } catch (error) {
      console.error('Error getting airport suggestions:', error);
      throw error;
    }
  };


module.exports = {
  insertAirport,
  searchAirports,
  getAirportSuggestions,
  addAirportstoDB
};
