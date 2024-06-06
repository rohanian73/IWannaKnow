import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="824050971179-1nos77hsc8du6uvv39r9c2dh7u36ug5a.apps.googleusercontent.com">
    {/* <React.StrictMode> */}
      <App />
    {/* </React.StrictMode> */}
  </GoogleOAuthProvider>
);

reportWebVitals();
