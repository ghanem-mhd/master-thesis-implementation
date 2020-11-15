// @flow

import * as React from "react";

import { Grid, Card, Button } from "tabler-react";

import AddressInput from "../utilities/AddressInput";
import { store } from "react-notifications-component";
import Misc from "../utilities/Misc";

class AuthorizeParty extends React.Component {
  partyAddressInputRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      party: "process",
      inputValidity: {
        partyAddress: false,
      },
    };
    this.initialState = this.state;
  }

  resetInputs() {
    var partyAddressInput = this.partyAddressInputRef.current;
    partyAddressInput.resetInput();
    this.setState(this.initialState);
  }

  onAuthorizeButtonClicked(e) {
    var partyAddressInput = this.partyAddressInputRef.current;
    var partyAddress = partyAddressInput.state.addressInputState.value;

    var methodName = null;
    if (this.state.party.toString() === "process") {
      methodName = "authorizeProcess";
    } else {
      methodName = "authorizeMaintainer";
    }

    Misc.getCurrentAccount(this.props.web3, (error, account) => {
      if (error) {
        Misc.showAccountNotConnectedNotification(store);
      } else {
        this.props.MachineContract.methods[methodName](partyAddress)
          .send({
            from: account,
            gas: process.env.REACT_APP_DEFAULT_GAS,
            gasPrice: process.env.REACT_APP_GAS_PRICE,
          })
          .on("transactionHash", (hash) => {
            this.notificationID = Misc.showTransactionHashMessage(store, hash);
            this.resetInputs();
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

  onPartyAddressValidityChanged(valid) {
    var inputValidity = {};
    inputValidity.partyAddress = valid;
    this.setState({ inputValidity });
  }

  handleChange(e) {
    this.setState({ party: e.target.value });
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title="Authorize New Process" isCollapsible>
            <Card.Body>
              <AddressInput
                label="Process Smart Contract Address"
                showDIDMethod={false}
                web3={this.props.web3}
                onAddressValidityChanged={this.onPartyAddressValidityChanged.bind(
                  this
                )}
                ref={this.partyAddressInputRef}
              />
            </Card.Body>
            <Card.Footer>
              <div align="right">
                <Button
                  disabled={!this.state.inputValidity.partyAddress}
                  onClick={this.onAuthorizeButtonClicked.bind(this)}
                  color="primary"
                >
                  Authorize
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default AuthorizeParty;
