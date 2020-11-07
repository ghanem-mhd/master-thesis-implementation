// @flow

import * as React from "react";

import { Grid, Card, Button, Form } from "tabler-react";

import { store } from "react-notifications-component";
import Misc from "../utilities/Misc";

class SaveMaintenanceOperation extends React.Component {
  infoInputRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      inputValidity: false,
      inputValue: null,
    };
  }

  resetInput() {
    Array.from(document.querySelectorAll(`[name=description]`)).forEach(
      (input) => (input.value = "")
    );
    this.setState({ inputValidity: false });
  }

  onSaveButtonClicked(e) {
    var MachineContract = this.props.contracts[this.props.machine];
    var description = this.state.inputValue;

    Misc.getCurrentAccount(this.props.web3, (error, account) => {
      if (error) {
        Misc.showAccountNotConnectedNotification(store);
      } else {
        MachineContract.methods["saveMaintenanceOperation"](description)
          .send({
            from: account,
            gas: process.env.REACT_APP_DEFAULT_GAS,
            gasPrice: process.env.REACT_APP_GAS_PRICE,
          })
          .on("transactionHash", (hash) => {
            this.notificationID = Misc.showTransactionHashMessage(store, hash);
            this.resetInput();
          })
          .on("confirmation", (confirmationNumber, receipt) => {
            store.removeNotification(this.notificationID);
          })
          .on("error", (error) => {
            store.removeNotification(this.notificationID);
            Misc.showErrorMessage(store, error.message);
            console.log(error);
          });
      }
    });
  }

  handleChange(event) {
    var newState = {};
    let value = event.target.value.trim();
    if (value === "") {
      newState.inputValidity = false;
    } else {
      newState.inputValidity = true;
      newState.inputValue = value;
    }
    this.setState(newState);
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title="Save Maintenance Operation" isCollapsible>
            <Card.Body>
              <Form.Group label="Description">
                <Form.Textarea
                  placeholder="Text..."
                  name="description"
                  onChange={this.handleChange.bind(this)}
                  rows={3}
                />
              </Form.Group>
            </Card.Body>
            <Card.Footer>
              <div align="right">
                <Button
                  disabled={!this.state.inputValidity}
                  onClick={this.onSaveButtonClicked.bind(this)}
                  color="primary"
                >
                  Save
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default SaveMaintenanceOperation;
