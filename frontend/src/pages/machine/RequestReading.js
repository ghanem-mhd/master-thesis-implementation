// @flow

import * as React from "react";

import { Grid, Card, Button, Form } from "tabler-react";

import { store } from "react-notifications-component";
import Misc from "../utilities/Misc";

class RequestReading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      readingType: null,
    };
    this.initialState = this.state;
  }

  resetInputs() {
    var partyAddressInput = this.partyAddressInputRef.current;
    partyAddressInput.resetInput();
    this.setState(this.initialState);
  }

  onRequestButtonClicked(e) {
    var readingType = this.state.readingType;

    Misc.getCurrentAccount(this.props.web3, (error, account) => {
      if (error) {
        Misc.showAccountNotConnectedNotification(store);
      } else {
        this.props.MachineContract.methods["getNewReading"](readingType)
          .send({
            from: account,
            gas: process.env.REACT_APP_DEFAULT_GAS,
            gasPrice: process.env.REACT_APP_GAS_PRICE,
          })
          .on("transactionHash", (hash) => {
            this.notificationID = Misc.showTransactionHashMessage(store, hash);
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

  handleChange(e) {
    this.setState({ readingType: e.target.value });
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card
            title="Request New Reading"
            isFullscreenable
            isClosable
            isCollapsible
          >
            <Card.Body>
              <Form.Group label="Reading Type">
                <Form.SelectGroup onChange={this.handleChange.bind(this)}>
                  <Form.SelectGroupItem
                    name="size"
                    label="Temperature"
                    value="0"
                  />
                  <Form.SelectGroupItem
                    name="size"
                    label="Humidity"
                    value="1"
                  />
                  <Form.SelectGroupItem
                    name="size"
                    label="Air Pressure"
                    value="2"
                  />
                  <Form.SelectGroupItem
                    name="size"
                    label="Gas Resistance"
                    value="3"
                  />
                  <Form.SelectGroupItem
                    name="size"
                    label="Brightness"
                    value="4"
                  />
                </Form.SelectGroup>
              </Form.Group>
            </Card.Body>
            <Card.Footer>
              <div align="right">
                <Button
                  size="sm"
                  disabled={this.state.readingType == null}
                  onClick={this.onRequestButtonClicked.bind(this)}
                  color="primary"
                >
                  Request
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default RequestReading;
