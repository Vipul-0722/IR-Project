const mongoose = require('mongoose');
const airportSchema = new mongoose.Schema({
    _key: String,
    icao: String,
    iata: String,
    name: String,
    city: String,
    state: String,
    country: String,
    elevation: Number,
    lat: Number,
    lon: Number,
    tz: String,
    region: String 
  });
  

  module.exports = mongoose.model('Airport', airportSchema);