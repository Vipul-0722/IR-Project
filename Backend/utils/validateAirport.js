const validateAirport = (row) => {

    const requiredFields = [
      "name", "city", "country", "iata", "icao", 
      "latitude", "longitude", "altitude", "timezone", "dst", 
      "tz_database_timezone", "type", "source"
    ];
  
    for (const field of requiredFields) {
      if (!row[field]) {
        console.error(` Missing required field: ${field}`);
        return null;
      }
    }
  

    const validatedRow = {
      name: String(row.name),
      city: String(row.city),
      country: String(row.country),
      iata: String(row.iata).toUpperCase(),
      icao: String(row.icao).toUpperCase(),
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      altitude: parseInt(row.altitude),
      timezone: String(row.timezone),
      dst: String(row.dst),
      tz_database_timezone: String(row.tz_database_timezone),
      type: String(row.type),
      source: String(row.source),
    };
  
   
    if (isNaN(validatedRow.latitude) || isNaN(validatedRow.longitude) || isNaN(validatedRow.altitude)) {
      console.error(`Invalid data types for coordinates or altitude`);
      return null;
    }
  
  
    return validatedRow;
  };
  
  module.exports = validateAirport;
  