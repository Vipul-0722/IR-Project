import React, { useState } from 'react';
import { Menu, Search, BarChart2, Plus, Filter } from 'lucide-react';
import AirportDataExplorer from './airport';
import AirportAnalytics from './airportAnalytics';
import './AirportDashboard.css';

const AirportDashboard = () => {
  const [activePage, setActivePage] = useState('explorer');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    setShowSortModal(false);
    // You would pass these to your main component
  };

  const SortModal = () => (
    <div className="sort-modal-overlay">
      <div className="sort-modal">
        <div className="sort-modal-header">
          <h3>Sort</h3>
          <button className="reset-button" onClick={() => {
            setSortField('name');
            setSortDirection('asc');
          }}>Reset</button>
        </div>
        
        <div className="sort-modal-section">
          <h4>Sort Order</h4>
          <div className="sort-options">
            <label className="sort-option">
              <input 
                type="radio" 
                checked={sortDirection === 'asc'} 
                onChange={() => setSortDirection('asc')}
              />
              <span>Ascending</span>
            </label>
            <label className="sort-option">
              <input 
                type="radio" 
                checked={sortDirection === 'desc'} 
                onChange={() => setSortDirection('desc')} 
              />
              <span>Descending</span>
            </label>
          </div>
        </div>
        
        <div className="sort-modal-section">
          <h4>Sort By</h4>
          <div className="sort-options">
            <label className="sort-option">
              <input 
                type="radio" 
                checked={sortField === 'name'} 
                onChange={() => setSortField('name')}
              />
              <span>Name</span>
            </label>
            <label className="sort-option">
              <input 
                type="radio" 
                checked={sortField === 'icao'} 
                onChange={() => setSortField('icao')}
              />
              <span>ICAO</span>
            </label>
            <label className="sort-option">
              <input 
                type="radio" 
                checked={sortField === 'elevation'} 
                onChange={() => setSortField('elevation')}
              />
              <span>Elevation</span>
            </label>
          </div>
        </div>
        
        <div className="sort-modal-footer">
          <button 
            onClick={() => setShowSortModal(false)}
            className="cancel-button"
          >
            Cancel
          </button>
          <button 
            onClick={() => handleSortChange(sortField, sortDirection)}
            className="ok-button"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!isSidebarCollapsed && <h1 className="sidebar-title">Airlytics</h1>}
          <button onClick={toggleSidebar} className="sidebar-toggle">
            <Menu size={20} />
          </button>
        </div>
        
        <div className="sidebar-nav">
          <nav>
            <button 
              onClick={() => setActivePage('explorer')}
              className={`nav-item ${activePage === 'explorer' ? 'active' : ''}`}
            >
              <Search size={20} />
              {!isSidebarCollapsed && <span className="nav-text">Explorer</span>}
            </button>
            
            <button 
              onClick={() => setActivePage('analytics')}
              className={`nav-item ${activePage === 'analytics' ? 'active' : ''}`}
            >
              <BarChart2 size={20} />
              {!isSidebarCollapsed && <span className="nav-text">Analytics</span>}
            </button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Top Navigation Bar */}
        <header className="top-header">
          <div className="header-container">
            <h1 className="page-title">
              {activePage === 'explorer' ? 'Airport Data Explorer' : 'Airport Data Analytics'}
            </h1>
            
            {/* <div className="header-actions">
              {activePage === 'explorer' && (
                <>
                  <button 
                    onClick={() => setShowSortModal(true)}
                    className="filter-button"
                  >
                    <Filter size={16} className="button-icon" />
                    <span>Sort & Filter</span>
                  </button>
                  
                  <button className="add-button">
                    <Plus size={16} className="button-icon" />
                    <span>Add Airport</span>
                  </button>
                </>
              )}
            </div> */}
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="content-area">
          {activePage === 'explorer' ? <AirportDataExplorer /> : <AirportAnalytics />}
        </main>
      </div>
      
      {/* Sort Modal */}
      {showSortModal && <SortModal />}
    </div>
  );
};

export default AirportDashboard;