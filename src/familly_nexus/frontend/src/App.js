import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Registration from "./components/Registration";
import Profile from "./components/Profile";

function App() {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Registration} />
          <Route path="/profile" component={Profile} />
          <Route path="/" component={Dashboard} />
        </Switch>
      </Layout>
    </Router>
  );
}

export default App;
