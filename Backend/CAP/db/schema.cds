namespace com.airport;

entity Airports {
  key icao : String;
  iata : String;
  name : String;
  city : String;
  state : String;
  country : String;
  elevation : Integer;
  lat : Decimal;
  lon : Decimal;
  tz : String;
}