import App from "./components/app";
import ReactDOM from 'react-dom/client';
import React from 'react'; 


const appDiv = ReactDOM.createRoot(document.getElementById('app'))
appDiv.render(
    <App name = "Hershel"/>
)