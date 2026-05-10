import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Parse configuration from URL query parameters
// Clients embed via: <iframe src="https://your-domain.com?apiKey=...&encryptionKey=...&email=..." />
const params = new URLSearchParams(window.location.search);
const apiKey = params.get('apiKey') || undefined;
const encryptionKey = params.get('encryptionKey') || undefined;
const email = params.get('email') || undefined;
const callbackUrl = params.get('callbackUrl') || undefined;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      apiKey={apiKey}
      encryptionKey={encryptionKey}
      email={email}
      callbackUrl={callbackUrl}
    />
  </StrictMode>,
)
