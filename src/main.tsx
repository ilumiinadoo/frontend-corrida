import React from 'react'
import ReactDOM from 'react-dom/client'
import "./theme.css";
import "./index.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
