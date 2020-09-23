
import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import HomePage from "./pages/Home";
import Machine from "./pages/Machine"

import "tabler-react/dist/Tabler.css";

import { DrizzleContext } from "@drizzle/react-plugin";
import { Drizzle } from "@drizzle/store";

import drizzleOptions from "./drizzleOptions";

const drizzle = new Drizzle(drizzleOptions);

type Props = {||};

function App(props: Props): React.Node {
  return (
    <DrizzleContext.Provider drizzle={drizzle}>
      <DrizzleContext.Consumer>
        {drizzleContext => {
          const { drizzle, drizzleState, initialized } = drizzleContext;
          if (!initialized) {
            return "Loading..."
          }
          return (
              <Router>
                <Switch>
                  <Route exact path="/"><HomePage/></Route>
                  <Route exact path="/:machine"><Machine drizzle={drizzle} drizzleState={drizzleState}/></Route>
                </Switch>
              </Router>
          )
        }}
      </DrizzleContext.Consumer>
    </DrizzleContext.Provider>
  );
}

export default App;
