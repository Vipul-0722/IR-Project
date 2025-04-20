using { com.airport as airport } from '../db/schema';

service CatalogService {
  entity Airports as projection on airport.Airports;
  
  function searchAirports(
    query : String, 
    sort : String,
    order : String,
    page : Integer,
    limit : Integer
  ) returns many Airports;

  @action
  action addNewAirport(data: {
    city: String;
    country: String;
    state: String;
    iata: String;
    icao: String;
    elevation: Integer;
    lat: Decimal;
    lon: Decimal;
    tz: String;
    name: String;
  }) returns {
    message: String;
  };

  function calculateAvgElevationByCountry() returns array of {
    country: String;
    avgElevation: Decimal;
  };
  
  // Function to find airports without IATA codes
  function findAirportsWithoutIATA() returns array of Airports;
  
  // Function to get 10 most common timezones
  function getMostCommonTimezones() returns array of {
    timezone: String;
    count: Integer;
  };
}