const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const { Airports } = this.entities;
  let airportsData = [];
  try {
    const rawData = fs.readFileSync(path.join(__dirname, 'airports.json'), 'utf8');
    const parsedData = JSON.parse(rawData); // ✅ Important!

    // Convert to array if the object uses ICAO codes as keys
    const jsonData = Array.isArray(parsedData)
      ? parsedData
      : Object.values(parsedData);

    airportsData = jsonData.map(airport => {
      return {
        icao: airport.icao,                
        iata: airport.iata || '',
        name: airport.name || '',
        city: airport.city || '',
        state: airport.state || '',
        country: airport.country || '',
        elevation: airport.elevation || 0,
        lat: airport.lat || 0,
        lon: airport.lon || 0,
        tz: airport.tz || '',
        region: airport.state ? `${airport.country}-${airport.state}` : airport.country
      };
    });

    const db = await cds.connect.to('db');
    await db.run(DELETE.from(Airports)); // clear table before insert
    await db.run(INSERT.into(Airports).entries(airportsData));
    console.log('✅ Airport data loaded successfully.');

  } catch (err) {
    console.error(' Error loading airport data:', err);
  }
  


  this.on('searchAirports', async (req) => {
    console.log(req, "Request Received");

  
    const { query = '', sort = 'city', order = 'asc', page = 1, limit = 10 } = req.data;
    const offset = (page - 1) * limit;

   
    const validSortFields = ['name', 'city', 'country', 'state', 'iata', 'icao', 'elevation', 'region'];
    const sortField = validSortFields.includes(sort) ? sort : 'city';
    
   
    let whereClause = {};
    if (query && query.trim() !== '') {
      whereClause[sortField] = { like: `%${query}%` };
    }

    const db = await cds.connect.to('db');


   // Build the main query with filtering, sorting, and pagination
   const q = SELECT.from(Airports)
  .where(whereClause)
  .orderBy({ [sortField]: order.toUpperCase() })
  .limit(limit, offset);


    // Fetch the filtered, sorted, and paginated data
    const data = await db.run(q);
const countQuery = SELECT.one.from(Airports).columns('count(*) as count');
if (Object.keys(whereClause).length > 0) {
  countQuery.where(whereClause);
}
const countResult = await db.run(countQuery);
const totalResults = countResult?.count || 0;
    return { totalResults, data };
  });

  this.on('addNewAirport', async (req) => {
    console.log("got int")
     const { name, city, country, state, iata, icao, elevation, lat, lon, tz } = req.data.data;
  
    // Optional: Validate required fields
    if (!name || !city || !country || !iata) {
      return req.error(400, 'Missing required fields: name, city, country, iata');
    }
  
    try {
      const db = await cds.connect.to('db');
      await db.run(
        INSERT.into(Airports).entries({
          name,
          city,
          country,
          state,
          iata,
          icao,
          elevation,
          lat,
          lon,
          tz,
          region: country ? `${country}-${state}` : country
        })
      );
      console.log("inserted")
      return { message: 'Airport added successfully' };
    } catch (error) {
      console.error('Error adding airport:', error);
      return req.error(500, 'Failed to add airport');
    }
  });
  

  

// this.on('addAirport', async (req) => {
//     const { name, city, country, state, iata, icao, elevation, lat ,lon,tz } = req.data;

//     // Optional: Validate required fields
//     if (!name || !city || !country || !iata) {
//       return req.error(400, 'Missing required fields: name, city, country, iata');
//     }

//     const db = await cds.connect.to('db');

//     try {
//       const newAirport = await db.run(
//         INSERT.into(Airports).entries({
//           name,
//           city,
//           country,
//           state,
//           iata,
//           icao,
//           elevation,
//           lat,
//           lon,
//           tz,
//         })
//       );

//       return { message: 'Airport added successfully', result: newAirport };
//     } catch (error) {
//       console.error('Error adding airport:', error);
//       return req.error(500, 'Failed to add airport');
//     }
//   });


  this.on('calculateAvgElevationByCountry', async () => {
    const db = await cds.connect.to('db');
    return db.run(`
      SELECT country, AVG(elevation) as avgElevation 
      FROM com_airport_Airports 
      GROUP BY country 
      ORDER BY avgElevation DESC
    `);
  });
  
  this.on('findAirportsWithoutIATA', async () => {
    const db = await cds.connect.to('db');
    return db.run(
      SELECT.from(Airports).where({ iata: null }).or({ iata: '' })
    );
  });
  
  this.on('getMostCommonTimezones', async () => {
    const db = await cds.connect.to('db');
    return db.run(`
      SELECT tz as timezone, COUNT(*) as count 
      FROM com_airport_Airports 
      GROUP BY tz 
      ORDER BY count DESC 
      LIMIT 10
    `);
  });
});