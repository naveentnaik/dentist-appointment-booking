import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import AdminDashboard from './AdminDashboard';  
import CustomerDashboard from './PatientDashboard';
import './App.css';
import Dentist from './Dentist';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('admin');
  
  // Check if user is logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  
  const handleLogin = (email, role, token,user_id) => {
    setIsAuthenticated(true);
    setUserRole(role);
    return true; 
  };
  
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('user_id');

    // Reset state
    setIsAuthenticated(false);
    setUserRole('');
  };
  
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? 
            <Navigate to={`/${userRole}`} replace /> : 
            <Login onLogin={handleLogin} />
        } />
        
        <Route path="/admin" element={
          isAuthenticated && userRole === 'admin' ? 
            <AdminDashboard onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
        } />
        
        <Route path="/customer" element={
          isAuthenticated && userRole === 'customer' ? 
            <CustomerDashboard onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
        } />
        
        <Route path="/dentist" element={
          isAuthenticated && userRole === 'dentist' ? 
            <Dentist onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
        } />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;