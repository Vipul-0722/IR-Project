import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const AirportAnalytics = () => {
  const [activeTab, setActiveTab] = useState('elevation');
  const [elevationData, setElevationData] = useState([]);
  const [noIataData, setNoIataData] = useState({ airports: [], count: 0, percentage: 0 });
  const [timezoneData, setTimezoneData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch data based on active tab
        if (activeTab === 'elevation') {
          const response = await axios.get('http://api.api.d6d7c75.kyma.ondemand.com/airports/analytics/avg-elevation');
          setElevationData(response.data);
        } else if (activeTab === 'iata') {
          const response = await axios.get('http://api.api.d6d7c75.kyma.ondemand.com/airports/analytics/no-iata');
          setNoIataData(response.data);
        } else if (activeTab === 'timezone') {
          const response = await axios.get('http://api.api.d6d7c75.kyma.ondemand.com/airports/analytics/common-timezones');
          setTimezoneData(response.data);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Function to render elevation chart
  const renderElevationChart = () => {
   

    const topCountries = elevationData
    .sort((a, b) => b.averageElevation - a.averageElevation)
    .slice(0, 15);



    
    return (
      <div className="chart-container">
        <h3>Average Airport Elevation by Country (Top 15)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topCountries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="country" />
            <YAxis label={{ value: 'Elevation (ft)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => [`${value} ft`, 'Avg. Elevation']} />
            <Legend />
            <Bar dataKey="averageElevation" name="Average Elevation (ft)" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
        <div className="table-container">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Average Elevation (ft)</th>
                <th>Number of Airports</th>
              </tr>
            </thead>
            <tbody>
              {elevationData.map((item, index) => (
                <tr key={index}>
                  <td>{item.country}</td>
                  <td>{item.averageElevation.toFixed(2)}</td>
                  <td>{item.airportCount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Function to render airports without IATA
  const renderNoIataTable = () => {
    return (
      <div className="no-iata-container">
        <div className="stats-card">
          <h3>Airports Without IATA Codes</h3>
          <div className="stat-value">{noIataData.count.toLocaleString()}</div>
          <div className="stat-label">({noIataData.percentage}% of total airports)</div>
        </div>
        
        <div className="table-container">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>ICAO</th>
                <th>Name</th>
                <th>City</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {noIataData.airports.slice(0, 100).map((airport, index) => (
                <tr key={index}>
                  <td>{airport.icao}</td>
                  <td>{airport.name}</td>
                  <td>{airport.city}</td>
                  <td>{airport.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {noIataData.airports.length > 100 && (
            <div className="table-note">Showing first 100 of {noIataData.airports.length} airports</div>
          )}
        </div>
      </div>
    );
  };

  // Function to render timezone chart
  const renderTimezoneChart = () => {
    return (
      <div className="chart-container">
        <h3>Top 10 Most Common Airport Timezones</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={timezoneData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="timezone" type="category" width={210} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Number of Airports" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
        <div className="table-container">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Timezone</th>
                <th>Number of Airports</th>
              </tr>
            </thead>
            <tbody>
              {timezoneData.map((item, index) => (
                <tr key={index}>
                  <td>{item.timezone}</td>
                  <td>{item.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="analytics-container">
      <h2>Airport Data Analytics</h2>
      
      <div className="tabs">
        <button 
          className={activeTab === 'elevation' ? 'active' : ''}
          onClick={() => setActiveTab('elevation')}
        >
          Average Elevation
        </button>
        <button 
          className={activeTab === 'iata' ? 'active' : ''}
          onClick={() => setActiveTab('iata')}
        >
          Missing IATA Codes
        </button>
        <button 
          className={activeTab === 'timezone' ? 'active' : ''}
          onClick={() => setActiveTab('timezone')}
        >
          Common Timezones
        </button>
      </div>
      
      <div className="tab-content">
        {loading && <div className="loading">Loading data...</div>}
        {error && <div className="error">{error}</div>}
        
        {!loading && !error && (
          <>
            {activeTab === 'elevation' && renderElevationChart()}
            {activeTab === 'iata' && renderNoIataTable()}
            {activeTab === 'timezone' && renderTimezoneChart()}
          </>
        )}
      </div>
    </div>
  );
};

export default AirportAnalytics;