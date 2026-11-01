import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ModeThemeProvider } from './context/ModeThemeContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ModeThemeProvider>
        <App />
      </ModeThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
