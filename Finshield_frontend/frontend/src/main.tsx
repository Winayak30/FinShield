import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppContent } from './App';
import { FinShieldProvider } from './context/FinShieldContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FinShieldProvider>
      <AppContent />
    </FinShieldProvider>
  </React.StrictMode>
);

