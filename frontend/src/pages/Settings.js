// @flow

import * as React from "react";

import { store } from "react-notifications-component";

import { Page, Grid, Card, Form, Button } from "tabler-react";
import LocalStorage from "./utilities/LocalStorage";

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wsNetworkState: {
        value: LocalStorage.getItemFromLocalStorage(
          "wsNetwork",
          process.env.REACT_APP_WS_NETWORK
        ),
        invalid: false,
        valid: true,
        feedback: "",
      },
    };
  }

  componentDidMount() {
    document.title = "Settings";
  }

  onSaveClicked() {
    localStorage.setItem("wsNetwork", this.state.wsNetworkState.value);
    store.addNotification({
      title: "Success",
      message: "Settings Saved",
      type: "success",
      container: "bottom-right",
      dismiss: {
        duration: 3000,
        onScreen: true,
      },
    });
  }

  isValidHttpUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (e) {
      return false;
    }
    return url.protocol === "ws:";
  }

  handleChange(event) {
    let wsNetworkState = {};
    let value = event.target.value.trim();
    if (this.isValidHttpUrl(value)) {
      wsNetworkState.invalid = false;
      wsNetworkState.feedback = "";
    } else {
      wsNetworkState.invalid = true;
      wsNetworkState.feedback = "Invalid URL";
    }
    wsNetworkState.value = value;
    wsNetworkState.valid = !wsNetworkState.invalid;
    this.setState({ wsNetworkState });
  }

  render() {
    return (
      <Page.Content
        title="Settings"
        subTitle="Saved in the browser local storage"
      >
        <Grid.Row>
          <Grid.Col>
            <Card title="Settings Preferences">
              <Card.Body>
                <Form.Group label="Network WS URL">
                  <Form.Input
                    value={this.state.wsNetworkState.value}
                    invalid={this.state.wsNetworkState.invalid}
                    cross={this.state.wsNetworkState.invalid}
                    valid={this.state.wsNetworkState.valid}
                    tick={this.state.wsNetworkState.valid}
                    onChange={this.handleChange.bind(this)}
                    name="example-text-input"
                    placeholder="ws://example:23000/"
                  />
                </Form.Group>
              </Card.Body>
              <Card.Footer>
                <div align="right">
                  <Button
                    disabled={!this.state.wsNetworkState.valid}
                    onClick={this.onSaveClicked.bind(this)}
                    color="primary"
                  >
                    Save
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Grid.Col>
        </Grid.Row>
      </Page.Content>
    );
  }
}

export default Settings;
