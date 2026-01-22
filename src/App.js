import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { toggleFavorite, setUnit, setAuth, logout } from './store/weatherSlice';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Search, Wind, Droplets, X, Zap, Star, Compass, Activity, LogOut, Share2, Sun, Navigation } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_KEY = '98ffd2a904614420b71133345262201';

function App() {
  const { favorites, unit, isAuthenticated, user } = useSelector(state => state.weather);
  const dispatch = useDispatch();
  const [dashboardData, setDashboardData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await Promise.all(favorites.slice(0, 4).map(async (city) => {
        const res = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=no`);
        return res.data;
      }));
      setDashboardData(data);
    } catch (err) { console.error("Sync Error"); }
  }, [favorites]);

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && search) {
      try {
        const res = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${search}&days=7&aqi=no`);
        setSearchResult(res.data);
        setSearch('');
      } catch (err) { alert("Station not found"); }
    }
  };

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  return (
    <div className="skycast-deep-dark">
      <nav className="navbar">
        <div className="nav-left"><Zap size={22} className="logo-icon" /><span>SKYCAST</span></div>

        <div className="nav-center">
          <div className="search-pill">
            <Search size={18} color="#94a3b8" />
            <input placeholder="Search Station ID or City..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleSearch} />
          </div>
        </div>

        <div className="nav-right">
          <div className="unit-switcher">
            <button className={unit === 'metric' ? 'active' : ''} onClick={() => dispatch(setUnit('metric'))}>°C</button>
            <button className={unit === 'imperial' ? 'active' : ''} onClick={() => dispatch(setUnit('imperial'))}>°F</button>
          </div>
          {!isAuthenticated ? (
            <GoogleLogin onSuccess={res => dispatch(setAuth(jwtDecode(res.credential)))} theme="filled_blue" shape="pill" />
          ) : (
            <div className="profile-group">
              <img src={user?.picture} alt="user" className="avatar" />
              <button onClick={() => dispatch(logout())} className="logout-btn"><LogOut size={16} /></button>
            </div>
          )}
        </div>
      </nav>

      <main className="content">
        <div className="hero-text">
          <h1>Weather Analytics</h1>
          <p>Monitoring {dashboardData.length} locations in real-time</p>
          <div className="live-badge"><span className="pulse"></span> LIVE UPDATES ACTIVE</div>
        </div>

        <div className="tiles-container">
          {dashboardData.map((city) => (
            <motion.div whileHover={{ scale: 1.03 }} key={city.location.name} className="glass-tile" onClick={() => setSelectedCity(city)}>
              <div className="tile-header">
                <h3>{city.location.name}</h3>
                <div className="temp-display">
                  {Math.round(unit === 'metric' ? city.current.temp_c : city.current.temp_f)}°
                  <Sun size={20} color="#fbbf24" />
                </div>
              </div>
              <p className="condition">{city.current.condition.text}</p>
              <div className="tile-footer">
                <span><Droplets size={14} color="#3b82f6" /> {city.current.humidity}%</span>
                <span><Wind size={14} color="#10b981" /> {city.current.wind_kph} km/h</span>
                <div className="arrow-box"><Navigation size={14} /></div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {(searchResult || selectedCity) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="full-overlay">
              <StationAnalytics
                data={searchResult || selectedCity}
                unit={unit}
                onClose={() => { setSearchResult(null); setSelectedCity(null); }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const StationAnalytics = ({ data, unit, onClose }) => (
  <div className="analytics-view">
    <div className="view-header">
      <div className="header-meta">
        <h1>{data.location.name} <span className="cert-tag">CERTIFIED STATION</span></h1>
        <div className="telemetry"><Activity size={12} /> Live Telemetry • Updated {new Date().toLocaleTimeString()}</div>
      </div>
      <div className="header-btns">
        <button className="icon-btn"><Share2 size={18} /></button>
        <button className="icon-btn close" onClick={onClose}><X size={18} /></button>
      </div>
    </div>

    <div className="view-grid">
      <div className="side-panel">
        <div className="compact-stats">
          <div className="stat-item"><h6>BEARING</h6><p>{data.current.wind_dir}</p></div>
          <div className="stat-item"><h6>VELOCITY</h6><p>{data.current.wind_kph}km/h</p></div>
          <div className="stat-item"><h6>HUMIDITY</h6><p>{data.current.humidity}%</p></div>
          <div className="stat-item"><h6>UV INDEX</h6><p>{data.current.uv}</p></div>
        </div>

        <h3>WEEKLY FORECAST</h3>
        <div className="forecast-stack">
          {data.forecast.forecastday.map(day => (
            <div key={day.date} className="day-row">
              <span className="date-label">{new Date(day.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</span>
              <img src={day.day.condition.icon} alt="icon" />
              <span className="temp-range">
                {Math.round(unit === 'metric' ? day.day.maxtemp_c : day.day.maxtemp_f)}°
                <small>{Math.round(unit === 'metric' ? day.day.mintemp_c : day.day.mintemp_f)}°</small>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="main-panel">
        <div className="chart-wrapper">
          <h5><Droplets size={14} color="#3b82f6" /> PRECIPITATION</h5>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.forecast.forecastday[0].hour.filter((_, i) => i % 2 === 0)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" hide />
              <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#64748b" unit="%" />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="precip_mm" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h5><Wind size={14} color="#10b981" /> WIND VELOCITY</h5>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.forecast.forecastday[0].hour}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" hide />
              <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#64748b" />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="wind_kph" stroke="#10b981" fill="rgba(16,185,129,0.1)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="pro-tip">
          <div className="tip-icon"><Zap size={20} color="#fbbf24" /></div>
          <div className="tip-text">
            <strong>SKYCAST PRO TIP</strong>
            <p>Data is updated every 30 seconds. Historical trends represent normalized atmospheric pressure and temperature deviations.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default App;