import * as React from "react";
import { Route } from "react-router-dom";
import Register from "./pages/Register";
import UserVerification from "./pages/users/UserVerification";
const routes = [
  // <Route exact path="/configuration" render={() => <Configuration />} />,
  <Route exact path="/register" render={() => <Register />} noLayout />,
  // <Route
  //   exact
  //   path="/users/verification/:token"
  //   render={(props) => <UserVerification {...props} />}
  // />,
  <Route
    exact
    path="/users/verification/:token"
    component={UserVerification}
    noLayout
  />,
  // <Route
  //   exact
  //   path="/users/verification/:token"
  //   render={(props) => <UserVerification {...props} />}
  //   noLayout
  // />,
];

export default routes;
