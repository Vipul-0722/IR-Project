
import React, { useState, useEffect } from 'react';
import './AirportDataExplorer.css';
import axios from "axios"
import SearchBox from './searchBox';
function AirportDataExplorer() {
  // State for search, sort, and pagination
  const [airports, setAirports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAirports, setTotalAirports] = useState(0);
  const [highElevationAirports, setHighElevationAirports] = useState(0);
  const [countriesRepresented, setCountriesRepresented] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 13;
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    icaoCode: '',
    iataCode: '',
    airportName: '',
    city: '',
    countryCode: '',
    elevation: '',
    timezone: '',
    latitude: '',
    longitude: '',
    state: ''
  });

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);

    try {
        const response = await axios.post('http://api.api.d6d7c75.kyma.ondemand.com/airports/add', formData);
    
        if (response.status === 201) {
           console.log("Airport Added successfully")
        } else {
          console.error('Failed to add airport:', response.data?.error || 'Unknown error');
        }
        closeModal();
    
        setFormData({
          icaoCode: '',
          iataCode: '',
          airportName: '',
          city: '',
          countryCode: '',
          elevation: '',
          timezone: '',
          latitude: '',
          longitude: '',
          state:''
        });


      } catch (err) {
        console.error('Error calling API:', err.response?.data || err.message);
      }
   
  };

  const fetchAirports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://api.api.d6d7c75.kyma.ondemand.com/airports/search`, {
        params: {
          query: searchTerm,
          page: currentPage,
          limit: itemsPerPage,
          sort: sortField,
          order: sortDirection
        }
      });
      setAirports(response.data.data);
      setTotalPages(Math.ceil(response.data.totalResults / itemsPerPage));
  
      //Fetch stats separately or from the same response if available
      fetchStats();
    } catch (error) {
      console.error('Error fetching airport data:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchStats = async () => {
    try {
      const response = await axios.get('http://api.api.d6d7c75.kyma.ondemand.com/airports/stats');
      const data = response.data;
  
      setTotalAirports(data.total);
      setHighElevationAirports(data.highElevation);
      setCountriesRepresented(data.countries);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchAirports();
  }, [searchTerm, sortField, sortDirection, currentPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleSearch = (query) => {
    setPage(1); // Reset to first page on new search
    setSearchTerm(query)
    fetchAirports(query, 1);
  };
  

  const handleSortChange = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); 
  };


  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const formatAirportData = (airport) => {
    const source = airport._source;
    return {
      icao: source.icao,
      iata: source.iata,
      name: source.name,
      city: source.city,
      country: source.country,
      region: source.region,
      elevation: source.elevation,
      tz: source.tz,
      lat: source.lat?.toFixed(2),  // Fixing to 6 decimal places
      lon: source.lon?.toFixed(2)
    };
  };

  const getElevationColor = (elevation) => {
    if (elevation > 8000) return '#f87171'; // red
    // if (elevation > 5000) return '#fde68a'; // orange
    // if (elevation > 2000) return '#bbf7d0'; // yellow
  };

  return (
    <div className="airport-explorer">
      {/* <header className="header">
        <h1>Airport Data Explorer</h1>
        <p>Browse, filter, and manage airport data worldwide</p>
      </header> */}

      <main className="main-content">
        {/* Search and filters */}
        <div className="search-filter-container">
          <div className="search-filter-inner">


          <SearchBox onSearch={handleSearch} />
            {/* <div className="search-box">
              <label>Search Airports</label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div> */}
           
            <div className="sort-box">
            <div className="label-input-group">
            <label htmlFor="sort-select">Sort By</label>
              <select
                value={sortField}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="icao">ICAO</option>
                <option value="iata">IATA</option>
                <option value="city">City</option>
                <option value="country">Country</option>
                <option value="elevation">Elevation</option>
              </select>
              </div>
            </div>
            
           
            <div className="order-box">
            <div className="label-input-group">
            <label htmlFor="order-select">Order By</label>
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
              >
          
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
              </div>
            </div>
           
            
            <div className="add-button-container" >
              <button className="add-button" onClick={openModal}>Add New Airport</button>
            </div>
       
          </div>

       
        </div>

       {/* <div style={{display:"flex", justifyContent:"end"}}>
        <div className="search-boxe">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div> 

            </div> */}

        {/* Statistics cards */}
        <div className="stats-container">
          <div className="stat-card">
            <h2>Total Airports</h2>
            <p className="stat-value total">{totalAirports.toLocaleString()}</p>
          </div>
          
          <div className="stat-card">
            <h2>High Elevation Airports</h2>
            <p className="stat-value elevation">{highElevationAirports.toLocaleString()}</p>
          </div>
          
          <div className="stat-card">
            <h2>Countries Represented</h2>
            <p className="stat-value countries">{countriesRepresented.toLocaleString()}</p>
          </div>
        </div>

        {/* Data table */}
        <div className="table-container">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <table className="airport-table">
              <thead>
                <tr>
                  <th onClick={() => handleSortChange('icao')}>ICAO</th>
                  <th onClick={() => handleSortChange('iata')}>IATA</th>
                  <th onClick={() => handleSortChange('name')}>NAME</th>
                  <th onClick={() => handleSortChange('city')}>CITY</th>
                  <th onClick={() => handleSortChange('country')}>COUNTRY</th>
                  <th onClick={() => handleSortChange('region')}>REGION</th>
                  <th onClick={() => handleSortChange('elevation')}>ELEVATION (FT)</th>
                  <th onClick={() => handleSortChange('timezone')}>TIMEZONE</th>
                  <th onClick={() => handleSortChange('lng')}>LNG</th>
                  <th onClick={() => handleSortChange('lat')}>LAT</th>
                
                </tr>
              </thead>
              <tbody>
                {airports?.map((airport) => {
                  const formattedAirport = formatAirportData(airport);
                  return (
                    <tr 
                       style={{ backgroundColor: getElevationColor(formattedAirport.elevation) }}
                      key={formattedAirport.icao} 
                      className={formattedAirport.elevation > 8000 ? 'high-elevation' : ''}
                    >
                      <td>{formattedAirport.icao}</td>
                      <td>{formattedAirport.iata}</td>
                      <td>{formattedAirport.name}</td>
                      <td>{formattedAirport.city}</td>
                      <td>
                        {formattedAirport.country} {" - "}
                        <img 
                             src={`https://flagcdn.com/16x12/${formattedAirport.country.toLowerCase()}.png`} 
                             alt={`${formattedAirport.country} flag`}  
                        />

                      </td>
                      <td>{formattedAirport.region}</td>
                      <td>{formattedAirport.elevation.toLocaleString()}</td>
                      <td>{formattedAirport.tz}</td>
                      <td>{formattedAirport.lat}</td>
                      <td>{formattedAirport.lon}</td>
                    
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          
          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalAirports)} of {totalAirports} results
            </div>
            <div className="pagination-controls">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={currentPage === 1 ? "disabled" : ""}
              >
                &lt; Prev
              </button>
              <span className="page-indicator">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={currentPage === totalPages ? "disabled" : ""}
              >
                Next &gt;
              </button>
            </div>
          </div>


          {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 style={{marginBottom:"20px"}}>Add New Airport</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="icaoCode">ICAO Code</label>
                    <input
                      type="text"
                      id="icaoCode"
                      name="icaoCode"
                      value={formData.icaoCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="iataCode">IATA Code</label>
                    <input
                      type="text"
                      id="iataCode"
                      name="iataCode"
                      value={formData.iataCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="airportName">Airport Name</label>
                    <input
                      type="text"
                      id="airportName"
                      name="airportName"
                      value={formData.airportName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                  
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="countryCode">Country Code</label>
                    <input
                      type="text"
                      id="countryCode"
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="elevation">Elevation (ft)</label>
                    <input
                      type="number"
                      id="elevation"
                      name="elevation"
                      value={formData.elevation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="timezone">Timezone</label>
                    <input
                      type="text"
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      type="text"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      type="text"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="modal-buttons">
                  <button type="button" className="cancel-button" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    Add Airport
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

export default AirportDataExplorer;