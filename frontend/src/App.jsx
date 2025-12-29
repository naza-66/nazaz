import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import io from 'socket.io-client';
import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const socket = io(BACKEND_URL);

const AirplaneMap = ({ seats, onSeatClick, isAdminView }) => (
  <div className="plane-scroll-container">
    <svg width="2200" height="300" viewBox="0 0 2200 300">
      <rect x="0" y="20" width="2200" height="260" rx="130" fill="#f5f6fa" />
      {seats.map((seat, index) => {
        const row = Math.floor(index / 6);
        const col = index % 6;
        const xPos = 150 + row * 40;
        const yPos = 55 + col * 35 + (col > 2 ? 25 : 0);
        return (
          <g key={seat.id} onClick={() => !isAdminView && onSeatClick(seat)} style={{ cursor: 'pointer' }}>
            <rect x={xPos} y={yPos} width="28" height="28" rx="6" 
                  fill={seat.status === 'available' ? '#44bd32' : seat.status === 'pending' ? '#fbc531' : '#e84118'} />
            <text x={xPos+14} y={yPos+18} fontSize="9" textAnchor="middle" fill="white">{seat.id}</text>
          </g>
        );
      })}
    </svg>
  </div>
);

function App() {
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    socket.on('update_seats', (data) => setSeats(data));
    return () => socket.off('update_seats');
  }, []);

  return (
    <Router>
      <nav style={{ padding: '20px', textAlign: 'center' }}>
        <Link to="/" style={{ color: 'white', marginRight: '20px' }}>Passager</Link>
        <Link to="/admin" style={{ color: 'white' }}>Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={
          <div className="page">
            <h2 style={{ textAlign: 'center' }}>Réserver un siège</h2>
            <AirplaneMap seats={seats} onSeatClick={(s) => socket.emit('request_seat', s.id)} isAdminView={false} />
          </div>
        } />
        <Route path="/admin" element={
          <div className="page admin-layout" style={{ display: 'flex', gap: '20px' }}>
            <div className="sidebar" style={{ width: '300px', background: '#252545', padding: '15px' }}>
              <h3>Demandes</h3>
              {seats.filter(s => s.status === 'pending').map(s => (
                <div key={s.id} className="admin-card">
                  Siège {s.id} 
                  <button onClick={() => socket.emit('admin_decision', { seatId: s.id, approved: true })}>V</button>
                  <button onClick={() => socket.emit('admin_decision', { seatId: s.id, approved: false })}>X</button>
                </div>
              ))}
            </div>
            <AirplaneMap seats={seats} isAdminView={true} />
          </div>
        } />
      </Routes>
    </Router>
  );
}
export default App;