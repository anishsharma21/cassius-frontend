import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PostHogWrapper from './components/PostHogWrapper.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogWrapper>
      <App />
    </PostHogWrapper>
  </StrictMode>
)
