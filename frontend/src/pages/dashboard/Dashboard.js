// @flow

import * as React from "react";

import { Page } from "tabler-react";

class Dashboard extends React.Component {
  componentDidMount() {
    document.title = "Dashboard";
  }

  render() {
    return <Page.Content title="Dashboard"></Page.Content>;
  }
}

export default Dashboard;
