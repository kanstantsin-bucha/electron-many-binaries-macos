import React from 'react';
import * as ReactDOM from 'react-dom/client';
import MyApp from './MyApp'

const rootElement = document.getElementById('root');
console.log(`rootElement ${rootElement}`);
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  const element = (
    <React.StrictMode>
    <MyApp />
    </React.StrictMode>
  );
  
  root.render(element);
}
