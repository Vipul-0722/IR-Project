import logo from './logo.svg';
import './App.css';
import AirportDataExplorer from './components/airport';
import AirportAnalytics from './components/airportAnalytics';
import AirportDashboard from './components/Dashboard';

function App() {
  return (
    <div className="App">
        <AirportDashboard></AirportDashboard>
      {/* <AirportDataExplorer></AirportDataExplorer>
      <AirportAnalytics></AirportAnalytics> */}
    </div>
  );
}

export default App;
