// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme'; // <-- IMPORT THEME
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext'; // <-- IMPORT

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      {/* --- WRAP THE APP WITH THE NOTIFICATION PROVIDER --- */}
      <NotificationProvider>
        <ChakraProvider theme={theme}>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <App />
          </BrowserRouter>
        </ChakraProvider>
      </NotificationProvider>
      {/* ---------------------------------------------------- */}
    </AuthProvider>
  </React.StrictMode>,
);