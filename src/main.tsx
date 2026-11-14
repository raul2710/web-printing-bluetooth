import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { PrinterProvider } from './bluetooth/PrinterContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PrinterProvider>
      <App />
    </PrinterProvider>
  </React.StrictMode>
);
