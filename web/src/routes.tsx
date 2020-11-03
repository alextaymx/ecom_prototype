import * as React from "react";
import { Route } from "react-router-dom";
import Register from "./pages/Register";

export default [
  // <Route exact path="/configuration" render={() => <Configuration />} />,
  <Route exact path="/register" render={() => <Register />} noLayout />,
];
