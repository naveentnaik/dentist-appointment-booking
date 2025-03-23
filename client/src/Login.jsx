import React,  {   useState } from 'react';
import axios from 'axios';
import './Login.css';
import api from './api/api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await api.post("http://localhost:5000/api/login", {
        email: username,
        password: password
      });
      
      console.log(response, "login");
      
      const { role, token ,user_id} = response.data;

      console.log(user_id)
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', username);
      localStorage.setItem('userId', user_id);

      onLogin(username, role, token,user_id);
      
      // if (role === 'admin') {
      //   navigate('/admin');
      // } else if (role === 'customer') {
      //   navigate('/customer');
      // } else {
      //   navigate('/dentist');
      // }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <h1 className="logo-text">LOGO</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>
          
          <div className="form-footer">
            <a href="#" className="form-link">
              Forgot password
            </a>
            <a href="#" className="form-link">
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;