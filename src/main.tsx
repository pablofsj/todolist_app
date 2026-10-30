import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const container = document.getElementById('root');

// La app siempre arranca en Tareas, aunque el navegador restaure /acerca.
if (window.location.pathname !== '/tareas') window.history.replaceState(null, '', '/tareas');

const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
