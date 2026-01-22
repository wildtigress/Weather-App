import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'; // Fixes 'Provider' is not defined
import { store } from './store/store'; // Fixes 'store' is not defined
import { GoogleOAuthProvider } from '@react-oauth/google'; // Fixes 'GoogleOAuthProvider'
import App from './App'; // Fixes 'App' is not defined

// Fixes 'root' is not defined by properly initializing it
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="954607601459-10fudbuhq3drsnmu2otoc66kfmd70ph2.apps.googleusercontent.com">
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);