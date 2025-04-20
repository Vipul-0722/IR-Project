import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Search.css';

const SearchBox = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return; 
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`http://api.api.d6d7c75.kyma.ondemand.com/airports/autocomplete?term=${encodeURIComponent(searchTerm)}`);
        setSuggestions(response.data.suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API calls
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    // Reset selected index when suggestions change
    setSelectedIndex(-1);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    onSearch(suggestion.name);
  };

  const handleKeyDown = (e) => {
    // Handle keyboard navigation
    if (suggestions.length > 0) {
      // Down arrow
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      }
      // Up arrow
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      }
      // Enter
      else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedIndex]);
      }
      // Escape
      else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    setShowSuggestions(false);
  };

  return (
    <div className="search-box-container" ref={searchRef}>
      <form  onSubmit={handleSubmit}>
        <div style={{display:"flex", gap:"10px"}}>
        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
            autoComplete="off"
          />
          {isLoading && <div className="search-spinner"></div>}
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                onClick={() => handleSuggestionClick(suggestion)}
                className={index === selectedIndex ? 'selected' : ''}
              >
                <div className="suggestion-content">
                  <span className="airport-name">{suggestion.name}</span>
                  <div className="airport-details">
                    {suggestion.city && <span  className="airport-city">{suggestion.city}</span>}
                    {/* {suggestion.iata && <span className="airport-code">{suggestion.iata}</span>} */}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <button type="submit" className="search-button">Search</button>
        </div>
      </form>
    </div>
  );
};

export default SearchBox;