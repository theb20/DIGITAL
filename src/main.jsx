import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAnalytics } from "./firebase.js";

createRoot(document.getElementById('root')).render(
  
    <BrowserRouter>
      <StrictMode>
          <App />
      </StrictMode>
    </BrowserRouter>  
)
