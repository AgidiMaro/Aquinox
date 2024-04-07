import React from 'react';
import ReactDOM from 'react-dom/client';


import './index.scss';
import App from './App';
import Base from './audit-app/components/base/base';
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from './reportWebVitals';

import { Provider } from 'react-redux'
import { store } from './audit-app/state/store'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Base/>
    </Provider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
