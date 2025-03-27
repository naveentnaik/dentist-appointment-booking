import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import api from './api/api';

const SignUp = ({ onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }
  
    try {
      const response = await api.post("http://localhost:5000/api/signup", {
        fullName,
        email,
        username,
        password
      });
  
      console.log(response, "signup");
  
      alert('Signup successful! Please log in.');
      onSwitchToLogin();
  
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message); 
      } else {
        setError('Signup failed. Please check your information.');
      }
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <h1>LOGO</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group half-width">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="form-group half-width">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group half-width">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              I accept terms & condition
            </label>
          </div>

          <div className="form-row form-footer">
            <button 
              type="button" 
              className="login-link-button"
              onClick={onSwitchToLogin}
            >
              Already have an account? Login
            </button>
            <button 
              type="submit" 
              className="signup-button"
              disabled={!termsAccepted}
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await api.post("http://localhost:5000/api/login", {
        email: username,
        password: password
      });
      
      console.log(response, "login");
      
      const { role, token, user_id } = response.data;

      console.log(user_id);
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', username);
      localStorage.setItem('userId', user_id);

      onLogin(username, role, token, user_id);
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials.');
    }
  };

  if (showSignUp) {
    return <SignUp onSwitchToLogin={() => setShowSignUp(false)} />;
  }

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
            <a
              href="#"
              className="form-link"
              onClick={(e) => {
                e.preventDefault();
                setShowSignUp(true);
              }}
            >
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;