
import React from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";

import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Portfolio from "./Pages/Portfolio";

import "./App.css";

function App() {
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "portfolio",
        element: <Portfolio />,
      },
    ],
  },
]);

export default App;
