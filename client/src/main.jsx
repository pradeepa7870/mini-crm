import React from 'react'; import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; import { CssBaseline } from '@mui/material';
import App from './App.jsx'; import { AuthProvider } from './auth.jsx';
createRoot(document.getElementById('root')).render(<BrowserRouter><CssBaseline /><AuthProvider><App /></AuthProvider></BrowserRouter>);
