import React from "react";
import ReactDOM from "react-dom";

import "./index.css";

import App from "./App";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.render(<App />, rootElement);
} else {
  throw new Error("Could not find root element to mount to!");
}
