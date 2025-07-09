import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

// Import Quasar Design System CSS
import '@shared/styles/css/index.css';

// Initialize i18n
import './i18n';

import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
