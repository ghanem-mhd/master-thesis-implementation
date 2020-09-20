// @flow

import * as React from "react";
import {Page} from "tabler-react";

import MyComponent from "./MyComponent";
import SiteWrapper from "./SiteWrapper.react";


class Test extends React.Component {
    render() {
        return (
          <SiteWrapper>
            <Page.Content title="Test">
              <MyComponent drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} />
            </Page.Content>
          </SiteWrapper>
        );
    }
}

export default Test;
