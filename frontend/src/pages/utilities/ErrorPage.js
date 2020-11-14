// @flow

import * as React from "react";

import { Page, Header, Grid } from "tabler-react";

class ErrorPage extends React.Component {
  render() {
    return (
      <Page.Content>
        <Grid.Row>
          <Grid.Col className="text-center">
            <Header.H1 className="display-5 text-muted mb-5">
              {"Oops! Something Went Wrong!"}
            </Header.H1>
            <Header.H2>{this.props.errorMessage}</Header.H2>
          </Grid.Col>
        </Grid.Row>
      </Page.Content>
    );
  }
}

export default ErrorPage;
