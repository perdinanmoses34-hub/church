import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './utils/confirmDialog';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Global PWA BeforeInstallPrompt listener for reliable in-app desktop/mobile installation
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('cms_pwa_prompt_ready'));
  });

  window.addEventListener('appinstalled', () => {
    (window as any).deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('cms_pwa_installed'));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

