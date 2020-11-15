// @flow

import * as React from "react";

import { Grid, Card, Button } from "tabler-react";

import AddressInput from "../utilities/AddressInput";
import { store } from "react-notifications-component";
import Misc from "../utilities/Misc";

class StartProcess extends React.Component {
  addressInputRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      startDisabled: true,
    };
  }

  resetInput() {
    this.addressInputRef.current.resetInput();
    this.setState({ startDisabled: true });
  }

  onStartClicked(e) {
    var addressInput = this.addressInputRef.current;
    var productDID = addressInput.state.addressInputState.value;
    Misc.getCurrentAccount(this.props.web3, (error, account) => {
      if (error) {
        Misc.showAccountNotConnectedNotification(store);
      } else {
        this.props.ProcessContract.methods["startProcess"](productDID)
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

  onAddressValidityChanged(valid) {
    this.setState({ startDisabled: !valid });
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title="Start Process" isCollapsible>
            <Card.Body>
              <AddressInput
                label="Product DID"
                showDIDMethod={true}
                web3={this.props.web3}
                onAddressValidityChanged={this.onAddressValidityChanged.bind(
                  this
                )}
                ref={this.addressInputRef}
              />
            </Card.Body>
            <Card.Footer>
              <div align="right">
                <Button
                  disabled={this.state.startDisabled}
                  onClick={this.onStartClicked.bind(this)}
                  color="primary"
                >
                  Start
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default StartProcess;
