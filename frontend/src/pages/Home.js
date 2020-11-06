// @flow

import * as React from "react";

import { Page } from "tabler-react";

class Home extends React.Component {
  componentDidMount() {
    document.title = "Home";
  }

  render() {
    return <Page.Content title="Home"></Page.Content>;
  }
}

export default Home;
