
import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import HomePage from "./pages/Home";
import Test from "./pages/Test"

import "tabler-react/dist/Tabler.css";


function App(props: Props): React.Node {
  return (
      <Router>
        <Switch>
          <Route exact path="/"><HomePage/></Route>
          <Route exact path="/test"><Test/></Route>
        </Switch>
      </Router>
  );
}

export default App;
