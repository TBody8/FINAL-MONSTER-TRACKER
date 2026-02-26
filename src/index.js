import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import QuickAdd from "./components/QuickAdd";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Intercept routing for PWA shortcuts
const urlParams = new URLSearchParams(window.location.search);
const quickAddDrinkId = urlParams.get('quickadd');

if (quickAddDrinkId) {
  root.render(
    <React.StrictMode>
      <QuickAdd drinkId={quickAddDrinkId} />
    </React.StrictMode>,
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
