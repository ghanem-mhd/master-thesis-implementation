// @flow

import * as React from "react";
import {Page} from "tabler-react";

import { DrizzleContext } from "@drizzle/react-plugin";
import { Drizzle } from "@drizzle/store";

import drizzleOptions from "./drizzleOptions";
import MyComponent from "./MyComponent";
import SiteWrapper from "./SiteWrapper.react";

const drizzle = new Drizzle(drizzleOptions);

function Test() {
  return (
        <DrizzleContext.Provider drizzle={drizzle}>
          <DrizzleContext.Consumer>
            {drizzleContext => {
              const { drizzle, drizzleState, initialized } = drizzleContext;
              if (!initialized) {
                return "Loading..."
              }
              return (
                  <SiteWrapper>
                    <Page.Content title="Test">
                      <MyComponent drizzle={drizzle} drizzleState={drizzleState} />
                    </Page.Content>
                  </SiteWrapper>
              )
            }}
          </DrizzleContext.Consumer>
        </DrizzleContext.Provider>

  );
}

export default Test;
