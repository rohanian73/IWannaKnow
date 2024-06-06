import react, { useState, useRef, useEffect } from "react";

import axios from "axios";

import Login from "./components/login";
import ForgotPassword from "./components/forgotPassword";
import ResetPassword from "./components/resetPassword";

import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/forgotPassword" element={<ForgotPassword />} />
          <Route
            exact
            path="/resetPassword/:id/:token"
            element={<ResetPassword />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
